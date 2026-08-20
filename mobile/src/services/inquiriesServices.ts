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
}

export default InquiriesServices;
