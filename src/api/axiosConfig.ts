import axios from 'axios';
import { authStore } from '../stores/authStore';

const BASE_URL = 'https://crm-dev0-lead-service-v1.make-tronics.com';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from authStore instead of localStorage
    const { accessToken } = authStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = authStore.getState();
        
        if (refreshToken) {
          // Try to refresh the token
          const authResponse = await axios.post(
            'https://crm-dev0-auth-service-v1.make-tronics.com/auth/refresh',
            { refreshToken }
          );

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = authResponse.data;
          
          // Update tokens in store
          const { user } = authStore.getState();
          if (user) {
            authStore.getState().login(user, newAccessToken, newRefreshToken);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout and redirect
        console.error('Token refresh failed:', refreshError);
        authStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For other errors or if refresh failed
    if (error.response?.status === 401) {
      authStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;