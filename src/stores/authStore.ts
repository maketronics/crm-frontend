import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      
      login: (user, accessToken, refreshToken) => {
        console.log('AuthStore: Setting authenticated state', { 
          userId: user.id, 
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken 
        });
        set({
          isAuthenticated: true,
          user,
          accessToken,
          refreshToken,
        });
      },
      
      logout: () => {
        console.log('AuthStore: Clearing authenticated state');
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },
      
      setAccessToken: (token) => {
        console.log('AuthStore: Updating access token');
        set({ accessToken: token });
      },
      
      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);