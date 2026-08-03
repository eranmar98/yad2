import mongoose, { Document } from 'mongoose';

// התבנית לכל סכמה של מונגוס
export interface ICategory extends Document {
  name: string;
  icon: string;
}

const categorySchema = new mongoose.Schema<ICategory>({
  name: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  icon: {
    type: String,
    trim: true,
    default: null,
  },
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
