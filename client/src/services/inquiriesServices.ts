import api from '../api/client';
import type { Item } from './itemsServices';

export type Inquiry = {
  _id: string;
  itemId: string | Pick<Item, '_id' | 'title' | 'price' | 'images'>;
  userId:
    | string
    | { _id: string; firstName: string; lastName: string; email: string; phone: string };
  message: string;
  status: 'Pending' | 'Answered' | 'Closed';
  createdAt: string;
};

export type ChatRole = 'buyer' | 'seller';

export type Conversation = {
  _id: string;
  role: ChatRole;
  status: Inquiry['status'];
  item: { _id: string; title: string; price: number; image: string | null; status: string } | null;
  otherUser: { _id: string; firstName: string; lastName: string; avatarUrl?: string; phone?: string } | null;
  lastMessage: { text: string; createdAt: string; isMine: boolean } | null;
  unreadCount: number;
  updatedAt: string;
};

export type ChatMessage = {
  _id: string;
  text: string;
  createdAt: string;
  isMine: boolean;
};

export type ChatThread = {
  conversation: Conversation;
  messages: ChatMessage[];
  otherLastReadAt: string | null;
};

class InquiriesServices {
  static async createInquiry(itemId: string, message: string): Promise<Inquiry> {
    const { data } = await api.post<Inquiry>('/inquiries', { itemId, message });
    return data;
  }

  static async getMyInquiries(): Promise<Inquiry[]> {
    const { data } = await api.get<Inquiry[]>('/inquiries/mine');
    return data;
  }

  static async getReceivedInquiries(): Promise<Inquiry[]> {
    const { data } = await api.get<Inquiry[]>('/inquiries/received');
    return data;
  }

  static async getConversations(): Promise<Conversation[]> {
    const { data } = await api.get<Conversation[]>('/inquiries/conversations');
    return data;
  }

  static async getThread(conversationId: string): Promise<ChatThread> {
    const { data } = await api.get<ChatThread>(`/inquiries/${conversationId}/messages`);
    return data;
  }

  static async sendMessage(conversationId: string, text: string): Promise<ChatMessage> {
    const { data } = await api.post<ChatMessage>(`/inquiries/${conversationId}/messages`, { text });
    return data;
  }
}

export default InquiriesServices;
