import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '../types';
import { authService } from '../lib/authService';

interface AuthStore extends AuthState {
  refreshToken: string | null;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
  updateUser: (user: User) => void;
  refreshAccessToken: () => Promise<boolean>;
}

export const authStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,

      login: (user: User, accessToken: string, refreshToken: string) => {
        set({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken,
        });
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
        }
      },

      setAccessToken: (accessToken: string) => {
        set({ accessToken });
      },

      updateUser: (user: User) => {
        set({ user });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          return false;
        }

        try {
          const response = await authService.refreshToken({ refreshToken });
          set({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          });
          return true;
        } catch (error) {
          console.error('Token refresh error:', error);
          set({
            isAuthenticated: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          return false;
        }
      },
    }),
    {
      name: 'crm-auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        refreshToken: state.refreshToken,
      }),
    }
  )
);