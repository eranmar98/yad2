import { Request, Response } from 'express';
import { IFavoriteItem } from '../models/favoriteItem';
import FavoriteItemServices from '../dataServices/favoriteItemServices';

class FavoriteItemController {
  static async createFavoriteItem(req: Request, res: Response) {
    try {
      const authenticatedReq = req as Request & { user?: { _id: string } };
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
}

export default FavoriteItemController;
