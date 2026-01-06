import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  _hasHydrated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setHasHydrated: (state: boolean) => void;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,
      
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

      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('AuthStore: Hydration complete', {
          isAuthenticated: state?.isAuthenticated,
          hasUser: !!state?.user,
          hasAccessToken: !!state?.accessToken,
        });
        state?.setHasHydrated(true);
      },
    }
  )
);