import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../models/user';
import { Request, Response, NextFunction } from 'express';

dotenv.config();

/**
 * Middleware to authenticate requests using JWT
 */
const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).send({ error: 'Please authenticate.' });
    }
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.TOKEN_KEY as string) as { _id: string };
    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      throw new Error();
    }

    next();
  } catch (e: unknown) {
    if (e instanceof Error && e.name === 'TokenExpiredError') {
      return res
        .status(401)
        .send({ error: 'Token expired. Please log in again.' });
    }
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

export default auth;
