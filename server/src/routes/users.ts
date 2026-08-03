import express from 'express';
import UserController from '../controllers/user';

const usersRouter = express.Router();

usersRouter.post('/new-user', UserController.createUser);

usersRouter.post('/login', UserController.getUserByCredentials);

usersRouter.post('/auto-login', UserController.autoLogin);

export default usersRouter;
