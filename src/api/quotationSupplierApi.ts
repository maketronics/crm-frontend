import axiosInstance from './axiosConfig';

export interface QuotationSupplierNotes {
  text: string;
  fileUrls: string[];
}

export interface QuotationSupplier {
  id?: string;
  leadId?: string;
  partNumber: string;
  supplierName: string;
  manufacturer: string;
  quantity: number;
  amount: number;
  estimatedDate?: string;
  rohsCompliant?: boolean;
  testingType: string;
  notes: QuotationSupplierNotes;
  stage: string;
}

export interface CreateQuotationSupplierRequest {
  partNumber: string;
  supplierName: string;
  manufacturer: string;
  quantity: number;
  amount: number;
  estimatedDate?: string;
  rohsCompliant?: boolean;
  testingType: string;
  notesText?: string;
  notesFile?: File;
  stage?: string;
}

export const quotationSupplierApi = {
  create: async (leadId: string, data: CreateQuotationSupplierRequest): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('partNumber', data.partNumber);
    formData.append('supplierName', data.supplierName);
    formData.append('manufacturer', data.manufacturer);
    formData.append('quantity', data.quantity.toString());
    formData.append('amount', data.amount.toString());
    formData.append('testingType', data.testingType);
    
    if (data.estimatedDate) formData.append('estimatedDate', data.estimatedDate);
    if (data.rohsCompliant !== undefined) formData.append('rohsCompliant', data.rohsCompliant.toString());
    if (data.notesText) formData.append('notesText', data.notesText);
    if (data.notesFile) formData.append('notesFile', data.notesFile);
    if (data.stage) formData.append('stage', data.stage);

    const response = await axiosInstance.post(`/quotations-suppliers/${leadId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAll: async (): Promise<QuotationSupplier[]> => {
    const response = await axiosInstance.get('/quotations-suppliers');
    return response.data;
  },

  getByLeadId: async (leadId: string): Promise<QuotationSupplier> => {
    const response = await axiosInstance.get(`/quotations-suppliers/${leadId}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateQuotationSupplierRequest>): Promise<{ message: string }> => {
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

    const response = await axiosInstance.put(`/quotations-suppliers/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/quotations-suppliers/${id}`);
    return response.data;
  },
};