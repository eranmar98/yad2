import User, { IUser } from '../models/user';
import bcrypsjs from 'bcryptjs';

class UserServices {

  // Method to create new user, accepts user data of type IUser, promise of type IUser
  static async createUser(userData: Partial<IUser>): Promise<IUser> {
    // create new user, `...userData` to append all previous values from param 'userData'
    const user: IUser = new User({
      ...userData,
      password: bcrypsjs.hashSync(userData.password || '', 10),
    });
    return await user.save();
  }

  static async getUserByCredentials(
    email: string,
    password: string,
  ) { // שיניתי פה את חתימת החזרה כדי שהטייפסקריפט לא יצעק שחסרים שדות
    const user: IUser | null = await User.findOne({ email });
    if (!user) throw new Error('User not found');
    
    const isPasswordValid = bcrypsjs.compareSync(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');
    
    const token: string = await user.generateAuthToken();
    
    // המרה לאובייקט רגיל
    const userObj = user.toObject();
    
    // עכשיו אפשר למחוק את השדות
    delete userObj.password;
    delete userObj.tokens;
    
    return { user: userObj, token };
  }

  static async autoLogin(userId: IUser['_id'], token: string) {
    const user: IUser | null = await User.findOne({ _id: userId, 'tokens.token': token });
    if (!user) throw new Error('User not found');
    
    // המרה לאובייקט רגיל
    const userObj = user.toObject();
    
    // עכשיו אפשר למחוק את השדות
    delete userObj.password;
    delete userObj.tokens;
    
    return { user: userObj, token };
  }
}

export default UserServices;
