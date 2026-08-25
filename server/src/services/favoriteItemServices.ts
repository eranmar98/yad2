import mongoose from 'mongoose';
import FavoriteItem, { IFavoriteItem } from '../models/favoriteItem';

class FavoriteItemServices {
  static async createFavoriteItem(
    favoriteItemData: Partial<IFavoriteItem>,
  ): Promise<IFavoriteItem> {
    const newFavoriteItem = new FavoriteItem(favoriteItemData);
    return await newFavoriteItem.save();
  }

  static async getUserFavorites(userId: mongoose.Types.ObjectId): Promise<IFavoriteItem[]> {
    return await FavoriteItem.find({ userId }).populate('itemId').sort({ createdAt: -1 });
  }
}

export default FavoriteItemServices;
