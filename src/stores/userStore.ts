import { create } from 'zustand';
import type { User, PaginatedResponse } from '../types';

interface UserStore {
  users: User[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  setUsers: (response: PaginatedResponse<User>) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUsers: () => void;
}

export const userStore = create<UserStore>((set) => ({
  users: [],
  totalUsers: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,

  setUsers: (response: PaginatedResponse<User>) => {
    set({
      users: response.data,
      totalUsers: response.total,
      currentPage: response.page,
      totalPages: response.totalPages,
    });
  },

  addUser: (user: User) => {
    set((state) => ({
      users: [user, ...state.users],
      totalUsers: state.totalUsers + 1,
    }));
  },

  updateUser: (id: string, updates: Partial<User>) => {
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updates } : user
      ),
    }));
  },

  removeUser: (id: string) => {
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
      totalUsers: state.totalUsers - 1,
    }));
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearUsers: () => {
    set({
      users: [],
      totalUsers: 0,
      currentPage: 1,
      totalPages: 1,
      error: null,
    });
  },
}));