import { authApiClient } from './authApiClient';
import type { User, CreateUserRequest, PaginatedResponse } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  active?: boolean;
}

export interface UpdateProfileRequest {
  name: string;
  mobileNumber: string;
  title: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

class AuthService {
  private isMockMode(): boolean {
    return import.meta.env.VITE_USE_MOCK === 'true';
  }

  private mockUsers: User[] = [
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

  private async getMockUsers(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    filters?: UserFilters
  ): Promise<PaginatedResponse<User>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredUsers = [...this.mockUsers];

    // Apply search filter
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.title.toLowerCase().includes(search)
      );
    }

    // Apply role filter
    if (filters?.role) {
      filteredUsers = filteredUsers.filter(user =>
        user.roles.includes(filters.role!)
      );
    }

    // Apply active filter
    if (filters?.active !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isActive === filters.active);
    }

    // Sort users
    filteredUsers.sort((a, b) => {
      const aVal = a[sortBy as keyof User] as string;
      const bVal = b[sortBy as keyof User] as string;

      if (sortDir === 'desc') {
        return bVal.localeCompare(aVal);
      }
      return aVal.localeCompare(bVal);
    });

    // Paginate
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredUsers.length / size);

    return {
      data: paginatedUsers,
      total: filteredUsers.length,
      page: page,
      size: size,
      totalPages: totalPages,
    };
  }
  // Authentication Endpoints
  async login(data: LoginRequest): Promise<LoginResponse> {
    console.log('AuthService: Attempting login with:', { email: data.email });
    try {
      const response = await authApiClient.post<LoginResponse>('/auth/login', data);
      console.log('AuthService: Login successful');
      return response;
    } catch (error) {
      console.error('AuthService: Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await authApiClient.post('/auth/logout');
  }

  async refreshToken(data: RefreshRequest): Promise<RefreshResponse> {
    const response = await authApiClient.post<RefreshResponse>('/auth/refresh', data);
    return response;
  }

  // User Management Endpoints
  async getUsers(
    page = 0,
    size = 10,
    sortBy = 'name',
    sortDir = 'asc',
    filters?: UserFilters
  ): Promise<PaginatedResponse<User>> {
    // Check if in mock mode
    if (this.isMockMode()) {
      return this.getMockUsers(page, size, sortBy, sortDir, filters);
    }

    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });

    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.role) {
      params.append('role', filters.role);
    }
    if (filters?.active !== undefined) {
      params.append('active', filters.active.toString());
    }

    const response = await authApiClient.get<PaginatedResponse<User>>(
      `/users?${params.toString()}`
    );
    return response;
  }

  async getUserById(id: string): Promise<User> {
    const response = await authApiClient.get<User>(`/users/${id}`);
    return response;
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await authApiClient.post<User>('/users', data);
    return response;
  }

  async updateUser(id: string, data: CreateUserRequest): Promise<User> {
    const response = await authApiClient.put<User>(`/users/${id}`, data);
    return response;
  }

  async toggleUserStatus(id: string, active: boolean): Promise<User> {
    const response = await authApiClient.patch<User>(`/users/${id}/status?active=${active}`);
    return response;
  }

  async deleteUser(id: string): Promise<void> {
    await authApiClient.delete(`/users/${id}`);
  }

  // Profile Management Endpoints
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await authApiClient.put<User>('/users/me', data);
    return response;
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await authApiClient.patch('/users/me/password', data);
  }

  // Audit Endpoints
  async getAuditLogs(
    page = 0,
    size = 20,
    sortBy = 'timestamp',
    sortDir = 'desc'
  ): Promise<PaginatedResponse<AuditLog>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      sortDir,
    });

    const response = await authApiClient.get<PaginatedResponse<AuditLog>>(
      `/audit-logs?${params.toString()}`
    );
    return response;
  }
}

export const authService = new AuthService();