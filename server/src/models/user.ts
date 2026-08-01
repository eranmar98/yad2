import mongoose, { Document } from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface Token {
  token: string;
}

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  avatarUrl?: string;
  tokens: Token[];
  generateAuthToken: () => Promise<string>;
}

const userSchema = new mongoose.Schema<IUser>({
  // Define user schema fields here
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (value: string) => validator.isEmail(value),
      message: 'Invalid email address',
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: (value: string) => validator.isMobilePhone(value, 'he-IL'),
      message: 'Invalid phone number',
    },
  },
  avatarUrl: {
    type: String,
    rewuired: false,
    trim: true,
  },
  tokens: {
    type: [
      {
        token: { type: String },
        _id: false, // This is fine here to disable sub-document IDs
      },
    ],
  },
});

/**
 * Generate authentication token for the account
 */

userSchema.methods.generateAuthToken = async function (): Promise<string> {
  const token = jwt.sign(
    { _id: this._id.toString() },
    process.env.TOKEN_KEY as string,
    { expiresIn: '30d' },
  );

  // 1. Ensure tokens is an array (fallback if select:false made it undefined)
  if (!this.tokens) this.tokens = [];

  // 2. Add the new token to the end
  this.tokens.push({ token });

  // 3. FIFO Logic: If length > 6, remove the OLDEST (index 0)
  while (this.tokens.length > 6) {
    this.tokens.shift(); // shift() removes the first element
  }

  await this.save();
  return token;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
