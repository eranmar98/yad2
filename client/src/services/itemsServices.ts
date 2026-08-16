import api from '../api/client';

export type CreateItemPayload = {
  title: string;
  description: string;
  price: number;
  category: string;
  image?: File | null;
};

export type Item = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: string;
  status: 'Active' | 'Sold';
  createdAt: string;
};

class ItemsServices {
  static async createItem(payload: CreateItemPayload): Promise<Item> {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('price', String(payload.price));
    formData.append('category', payload.category);
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const { data } = await api.post<Item>('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  }

  static async getMyItems(): Promise<Item[]> {
    const { data } = await api.get<Item[]>('/items/mine');
    return data;
  }

  static async getItems(filters: { keyword?: string; category?: string } = {}): Promise<Item[]> {
    const { data } = await api.get<Item[]>('/items', { params: filters });
    return data;
  }
}

export default ItemsServices;