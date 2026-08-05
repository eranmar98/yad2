// server/src/models/inquiry.ts
import mongoose, { Document } from 'mongoose';

export interface IInquiry extends Document {
  itemId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  status: 'Pending' | 'Answered' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new mongoose.Schema<IInquiry>(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Answered', 'Closed'],
      default: 'Pending',
    },
  },
  { timestamps: true },
);

const Inquiry = mongoose.model<IInquiry>('Inquiry', inquirySchema);

export default Inquiry;
