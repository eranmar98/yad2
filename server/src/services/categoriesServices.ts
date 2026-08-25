import Category, { ICategory } from '../models/category';

class CategoriesServices {
  static async createCategory(
    categoryData: Partial<ICategory>,
  ): Promise<ICategory> {
    const newCategory = new Category(categoryData);
    return await newCategory.save();
  }
}

export default CategoriesServices;
