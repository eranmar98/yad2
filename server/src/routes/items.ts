// server/src/routes/items.ts
import express from 'express';
import ItemController from '../controllers/item';
import auth from '../middleware/auth';
import upload from '../middleware/upload';

const itemsRouter = express.Router();

itemsRouter.get('/', ItemController.getItems);
itemsRouter.get('/mine', auth, ItemController.getMyItems);
itemsRouter.get('/:id', ItemController.getItemById);

itemsRouter.post('/', auth, upload.single('image'), ItemController.createItem);
itemsRouter.put('/:id', auth, ItemController.updateItem);
itemsRouter.delete('/:id', auth, ItemController.deleteItem);

export default itemsRouter;