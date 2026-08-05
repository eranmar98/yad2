import { Request, Response } from 'express';
import { IItem } from '../models/item';
import ItemServices from '../dataServices/itemServices';

type AuthenticatedRequest = Request & {
  user?: {
    _id: string;
  };
};

class ItemController {
  static async createItem(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const newItem: IItem = await ItemServices.createItem({
        ...req.body,
        sellerId: authReq.user!._id,
      });
      res.status(201).json(newItem);
    } catch (error: unknown) {
      // status 500 = internal server error
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }

  static async getItems(req: Request, res: Response) {
    try {
      const items: IItem[] = await ItemServices.getItems(req.query);
      res.status(200).json(items);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }

  static async getMyItems(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const items: IItem[] = await ItemServices.getItemsBySeller(
        authReq.user!._id,
      );
      res.status(200).json(items);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }

  static async getItemById(req: Request, res: Response) {
    try {
      const item = await ItemServices.getItemById(req.params.id as string);
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.status(200).json(item);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }

  static async updateItem(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const item = await ItemServices.updateItem(
        req.params.id as string,
        authReq.user!._id,
        req.body,
      );
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.status(200).json(item);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }

  static async deleteItem(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const item = await ItemServices.deleteItem(
        req.params.id as string,
        authReq.user!._id,
      );
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.status(200).json({ message: 'Item deleted' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
}

export default ItemController;
