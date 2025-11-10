import axiosInstance from './axiosConfig';
import { Lead, CreateLeadRequest, LeadsListParams, LeadsListResponse } from '../types/lead.types';

export const leadApi = {
  // Create lead
  createLead: async (data: CreateLeadRequest): Promise<Lead> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await axiosInstance.post('/leads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all leads with filters
  getLeads: async (params?: LeadsListParams): Promise<LeadsListResponse> => {
    const response = await axiosInstance.get('/leads', { params });
    return response.data;
  },

  // Get lead by ID
  getLeadById: async (id: string): Promise<Lead> => {
    const response = await axiosInstance.get(`/leads/${id}`);
    return response.data;
  },

  // Update lead
  updateLead: async (id: string, data: Partial<CreateLeadRequest>): Promise<Lead> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await axiosInstance.put(`/leads/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete lead
  deleteLead: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/leads/${id}`);
  },
};