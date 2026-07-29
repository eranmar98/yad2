import { Request, Response } from 'express';
import { IUser } from '../models/user';
import UserServices from '../dataServices/usesServices';

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
        const user:IUser = await UserServices.getUserByCredentials(req.body.email, req.body.password);
        res.status(200).json(user);;
    } catch (error: Error | any) {
        res.status(500).json({ error: error.message });
    }
    }
}

export default UserController;