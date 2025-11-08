import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  username: string;
  email: string;
  points?: number;
  avatar?: string;
}

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  notificationsEnabled: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleNotifications: () => Promise<void>;
  loadUserFromStorage: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  notificationsEnabled: true,

  setUser: (user) => set({ user, isAuthenticated: true }),

  setToken: (token) => set({ token }),

  login: async (user, token) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true });
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  },

  toggleNotifications: async () => {
    const newValue = !get().notificationsEnabled;
    try {
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(newValue));
      set({ notificationsEnabled: newValue });
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    }
  },

  loadUserFromStorage: async () => {
    try {
      const [userStr, token, notifStr] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('notificationsEnabled'),
      ]);

      if (userStr && token) {
        const user = JSON.parse(userStr);
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          notificationsEnabled: notifStr ? JSON.parse(notifStr) : true,
        });
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    }
  },
}));
