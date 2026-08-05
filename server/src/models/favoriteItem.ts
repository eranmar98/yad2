// server/src/models/favoriteItem.ts
import mongoose, { Document } from 'mongoose';

export interface IFavoriteItem extends Document {
  userId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteItemSchema = new mongoose.Schema<IFavoriteItem>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

favoriteItemSchema.index({ userId: 1, itemId: 1 }, { unique: true });

const FavoriteItem = mongoose.model<IFavoriteItem>('FavoriteItem', favoriteItemSchema);

export default FavoriteItem;
