import axiosInstance from './axiosConfig';

export interface POReceivedNotes {
  text: string;
  fileUrls: string[];
}

export interface POReceived {
  id?: string;
  leadId?: string;
  poDocument: string;
  specialTermsAndConditions: string;
  dhlFedexAccountNumber: string;
  notes: POReceivedNotes;
  stage: string;
}

export interface CreatePOReceivedRequest {
  poDocument: File;
  specialTermsAndConditions: string;
  dhlFedexAccountNumber: string;
  notesText?: string;
  notesFile?: File;
  stage?: string;
}

export const poReceivedApi = {
  create: async (leadId: string, data: CreatePOReceivedRequest): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('poDocument', data.poDocument);
    formData.append('specialTermsAndConditions', data.specialTermsAndConditions);
    formData.append('dhlFedexAccountNumber', data.dhlFedexAccountNumber);
    
    if (data.notesText) formData.append('notesText', data.notesText);
    if (data.notesFile) formData.append('notesFile', data.notesFile);
    if (data.stage) formData.append('stage', data.stage);

    const response = await axiosInstance.post(`/po-received/${leadId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAll: async (): Promise<POReceived[]> => {
    const response = await axiosInstance.get('/po-received');
    return response.data;
  },

  getByLeadId: async (leadId: string): Promise<POReceived> => {
    const response = await axiosInstance.get(`/po-received/${leadId}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePOReceivedRequest>): Promise<{ message: string }> => {
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

    const response = await axiosInstance.put(`/po-received/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/po-received/${id}`);
    return response.data;
  },
};