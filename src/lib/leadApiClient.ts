import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { authStore } from '../stores/authStore';
import type { ApiError } from '../types';

const LEAD_API_BASE_URL = import.meta.env.VITE_LEAD_API_BASE_URL || 'https://crm-dev0-lead-service-v1.make-tronics.com';

class LeadApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: LEAD_API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // REQUEST INTERCEPTOR
    this.client.interceptors.request.use(
      (config) => {
        const { accessToken } = authStore.getState();

        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Safely build the full URL even if baseURL or url are undefined.
        const base = config.baseURL ?? '';
        const path = config.url ?? '';
        const fullUrl = base
          ? `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
          : path;

        // Normalize method
        const method = (config.method || '').toUpperCase();

        // Robust request body handling: strings, objects, FormData, blobs, etc.
        let requestBody = '';
        try {
          const data = config.data;
          if (data == null) {
            requestBody = '';
          } else if (typeof data === 'string') {
            try {
              requestBody = JSON.stringify(JSON.parse(data), null, 2);
            } catch {
              requestBody = data; // plain string
            }
          } else if (typeof FormData !== 'undefined' && data instanceof FormData) {
            requestBody = '[FormData]';
          } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
            requestBody = '[Blob]';
          } else {
            requestBody = JSON.stringify(data, null, 2);
          }
        } catch {
          requestBody = String(config.data);
        }

        // LOG THE REQUEST
        console.log('🔵 ========== API REQUEST ==========');
        console.log('URL:', fullUrl);
        console.log('Method:', method);
        console.log('Headers:', config.headers);
        console.log('Request Body:', requestBody);
        console.log('🔵 ==================================');

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // RESPONSE INTERCEPTOR
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ API SUCCESS:', response.config.url, response.status);
        return response;
      },
      async (error: AxiosError) => {
        // LOG THE ERROR
        console.error('🔴 ========== API ERROR ==========');
        console.error('URL:', error.config?.url);
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Response Data:', error.response?.data);
        console.error('Request Data:', error.config?.data);
        console.error('🔴 ================================');

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
      const { refreshToken } = authStore.getState();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL || 'https://crm-dev0-auth-service-v1.make-tronics.com';
      const response = await axios.post(`${AUTH_API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      authStore.getState().setAccessToken(accessToken);
      // Update refresh token if provided
      if (newRefreshToken) {
        authStore.getState().login(authStore.getState().user!, accessToken, newRefreshToken);
      }
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

export const leadApiClient = new LeadApiClient();