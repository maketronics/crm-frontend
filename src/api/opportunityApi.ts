import axiosInstance from './axiosConfig';

export interface Opportunity {
  id?: string;
  partNumber: string;
  quantity: number;
  regionCountry: string;
}

export const opportunityApi = {
  create: async (data: Omit<Opportunity, 'id'>): Promise<{ message: string }> => {
    const response = await axiosInstance.post('/opportunities', data);
    return response.data;
  },

  getAll: async (): Promise<Opportunity[]> => {
    const response = await axiosInstance.get('/opportunities');
    return response.data;
  },

  getById: async (id: string): Promise<Opportunity> => {
    const response = await axiosInstance.get(`/opportunities/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Opportunity>): Promise<{ message: string }> => {
    const response = await axiosInstance.put(`/opportunities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/opportunities/${id}`);
    return response.data;
  },
};