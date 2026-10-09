// server/src/models/message.ts
import mongoose, { Document } from 'mongoose';

// A single chat message inside an inquiry (the inquiry is the conversation
// between the item's seller and one interested buyer).
export interface IMessage extends Document {
  inquiryId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>(
  {
    inquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inquiry',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true },
);

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
