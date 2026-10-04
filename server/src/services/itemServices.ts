import mongoose, { QueryFilter } from 'mongoose';
import Item, { IItem } from '../models/item';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;

function toPositiveInt(value: unknown, fallback: number): number {
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export type PaginatedItems = {
  items: IItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

class ItemServices {
  static async createItem(itemData: Partial<IItem>): Promise<IItem> {
    const newItem = new Item(itemData);
    return await newItem.save();
  }

  static async getItems(filter: QueryFilter<IItem> = {}): Promise<PaginatedItems> {
    const { category, keyword, page: rawPage, limit: rawLimit, ...rest } = filter as {
      category?: string;
      keyword?: string;
      page?: string;
      limit?: string;
    } & QueryFilter<IItem>;
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

    const limit = Math.min(toPositiveInt(rawLimit, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
    const total = await Item.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    // Clamp so a stale ?page=99 still lands on the last real page instead of an empty one.
    const page = Math.min(toPositiveInt(rawPage, 1), totalPages);

    const items = await Item.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { items, total, page, limit, totalPages };
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
