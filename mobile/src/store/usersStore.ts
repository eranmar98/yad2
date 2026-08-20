import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UsersServices, { type RegisterPayload } from '../services/usersServices';
import type { IUser } from '../types/user';

type UsersState = {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  isHydrating: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

const useUsersStore = create<UsersState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrating: true,

  hydrate: async () => {
    const token = await AsyncStorage.getItem('token');
    set({ token, isHydrating: false });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user, token } = await UsersServices.login(email, password);
      await AsyncStorage.setItem('token', token);
      set({ user, token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (payload) => {
    set({ isLoading: true });
    try {
      await UsersServices.createUser(payload);
      set({ isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    AsyncStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

export default useUsersStore;
