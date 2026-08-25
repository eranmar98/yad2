import { Request, Response } from 'express';
import { ICategory } from '../models/category';
import CategoriesServices from '../services/categoriesServices';

class CategoriesController {
  static async createCategory(req: Request, res: Response) {
    try {
      const newCategory: ICategory = await CategoriesServices.createCategory(
        req.body,
      );
      res.status(201).json(newCategory);
    } catch (error: unknown) {
      // status 500 = internal server error

      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
}

export default CategoriesController;
