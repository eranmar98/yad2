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

function toNonNegativeNumber(value: unknown): number | undefined {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

// A category path also matches its subcategories, e.g. "מוצרים" matches "מוצרים / טלפונים".
function categoryPathRegex(path: string): RegExp {
  return new RegExp(`^${escapeRegExp(path)}($| / )`);
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
    const {
      category,
      categories: rawCategories,
      keyword,
      minPrice: rawMinPrice,
      maxPrice: rawMaxPrice,
      page: rawPage,
      limit: rawLimit,
      ...rest
    } = filter as {
      category?: string;
      categories?: string | string[];
      keyword?: string;
      minPrice?: string;
      maxPrice?: string;
      page?: string;
      limit?: string;
    } & QueryFilter<IItem>;
    const query: QueryFilter<IItem> = { ...rest };
    if (category) {
      query.category = categoryPathRegex(category);
    }
    if (rawCategories !== undefined) {
      // Narrows the main category to the sub-paths picked in the filter sidebar; an empty value
      // means every option was unchecked, so nothing matches.
      const categories = (Array.isArray(rawCategories) ? rawCategories : [rawCategories]).filter(Boolean);
      query.$and = [{ category: { $in: categories.map(categoryPathRegex) } }];
    }
    const minPrice = toNonNegativeNumber(rawMinPrice);
    const maxPrice = toNonNegativeNumber(rawMaxPrice);
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {
        ...(minPrice !== undefined && { $gte: minPrice }),
        ...(maxPrice !== undefined && { $lte: maxPrice }),
      };
    }
    if (keyword) {
      // Case-insensitive substring match on the title; "keyword" isn't a schema field on its own.
      query.title = new RegExp(escapeRegExp(keyword), 'i');
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
