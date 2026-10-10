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

export type ItemFilters = {
  keyword?: string;
  category?: string;
  // Sub-category paths to narrow `category` to; an empty list matches nothing.
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

export type PaginatedItems = {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

  static async getItems(filters: ItemFilters = {}): Promise<PaginatedItems> {
    const { categories, ...rest } = filters;
    const { data } = await api.get<PaginatedItems>('/items', {
      // An empty list is sent as an empty value so the server matches nothing, instead of dropping the filter.
      params: { ...rest, categories: categories && (categories.length ? categories : '') },
      // Repeat the key for each value (categories=a&categories=b) instead of categories[]=a.
      paramsSerializer: { indexes: null },
    });
    return data;
  }
}

export default ItemsServices;