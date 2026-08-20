// server/src/routes/favoriteItems.ts
import { Router } from 'express';
import FavoriteItemController from '../controllers/favoriteItem';
import auth from '../middleware/auth';

const router = Router();

router.post('/', auth, FavoriteItemController.createFavoriteItem);
router.get('/mine', auth, FavoriteItemController.getMyFavorites);

export default router;
