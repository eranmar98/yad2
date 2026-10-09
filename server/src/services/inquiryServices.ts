import mongoose, { QueryFilter, Types } from 'mongoose';
import Inquiry, { IInquiry } from '../models/inquiry';
import Item from '../models/item';
import Message from '../models/message';

export type ChatRole = 'buyer' | 'seller';

type ChatUser = {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phone?: string;
};

type ChatItem = {
  _id: Types.ObjectId;
  title: string;
  price: number;
  images: string[];
  status: 'Active' | 'Sold';
  sellerId: ChatUser | null;
};

type LastMessage = { text: string; senderId: Types.ObjectId; createdAt: Date };

export type MessageDTO = {
  _id: string;
  text: string;
  createdAt: Date;
  isMine: boolean;
};

export type ConversationSummary = {
  _id: string;
  role: ChatRole;
  status: IInquiry['status'];
  item: { _id: string; title: string; price: number; image: string | null; status: string } | null;
  otherUser: { _id: string; firstName: string; lastName: string; avatarUrl?: string; phone?: string } | null;
  lastMessage: { text: string; createdAt: Date; isMine: boolean } | null;
  unreadCount: number;
  updatedAt: Date;
};

// The seller is reached through the item, so the item populate pulls the seller in too.
const ITEM_POPULATE = {
  path: 'itemId',
  select: 'title price images status sellerId',
  populate: { path: 'sellerId', select: 'firstName lastName avatarUrl' },
};
const BUYER_POPULATE = { path: 'userId', select: 'firstName lastName avatarUrl phone' };

function idOf(value: unknown): string {
  if (value && typeof value === 'object' && '_id' in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

function roleOf(inquiry: IInquiry, userId: Types.ObjectId): ChatRole | null {
  const item = inquiry.itemId as unknown as ChatItem | null;
  if (idOf(inquiry.userId) === String(userId)) return 'buyer';
  if (item?.sellerId && idOf(item.sellerId) === String(userId)) return 'seller';
  return null;
}

function toMessageDTO(
  message: { _id: unknown; text: string; senderId: unknown; createdAt: Date },
  userId: Types.ObjectId,
): MessageDTO {
  return {
    _id: String(message._id),
    text: message.text,
    createdAt: message.createdAt,
    isMine: idOf(message.senderId) === String(userId),
  };
}

function buildSummary(
  inquiry: IInquiry,
  role: ChatRole,
  userId: Types.ObjectId,
  lastMessage: LastMessage | null,
  unreadCount: number,
): ConversationSummary {
  const item = inquiry.itemId as unknown as ChatItem | null;
  const buyer = inquiry.userId as unknown as ChatUser | null;
  const other = role === 'buyer' ? item?.sellerId : buyer;

  return {
    _id: String(inquiry._id),
    role,
    status: inquiry.status,
    item: item
      ? {
          _id: String(item._id),
          title: item.title,
          price: item.price,
          image: item.images?.[0] ?? null,
          status: item.status,
        }
      : null,
    otherUser: other
      ? {
          _id: String(other._id),
          firstName: other.firstName,
          lastName: other.lastName,
          avatarUrl: other.avatarUrl,
          // Only the seller sees the buyer's phone, as on the old inquiries page.
          phone: role === 'seller' ? other.phone : undefined,
        }
      : null,
    lastMessage: lastMessage
      ? {
          text: lastMessage.text,
          createdAt: lastMessage.createdAt,
          isMine: idOf(lastMessage.senderId) === String(userId),
        }
      : null,
    unreadCount,
    updatedAt: lastMessage?.createdAt ?? inquiry.lastMessageAt ?? inquiry.createdAt,
  };
}

class InquiryServices {
  static async createInquiry(inquiryData: Partial<IInquiry>): Promise<IInquiry> {
    const newInquiry = new Inquiry(inquiryData);
    return await newInquiry.save();
  }

  static async getInquiries(filter: QueryFilter<IInquiry> = {}): Promise<IInquiry[]> {
    return await Inquiry.find(filter).sort({ createdAt: -1 });
  }

  static async getInquiriesByItem(itemId: mongoose.Types.ObjectId): Promise<IInquiry[]> {
    return await Inquiry.find({ itemId }).sort({ createdAt: -1 });
  }

  static async getInquiriesByUser(userId: mongoose.Types.ObjectId): Promise<IInquiry[]> {
    return await Inquiry.find({ userId })
      .sort({ createdAt: -1 })
      .populate('itemId', 'title price images');
  }

  static async getInquiriesForSeller(sellerId: mongoose.Types.ObjectId): Promise<IInquiry[]> {
    const sellerItems = await Item.find({ sellerId }).select('_id');
    const itemIds = sellerItems.map((item) => item._id);
    return await Inquiry.find({ itemId: { $in: itemIds } })
      .sort({ createdAt: -1 })
      .populate('itemId', 'title price images')
      .populate('userId', 'firstName lastName email phone');
  }

  static async getInquiryById(id: string): Promise<IInquiry | null> {
    return await Inquiry.findById(id);
  }

  static async updateInquiry(
    id: string,
    userId: mongoose.Types.ObjectId,
    updates: Partial<IInquiry>,
  ): Promise<IInquiry | null> {
    return await Inquiry.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
  }

  static async deleteInquiry(
    id: string,
    userId: mongoose.Types.ObjectId,
  ): Promise<IInquiry | null> {
    return await Inquiry.findOneAndDelete({ _id: id, userId });
  }

  /////////// Chat ///////////

  /**
   * Make sure each inquiry's opening `message` exists as the first Message of
   * its thread. Inquiries created before the chat existed have no Message
   * documents, so they are migrated lazily here. The opening message reuses the
   * inquiry's _id, which makes this idempotent even when two requests race.
   */
  static async ensureOpeningMessages(inquiries: IInquiry[]): Promise<void> {
    if (inquiries.length === 0) return;
    const ids = inquiries.map((inquiry) => inquiry._id);
    const existing = await Message.find({ _id: { $in: ids } }).select('_id');
    const existingIds = new Set(existing.map((message) => String(message._id)));
    const missing = inquiries.filter((inquiry) => !existingIds.has(String(inquiry._id)));
    if (missing.length === 0) return;

    try {
      await Message.collection.insertMany(
        missing.map((inquiry) => ({
          _id: inquiry._id as Types.ObjectId,
          inquiryId: inquiry._id as Types.ObjectId,
          senderId: new Types.ObjectId(idOf(inquiry.userId)),
          text: inquiry.message,
          createdAt: inquiry.createdAt,
          updatedAt: inquiry.createdAt,
        })),
        { ordered: false },
      );
    } catch (error: unknown) {
      // A concurrent request already inserted some of them — that's fine.
      if (!(error && typeof error === 'object' && 'code' in error && error.code === 11000)) {
        throw error;
      }
    }
  }

  /**
   * A buyer contacting a seller: reuses the existing conversation for this
   * item if there is one, otherwise opens a new one.
   */
  static async startConversation(
    itemId: Types.ObjectId,
    buyerId: Types.ObjectId,
    text: string,
  ): Promise<IInquiry> {
    const existing = await Inquiry.findOne({ itemId, userId: buyerId });
    if (existing) {
      await InquiryServices.ensureOpeningMessages([existing]);
      await InquiryServices.addMessage(existing, buyerId, 'buyer', text);
      return existing;
    }

    const now = new Date();
    const inquiry = await new Inquiry({
      itemId,
      userId: buyerId,
      message: text,
      lastMessageAt: now,
      buyerLastReadAt: now,
    }).save();
    await InquiryServices.ensureOpeningMessages([inquiry]);
    return inquiry;
  }

  /** All conversations the user takes part in, as buyer or as seller, newest first. */
  static async getConversations(userId: Types.ObjectId): Promise<ConversationSummary[]> {
    const myItems = await Item.find({ sellerId: userId }).select('_id');
    const inquiries = await Inquiry.find({
      $or: [{ userId }, { itemId: { $in: myItems.map((item) => item._id) } }],
    })
      .populate(ITEM_POPULATE)
      .populate(BUYER_POPULATE);

    await InquiryServices.ensureOpeningMessages(inquiries);

    const ids = inquiries.map((inquiry) => inquiry._id);
    const [lastMessages, incoming] = await Promise.all([
      Message.aggregate<LastMessage & { _id: Types.ObjectId }>([
        { $match: { inquiryId: { $in: ids } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$inquiryId',
            text: { $first: '$text' },
            senderId: { $first: '$senderId' },
            createdAt: { $first: '$createdAt' },
          },
        },
      ]),
      Message.find({ inquiryId: { $in: ids }, senderId: { $ne: userId } })
        .select('inquiryId createdAt')
        .lean(),
    ]);

    const lastByInquiry = new Map(lastMessages.map((message) => [String(message._id), message]));

    const summaries: ConversationSummary[] = [];
    for (const inquiry of inquiries) {
      const role = roleOf(inquiry, userId);
      if (!role) continue;

      const lastReadAt = role === 'buyer' ? inquiry.buyerLastReadAt : inquiry.sellerLastReadAt;
      const unreadCount = incoming.filter(
        (message) =>
          String(message.inquiryId) === String(inquiry._id) &&
          (!lastReadAt || message.createdAt > lastReadAt),
      ).length;

      summaries.push(
        buildSummary(
          inquiry,
          role,
          userId,
          lastByInquiry.get(String(inquiry._id)) ?? null,
          unreadCount,
        ),
      );
    }

    return summaries.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  /**
   * One conversation with its full message thread. Marks it as read for the
   * requesting user. Returns null if it doesn't exist or the user isn't in it.
   */
  static async getThread(inquiryId: string, userId: Types.ObjectId) {
    const inquiry = await Inquiry.findById(inquiryId)
      .populate(ITEM_POPULATE)
      .populate(BUYER_POPULATE);
    if (!inquiry) return null;
    const role = roleOf(inquiry, userId);
    if (!role) return null;

    await InquiryServices.ensureOpeningMessages([inquiry]);
    const messages = await Message.find({ inquiryId: inquiry._id }).sort({ createdAt: 1 }).lean();

    const readField = role === 'buyer' ? 'buyerLastReadAt' : 'sellerLastReadAt';
    await Inquiry.updateOne({ _id: inquiry._id }, { [readField]: new Date() });

    const last = messages[messages.length - 1] ?? null;
    return {
      conversation: buildSummary(inquiry, role, userId, last, 0),
      messages: messages.map((message) => toMessageDTO(message, userId)),
      // Lets the client show "seen" on the user's own messages.
      otherLastReadAt: (role === 'buyer' ? inquiry.sellerLastReadAt : inquiry.buyerLastReadAt) ?? null,
    };
  }

  /** Send a message in a conversation. Returns null if the user isn't part of it. */
  static async sendMessage(
    inquiryId: string,
    userId: Types.ObjectId,
    text: string,
  ): Promise<MessageDTO | null> {
    const inquiry = await Inquiry.findById(inquiryId).populate(ITEM_POPULATE);
    if (!inquiry) return null;
    const role = roleOf(inquiry, userId);
    if (!role) return null;

    await InquiryServices.ensureOpeningMessages([inquiry]);
    return await InquiryServices.addMessage(inquiry, userId, role, text);
  }

  private static async addMessage(
    inquiry: IInquiry,
    senderId: Types.ObjectId,
    role: ChatRole,
    text: string,
  ): Promise<MessageDTO> {
    const message = await new Message({ inquiryId: inquiry._id, senderId, text }).save();

    await Inquiry.updateOne(
      { _id: inquiry._id },
      {
        lastMessageAt: message.createdAt,
        // The ball is in the seller's court after a buyer message, and vice versa.
        status: role === 'seller' ? 'Answered' : 'Pending',
        [role === 'buyer' ? 'buyerLastReadAt' : 'sellerLastReadAt']: message.createdAt,
      },
    );

    return toMessageDTO(message, senderId);
  }
}

export default InquiryServices;
