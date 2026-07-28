import User, { IUser } from "../models/user";

class UserController {
    static async createUser(userData:Partial<IUser>):Promise<IUser> {
        const user :IUser = new User(userData);
        return await user.save();
    }
}

export default UserController;