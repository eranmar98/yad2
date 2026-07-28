import express, {Request, Response} from "express";
import { IUser } from "../models/user";
import UserController from "../controllers/user";

const usersRouter = express.Router();

usersRouter.post("/new-user", async (req: Request, res: Response) => {
    try {
        const newUser: IUser = await UserController.createUser(req.body);// 
    } catch (error: Error | any) {
        res.status(500).json({ error: error.message });
    }
})

export default usersRouter;