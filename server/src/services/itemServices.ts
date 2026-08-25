import mongoose, { QueryFilter } from 'mongoose';
import Item, { IItem } from '../models/item';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

class ItemServices {
  static async createItem(itemData: Partial<IItem>): Promise<IItem> {
    const newItem = new Item(itemData);
    return await newItem.save();
  }

  static async getItems(filter: QueryFilter<IItem> = {}): Promise<IItem[]> {
    const { category, keyword, ...rest } = filter as { category?: string; keyword?: string } &
      QueryFilter<IItem>;
    const query: QueryFilter<IItem> = { ...rest };
    if (category) {
      // A category path also matches its subcategories, e.g. "מוצרים" matches "מוצרים / טלפונים".
      query.category = new RegExp(`^${escapeRegExp(category)}($| / )`);
    }
    if (keyword) {
      // Free-text search across title/description; "keyword" isn't a schema field on its own.
      const keywordRegex = new RegExp(escapeRegExp(keyword), 'i');
      query.$or = [{ title: keywordRegex }, { description: keywordRegex }];
    }
    return await Item.find(query).sort({ createdAt: -1 });
  }

  static async getItemsBySeller(sellerId: mongoose.Types.ObjectId): Promise<IItem[]> {
    return await Item.find({ sellerId }).sort({ createdAt: -1 });
  }

  static async getItemById(id: string): Promise<IItem | null> {
    return await Item.findById(id);
  }

  static async updateItem(
    id: string,
    sellerId: mongoose.Types.ObjectId,
    updates: Partial<IItem>,
  ): Promise<IItem | null> {
    return await Item.findOneAndUpdate({ _id: id, sellerId }, updates, { new: true });
  }

  static async deleteItem(
    id: string,
    sellerId: mongoose.Types.ObjectId,
  ): Promise<IItem | null> {
    return await Item.findOneAndDelete({ _id: id, sellerId });
  }
}

export default ItemServices;
