import mongoose , { Document } from "mongoose";
import validator from 'validator';

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string; 
    avatarUrl?: string;
    tokens: string[];
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
      message: "Invalid email address",
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
      validator: (value: string) => validator.isMobilePhone(value, "he-IL"),
      message: "Invalid phone number",
    },
  },
    avatarUrl: {
    type: String,
    rewuired: false,
    trim: true,         
   },
   tokens: {
    type: [String],
    default: [],
   }    

});

const User = mongoose.model<IUser>("User", userSchema);

export default User;