import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { IFavoriteItem } from '../models/favoriteItem';
import FavoriteItemServices from '../dataServices/favoriteItemServices';

type AuthenticatedRequest = Request & {
  user?: {
    _id: string;
  };
};

class FavoriteItemController {
  static async createFavoriteItem(req: Request, res: Response) {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const newFavoriteItem: IFavoriteItem = await FavoriteItemServices.createFavoriteItem({
        ...req.body,
        userId: authenticatedReq.user!._id,
      });
      res.status(201).json(newFavoriteItem);
    } catch (error: unknown) {
      // status 500 = internal server error
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }

  static async getMyFavorites(req: Request, res: Response) {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const favorites: IFavoriteItem[] = await FavoriteItemServices.getUserFavorites(
        new Types.ObjectId(authenticatedReq.user!._id),
      );
      res.status(200).json(favorites);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
}

export default FavoriteItemController;
