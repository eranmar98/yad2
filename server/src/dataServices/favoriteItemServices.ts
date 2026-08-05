import FavoriteItem, { IFavoriteItem } from '../models/favoriteItem';

class FavoriteItemServices {
  static async createFavoriteItem(
    favoriteItemData: Partial<IFavoriteItem>,
  ): Promise<IFavoriteItem> {
    const newFavoriteItem = new FavoriteItem(favoriteItemData);
    return await newFavoriteItem.save();
  }
}

export default FavoriteItemServices;
