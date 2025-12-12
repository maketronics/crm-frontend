import axiosInstance from './axiosConfig';

export interface NegotiationNotes {
  text: string;
  fileUrls: string[];
}

export interface Negotiation {
  id?: string;
  leadId?: string;
  notes: NegotiationNotes;
  stage: string;
}

export interface CreateNegotiationRequest {
  notesText?: string;
  notesFile?: File;
  stage?: string;
}

export const negotiationApi = {
  create: async (leadId: string, data: CreateNegotiationRequest): Promise<{ message: string }> => {
    const formData = new FormData();
    if (data.notesText) formData.append('notesText', data.notesText);
    if (data.notesFile) formData.append('notesFile', data.notesFile);
    if (data.stage) formData.append('stage', data.stage);

    const response = await axiosInstance.post(`/negotiations/${leadId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAll: async (): Promise<Negotiation[]> => {
    const response = await axiosInstance.get('/negotiations');
    return response.data;
  },

  getByLeadId: async (leadId: string): Promise<Negotiation> => {
    const response = await axiosInstance.get(`/negotiations/${leadId}`);
    return response.data;
  },

  update: async (id: string, data: CreateNegotiationRequest): Promise<{ message: string }> => {
    const formData = new FormData();
    if (data.notesText) formData.append('notesText', data.notesText);
    if (data.notesFile) formData.append('notesFile', data.notesFile);
    if (data.stage) formData.append('stage', data.stage);

    const response = await axiosInstance.put(`/negotiations/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/negotiations/${id}`);
    return response.data;
  },
};