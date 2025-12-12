import axiosInstance from './axiosConfig';

export interface Opportunity {
  id?: string;
  leadId?: string;
  partNumber: string;
  quantity: number;
  regionCountry: string;
}

export const opportunityApi = {
  // POST /opportunities/{leadId} - Create New Opportunity
  create: async (leadId: string, data: Omit<Opportunity, 'id' | 'leadId'>): Promise<{ message: string }> => {
    const response = await axiosInstance.post(`/opportunities/${leadId}`, data);
    return response.data;
  },

  // GET /opportunities - List All Opportunities
  getAll: async (): Promise<Opportunity[]> => {
    const response = await axiosInstance.get('/opportunities');
    return response.data;
  },

  // GET /opportunities/{leadId} - Get Opportunities by Lead ID
  getByLeadId: async (leadId: string): Promise<Opportunity> => {
    const response = await axiosInstance.get(`/opportunities/${leadId}`);
    return response.data;
  },

  // PUT /opportunities/{id} - Update Opportunity
  update: async (id: string, data: Partial<Omit<Opportunity, 'id' | 'leadId'>>): Promise<{ message: string }> => {
    const response = await axiosInstance.put(`/opportunities/${id}`, data);
    return response.data;
  },

  // DELETE /opportunities/{id} - Delete Opportunity
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/opportunities/${id}`);
    return response.data;
  },
};