import { create } from 'zustand';
import UsersServices, { type RegisterPayload } from '../services/usersServices';
import type { IUser } from '../../models/user';

type UsersState = {
  user: IUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
};

// Define the auth state and actions used throughout the app for login, registration, and logout.
const useUsersStore = create<UsersState>((set) => ({
  // Keep the current authenticated user, saved token, and loading state in the client store.
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,

  // Log the user in by sending credentials to the API, saving the token, and updating the store.
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { user, token } = await UsersServices.login(email, password);
      localStorage.setItem('token', token);
      set({ user, token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  // Register a new user by calling the backend service and clearing the loading state on completion.
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

  // Sign the user out by removing the stored token and clearing the session from state.
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

export default useUsersStore;
