// server/src/routes/items.ts
import express from 'express';
import ItemController from '../controllers/item';
import auth from '../middleware/auth';

const itemsRouter = express.Router();

itemsRouter.get('/', ItemController.getItems);             // ציבורי
itemsRouter.get('/mine', auth, ItemController.getMyItems); // מוגן - לפני '/:id'
itemsRouter.get('/:id', ItemController.getItemById);       // ציבורי

itemsRouter.post('/', auth, ItemController.createItem);      // מוגן
itemsRouter.put('/:id', auth, ItemController.updateItem);    // מוגן
itemsRouter.delete('/:id', auth, ItemController.deleteItem); // מוגן

export default itemsRouter;
