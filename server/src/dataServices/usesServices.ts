import User, { IUser } from '../models/user';
import bcrypsjs from 'bcryptjs';

class UserServices {
  static async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user: IUser = new User({
      ...userData,
      password: bcrypsjs.hashSync(userData.password || '', 10),
    });
    return await user.save();
  }

  static async getUserByCredentials(
    email: string,
    password: string,
  ): Promise<{ user: IUser; token: string }> {
    const user: IUser | null = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    const isPasswordValid = bcrypsjs.compareSync(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');
    const token: string = await user.generateAuthToken();
    return { user, token };
  }
}

export default UserServices;
