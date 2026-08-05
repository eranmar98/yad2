// server/src/models/item.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IItem extends Document {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: Types.ObjectId;
  status: 'Active' | 'Sold';
  createdAt: Date;
  updatedAt: Date;
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
  images: {
    type: [String],
    default: [],
  },
  sellerId: {
    type: Schema.Types.ObjectId,
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