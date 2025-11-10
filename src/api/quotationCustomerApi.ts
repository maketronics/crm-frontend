import axiosInstance from './axiosConfig';

export interface QuotationCustomerNotes {
  text: string;
  fileUrls: string[];
}

export interface QuotationCustomer {
  id?: string;
  model: string;
  brand: string;
  des: string;
  coo: string;
  dc: string;
  qty: number;
  quote: string;
  warranty: string;
  leadTime: string;
  dealProbability?: number;
  expectedClosureDate?: string;
  dealValue: number;
  totalValue: number;
  grossMargin: number;
  notes: QuotationCustomerNotes;
  stage: string;
}

export interface CreateQuotationCustomerRequest {
  model: string;
  brand: string;
  des: string;
  coo: string;
  dc: string;
  qty: number;
  quote: string;
  warranty: string;
  leadTime: string;
  dealProbability?: number;
  expectedClosureDate?: string;
  dealValue: number;
  totalValue: number;
  grossMargin: number;
  notesText?: string;
  notesFile?: File;
  stage?: string;
}

export const quotationCustomerApi = {
  create: async (data: CreateQuotationCustomerRequest): Promise<{ message: string }> => {
    const formData = new FormData();
    
    // Required fields
    formData.append('model', data.model);
    formData.append('brand', data.brand);
    formData.append('des', data.des);
    formData.append('coo', data.coo);
    formData.append('dc', data.dc);
    formData.append('qty', data.qty.toString());
    formData.append('quote', data.quote);
    formData.append('warranty', data.warranty);
    formData.append('leadTime', data.leadTime);
    formData.append('dealValue', data.dealValue.toString());
    formData.append('totalValue', data.totalValue.toString());
    formData.append('grossMargin', data.grossMargin.toString());
    
    // Optional fields
    if (data.dealProbability !== undefined) formData.append('dealProbability', data.dealProbability.toString());
    if (data.expectedClosureDate) formData.append('expectedClosureDate', data.expectedClosureDate);
    if (data.notesText) formData.append('notesText', data.notesText);
    if (data.notesFile) formData.append('notesFile', data.notesFile);
    if (data.stage) formData.append('stage', data.stage);

    const response = await axiosInstance.post('/quotations-customers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAll: async (): Promise<QuotationCustomer[]> => {
    const response = await axiosInstance.get('/quotations-customers');
    return response.data;
  },

  getById: async (id: string): Promise<QuotationCustomer> => {
    const response = await axiosInstance.get(`/quotations-customers/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateQuotationCustomerRequest>): Promise<{ message: string }> => {
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

    const response = await axiosInstance.put(`/quotations-customers/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete(`/quotations-customers/${id}`);
    return response.data;
  },
};