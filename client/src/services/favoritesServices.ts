import api from '../api/client';
import type { Item } from './itemsServices';

export type FavoriteItem = {
  _id: string;
  itemId: string | Item;
  userId: string;
  createdAt: string;
};

class FavoritesServices {
  static async getMyFavorites(): Promise<FavoriteItem[]> {
    const { data } = await api.get<FavoriteItem[]>('/favorites/mine');
    return data;
  }
}

export default FavoritesServices;
