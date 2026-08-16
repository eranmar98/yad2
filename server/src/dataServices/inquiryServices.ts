import mongoose, { QueryFilter } from 'mongoose';
import Inquiry, { IInquiry } from '../models/inquiry';
import Item from '../models/item';

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
}

export default InquiryServices;
