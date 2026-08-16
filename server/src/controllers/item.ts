import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { IItem } from '../models/item';
import ItemServices from '../dataServices/itemServices';
import cloudinary from '../config/cloudinary';

type AuthenticatedRequest = Request & {
  user?: {
    _id: string;
  };
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Unknown error';
}

class ItemController {
  static async createItem(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const images: string[] = [];

      if (req.file) {
        const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: 'yad2',
        });
        images.push(uploadResult.secure_url);
      }

      const newItem: IItem = await ItemServices.createItem({
        ...req.body,
        images,
        sellerId: new Types.ObjectId(authReq.user!._id),
      });
      res.status(201).json(newItem);
    } catch (error: unknown) {
      // status 500 = internal server error
      const message = getErrorMessage(error);
      res.status(500).json({ error: message });
    }
  }

  static async getItems(req: Request, res: Response) {
    try {
      const items: IItem[] = await ItemServices.getItems(req.query);
      res.status(200).json(items);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(500).json({ error: message });
    }
  }

  static async getMyItems(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const items: IItem[] = await ItemServices.getItemsBySeller(
        new Types.ObjectId(authReq.user!._id),
      );
      res.status(200).json(items);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
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
      const message = getErrorMessage(error);
      res.status(500).json({ error: message });
    }
  }

  static async updateItem(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const item = await ItemServices.updateItem(
        req.params.id as string,
        new Types.ObjectId(authReq.user!._id),
        req.body,
      );
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.status(200).json(item);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(500).json({ error: message });
    }
  }

  static async deleteItem(req: Request, res: Response) {
    try {
      const authReq = req as AuthenticatedRequest;
      const item = await ItemServices.deleteItem(
        req.params.id as string,
        new Types.ObjectId(authReq.user!._id),
      );
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.status(200).json({ message: 'Item deleted' });
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      res.status(500).json({ error: message });
    }
  }
}

export default ItemController;
