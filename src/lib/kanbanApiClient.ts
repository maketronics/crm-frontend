import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { authStore } from '../stores/authStore';
import type {
  ApiError,
  Opportunity,
  QuotationSupplier,
  QuotationCustomer,
  Negotiation,
  POReceived,
} from '../types';

// ✅ Backend Base URL (as per backend document)
const KANBAN_API_BASE_URL = 'https://crm-dev0-lead-service-v1.make-tronics.com';

class KanbanApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: KANBAN_API_BASE_URL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  // 🔐 Add Authorization and Error Handling
  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const { accessToken } = authStore.getState();
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        } else {
          console.warn('⚠️ No access token found in authStore.');
        }

        console.log(
          `📤 [KanbanAPI] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
        );
        return config;
      },
      (error) => {
        console.error('❌ [KanbanAPI] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ [KanbanAPI] Response:', response.status, response.config.url);
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        console.error(
          '❌ [KanbanAPI] Response error:',
          error.response?.status,
          error.message
        );

        // Token Refresh Flow
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log('🔄 [KanbanAPI] Attempting token refresh...');

          try {
            await this.refreshToken();
            const { accessToken } = authStore.getState();
            if (accessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              console.log('✅ [KanbanAPI] Token refreshed, retrying request');
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error('❌ [KanbanAPI] Token refresh failed. Logging out.');
            authStore.getState().logout();
            return Promise.reject(refreshError);
          }
        }

        const apiError: ApiError = {
          message:
            (error.response?.data as any)?.message ||
            error.message ||
            'An error occurred',
          errors: (error.response?.data as any)?.errors,
        };

        return Promise.reject(apiError);
      }
    );
  }

  private async refreshToken(): Promise<void> {
    const { refreshToken } = authStore.getState();
    if (!refreshToken) throw new Error('No refresh token available');

    const AUTH_API_BASE_URL = 'https://crm-dev0-auth-service-v1.make-tronics.com';
    const response = await axios.post(`${AUTH_API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    authStore.getState().setAccessToken(accessToken);
    if (newRefreshToken) {
      authStore.getState().login(authStore.getState().user!, accessToken, newRefreshToken);
    }
  }

  // ⚙️ Generic CRUD Helpers
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

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // 🟢 Stage 1: Opportunity
  async createOpportunity(
    data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Opportunity> {
    return this.post<Opportunity>('/api/opportunities', data);
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    return this.get<Opportunity>(`/api/opportunities/${id}`);
  }

  async getAllOpportunities(): Promise<Opportunity[]> {
    return this.get<Opportunity[]>('/api/opportunities');
  }

  async updateOpportunity(id: string, data: Partial<Opportunity>): Promise<Opportunity> {
    return this.put<Opportunity>(`/api/opportunities/${id}`, data);
  }

  async deleteOpportunity(id: string): Promise<void> {
    return this.delete<void>(`/api/opportunities/${id}`);
  }

  // 🟡 Stage 2: Quotation from Supplier
  async createQuotationSupplier(
    data: Omit<QuotationSupplier, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QuotationSupplier> {
    return this.post<QuotationSupplier>('/api/quotations-suppliers', data);
  }

  async getQuotationSupplier(id: string): Promise<QuotationSupplier> {
    return this.get<QuotationSupplier>(`/api/quotations-suppliers/${id}`);
  }

  async getAllQuotationsSuppliers(): Promise<QuotationSupplier[]> {
    return this.get<QuotationSupplier[]>('/api/quotations-suppliers');
  }

  async updateQuotationSupplier(
    id: string,
    data: Partial<QuotationSupplier>
  ): Promise<QuotationSupplier> {
    return this.put<QuotationSupplier>(`/api/quotations-suppliers/${id}`, data);
  }

  async deleteQuotationSupplier(id: string): Promise<void> {
    return this.delete<void>(`/api/quotations-suppliers/${id}`);
  }

  // 🟠 Stage 3: Quotation to Customer
  async createQuotationCustomer(
    data: Omit<QuotationCustomer, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<QuotationCustomer> {
    return this.post<QuotationCustomer>('/api/quotations-customers', data);
  }

  async getQuotationCustomer(id: string): Promise<QuotationCustomer> {
    return this.get<QuotationCustomer>(`/api/quotations-customers/${id}`);
  }

  async getAllQuotationsCustomers(): Promise<QuotationCustomer[]> {
    return this.get<QuotationCustomer[]>('/api/quotations-customers');
  }

  async updateQuotationCustomer(
    id: string,
    data: Partial<QuotationCustomer>
  ): Promise<QuotationCustomer> {
    return this.put<QuotationCustomer>(`/api/quotations-customers/${id}`, data);
  }

  async deleteQuotationCustomer(id: string): Promise<void> {
    return this.delete<void>(`/api/quotations-customers/${id}`);
  }

  // 🔵 Stage 4: Negotiation
  async createNegotiation(
    data: Omit<Negotiation, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Negotiation> {
    return this.post<Negotiation>('/api/negotiations', data);
  }

  async getNegotiation(id: string): Promise<Negotiation> {
    return this.get<Negotiation>(`/api/negotiations/${id}`);
  }

  async getAllNegotiations(): Promise<Negotiation[]> {
    return this.get<Negotiation[]>('/api/negotiations');
  }

  async updateNegotiation(id: string, data: Partial<Negotiation>): Promise<Negotiation> {
    return this.put<Negotiation>(`/api/negotiations/${id}`, data);
  }

  async deleteNegotiation(id: string): Promise<void> {
    return this.delete<void>(`/api/negotiations/${id}`);
  }

  // 🔴 Stage 5: PO Received
  async createPOReceived(
    data: Omit<POReceived, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<POReceived> {
    return this.post<POReceived>('/api/po-received', data);
  }

  async getPOReceived(id: string): Promise<POReceived> {
    return this.get<POReceived>(`/api/po-received/${id}`);
  }

  async getAllPOReceived(): Promise<POReceived[]> {
    return this.get<POReceived[]>('/api/po-received');
  }

  async updatePOReceived(id: string, data: Partial<POReceived>): Promise<POReceived> {
    return this.put<POReceived>(`/api/po-received/${id}`, data);
  }

  async deletePOReceived(id: string): Promise<void> {
    return this.delete<void>(`/api/po-received/${id}`);
  }
}

export const kanbanApiClient = new KanbanApiClient();
