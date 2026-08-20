import api from '../api/client';
import type { IUser } from '../types/user';

export type AuthResponse = {
  user: IUser;
  token: string;
};

export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

class UsersServices {
  static async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/users/login', { email, password });
    return data;
  }

  static async createUser(payload: RegisterPayload): Promise<IUser> {
    const { data } = await api.post<IUser>('/users/new-user', payload);
    return data;
  }
}

export default UsersServices;
