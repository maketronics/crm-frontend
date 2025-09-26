import type { User } from '../types';

// Mock users database
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    mobileNumber: '+1234567890',
    title: 'System Administrator',
    roles: ['SUPERADMIN', 'ADMIN'],
    permissions: ['CREATE_USER', 'READ_USER', 'UPDATE_USER', 'DELETE_USER', 'MANAGE_USER_ROLES', 'VIEW_AUDIT_LOGS'],
    isActive: true,
    createdBy: 'system',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@example.com',
    mobileNumber: '+1234567891',
    title: 'Sales Representative',
    roles: ['USER'],
    permissions: ['READ_USER', 'UPDATE_OWN_PROFILE', 'CHANGE_OWN_PASSWORD'],
    isActive: true,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Manager User',
    email: 'manager@example.com',
    mobileNumber: '+1234567892',
    title: 'Sales Manager',
    roles: ['MANAGER', 'USER'],
    permissions: ['READ_USER', 'UPDATE_USER', 'UPDATE_OWN_PROFILE', 'CHANGE_OWN_PASSWORD'],
    isActive: true,
    createdBy: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock passwords
const mockPasswords: Record<string, string> = {
  'admin@example.com': 'admin123',
  'user@example.com': 'user123',
  'manager@example.com': 'manager123',
};

export const mockLogin = async (email: string, password: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const user = mockUsers.find(u => u.email === email);
  const validPassword = mockPasswords[email];

  if (!user || validPassword !== password) {
    throw new Error('Invalid email or password');
  }

  // Return mock response
  return {
    access_token: `mock-token-${user.id}-${Date.now()}`,
    user,
  };
};

export const mockRefreshToken = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    access_token: `mock-refreshed-token-${Date.now()}`,
  };
};

export const isMockMode = () => {
  return !import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_USE_MOCK === 'true';
};