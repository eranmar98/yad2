import express from 'express';
import CategoriesController from '../controllers/categories';

const categoriesRouter = express.Router();

categoriesRouter.post('/create-category', CategoriesController.createCategory);

export default categoriesRouter;
