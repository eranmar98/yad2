// server/src/models/item.ts
import mongoose, { Document } from 'mongoose';

export interface IItem extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  suggestedCategory?: string;
  suggestedPrice?: number;
  images: string[];
  sellerId: mongoose.Types.ObjectId;
  status: 'Active' | 'Sold';
  createdAt: Date;
}

const itemSchema = new mongoose.Schema<IItem>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  suggestedCategory: {
    type: String,
    trim: true,
  },
  suggestedPrice: {
    type: Number,
  },
  images: {
    type: [String],
    default: [],
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Sold'],
    default: 'Active',
  },
}, { timestamps: true }); // מוסיף createdAt + updatedAt אוטומטית

const Item = mongoose.model<IItem>('Item', itemSchema);

export default Item;