import mongoose, { QueryFilter } from 'mongoose';
import Item, { IItem } from '../models/item';

class ItemServices {
  static async createItem(itemData: Partial<IItem>): Promise<IItem> {
    const newItem = new Item(itemData);
    return await newItem.save();
  }

  static async getItems(filter: QueryFilter<IItem> = {}): Promise<IItem[]> {
    return await Item.find(filter).sort({ createdAt: -1 });
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
