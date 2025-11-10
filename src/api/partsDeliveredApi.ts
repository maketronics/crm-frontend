import axiosInstance from './axiosConfig';

export interface PartsDeliveredNote {
  text: string;
  fileUrls: string[];
}

export interface PartsDelivered {
  id?: string;
  model: string;
  qty: number;
  pricePerUnit: number;
  dc: string;
  leadTime: string;
  deliveredAt?: string;
  note: PartsDeliveredNote;
  stage: string;
}

export interface CreatePartsDeliveredRequest {
  model: string;
  qty: number;
  pricePerUnit: number;
  dc: string;
  leadTime: string;
  deliveredAt?: string;
  notesText?: string;
  notesFile?: File;
  stage?: string;
}

export const partsDeliveredApi = {
  create: async (data: CreatePartsDeliveredRequest): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('model', data.model);
    formData.append('qty', data.qty.toString());
    formData.append('pricePerUnit', data.pricePerUnit.toString());
    formData.append('dc', data.dc);
    formData.append('leadTime', data.leadTime);
    
    if (data.deliveredAt) formData.append('deliveredAt', data.deliveredAt);
    if (data.notesText) formData.append('notesText', data.notesText);
    if (data.notesFile) formData.append('notesFile', data.notesFile);
    if (data.stage) formData.append('stage', data.stage);

    const response = await axiosInstance.post('/parts-delivered', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAll: async (): Promise<PartsDelivered[]> => {
    const response = await axiosInstance.get('/parts-delivered');
    return response.data;
  },

  getById: async (id: string): Promise<PartsDelivered> => {
    const response = await axiosInstance.get(`/parts-delivered/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePartsDeliveredRequest>): Promise<{ message: string }> => {
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

    const response = await axiosInstance.put(`/parts-delivered/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/parts-delivered/${id}`);
    return response.data;
  },
};