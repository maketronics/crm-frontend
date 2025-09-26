import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { authStore } from '../stores/authStore';
import { mockRefreshToken, isMockMode } from './mockAuth';
import type { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use((config) => {
      const { accessToken } = authStore.getState();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            await this.refreshToken();
            const { accessToken } = authStore.getState();
            if (accessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            authStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        const apiError: ApiError = {
          message: (error.response?.data as any)?.message || error.message || 'An error occurred',
          errors: (error.response?.data as any)?.errors,
        };

        return Promise.reject(apiError);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    try {
      let response;

      if (isMockMode()) {
        // Use mock refresh token for development
        response = await mockRefreshToken();
      } else {
        // Use real API refresh token
        const apiResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });
        response = apiResponse.data;
      }

      const { access_token } = response;
      authStore.getState().setAccessToken(access_token);
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();