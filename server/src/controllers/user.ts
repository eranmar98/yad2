import { Request, Response } from 'express';
import { IUser } from '../models/user';
import UserServices from '../dataServices/userServices';

class UserController {
  static async createUser(req: Request, res: Response) {
    try {
      // controller's request to the service layer to create a new user
      // status 201 = request succeeded and a new resource was created
      const newUser: IUser = await UserServices.createUser(req.body);
      res.status(201).json(newUser);
    } catch (error: unknown) {
      // status 500 = internal server error

      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }

  static async getUserByCredentials(req: Request, res: Response) {
    try {
      const loginResponse = await UserServices.getUserByCredentials(
        req.body.email,
        req.body.password,
      );
      res.status(200).json(loginResponse);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
}

export default UserController;
