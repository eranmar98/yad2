import { Request, Response } from 'express';
import { IUser } from '../models/user';
import UserServices from '../dataServices/usesServices';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      const newUser: IUser = await UserServices.createUser(req.body); //
        res.status(201).json(newUser);
    } catch (error: Error | any) {
        res.status(500).json({ error: error.message });
    }
  }

  static async getUserByCredentials(req: Request, res: Response) {
    try {
        const user:{ user: IUser, token: string} = await UserServices.getUserByCredentials(req.body.email, req.body.password);
        res.status(200).json(user);;
    } catch (error: Error | any) {
        res.status(500).json({ error: error.message });
    }
  }

  static async autoLogin(req: Request, res: Response) {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');  
      const decoded = jwt.verify(token as string, process.env.TOKEN_KEY as string) as { _id: string };
      const userId = decoded._id as string;
      const userIdObject = new mongoose.Types.ObjectId(userId);
      const user:{ user: IUser, token: string} = await UserServices.autoLogin(userIdObject, token as string);
      res.status(200).json(user);
    } catch (error: Error | any) {
      res.status(500).json({ error: error.message });      
    }
  }
}

export default UserController;