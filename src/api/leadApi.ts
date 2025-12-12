import { leadApiClient } from '../lib/leadApiClient';
import type {
  Lead,
  CreateLeadRequest,
  LeadsListParams,
  LeadsListResponse,
  ApiResponse,
  Opportunity,
  CreateOpportunityRequest,
  Negotiation,
  CreateNegotiationRequest,
  QuotationSupplier,
  CreateQuotationSupplierRequest,
  QuotationCustomer,
  CreateQuotationCustomerRequest,
  POReceived,
  CreatePOReceivedRequest,
  PartsDelivered,
  CreatePartsDeliveredRequest,
} from '../types/lead.types';

// ==================== HELPER FUNCTION ====================
const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'object' && !(value instanceof Date)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  
  return formData;
};

// ==================== LEADS API ====================
export const leadApi = {
  // Create lead
  createLead: async (data: CreateLeadRequest): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.post<ApiResponse>('/leads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get all leads with filters and pagination
  getLeads: async (params?: LeadsListParams): Promise<LeadsListResponse> => {
    return leadApiClient.get<LeadsListResponse>('/leads', { params });
  },

  // Get lead by ID
  getLeadById: async (id: string): Promise<Lead> => {
    return leadApiClient.get<Lead>(`/leads/${id}`);
  },

  // Update lead
  updateLead: async (id: string, data: Partial<CreateLeadRequest>): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.put<ApiResponse>(`/leads/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Soft delete lead
  deleteLead: async (id: string): Promise<ApiResponse> => {
    return leadApiClient.delete<ApiResponse>(`/leads/${id}`);
  },
};

// ==================== OPPORTUNITIES API ====================
export const opportunityApi = {
  // Create opportunity for a lead
  createOpportunity: async (leadId: string, data: CreateOpportunityRequest): Promise<ApiResponse> => {
    return leadApiClient.post<ApiResponse>(`/opportunities/${leadId}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // Get all opportunities
  getOpportunities: async (): Promise<Opportunity[]> => {
    return leadApiClient.get<Opportunity[]>('/opportunities');
  },

  // Get opportunity by lead ID
  getOpportunityByLeadId: async (leadId: string): Promise<Opportunity> => {
    return leadApiClient.get<Opportunity>(`/opportunities/${leadId}`);
  },

  // Update opportunity
  updateOpportunity: async (id: string, data: Partial<CreateOpportunityRequest>): Promise<ApiResponse> => {
    return leadApiClient.put<ApiResponse>(`/opportunities/${id}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // Delete opportunity
  deleteOpportunity: async (id: string): Promise<ApiResponse> => {
    return leadApiClient.delete<ApiResponse>(`/opportunities/${id}`);
  },
};

// ==================== NEGOTIATIONS API ====================
export const negotiationApi = {
  // Create negotiation record for a lead
  createNegotiation: async (leadId: string, data: CreateNegotiationRequest): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.post<ApiResponse>(`/negotiations/${leadId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get all negotiations
  getNegotiations: async (): Promise<Negotiation[]> => {
    return leadApiClient.get<Negotiation[]>('/negotiations');
  },

  // Get negotiation by lead ID
  getNegotiationByLeadId: async (leadId: string): Promise<Negotiation> => {
    return leadApiClient.get<Negotiation>(`/negotiations/${leadId}`);
  },

  // Update negotiation
  updateNegotiation: async (id: string, data: Partial<CreateNegotiationRequest>): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.put<ApiResponse>(`/negotiations/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete negotiation
  deleteNegotiation: async (id: string): Promise<ApiResponse> => {
    return leadApiClient.delete<ApiResponse>(`/negotiations/${id}`);
  },
};

// ==================== QUOTATIONS SUPPLIERS API ====================
export const quotationSupplierApi = {
  // Create quotation from supplier for a lead
  createQuotationSupplier: async (leadId: string, data: CreateQuotationSupplierRequest): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.post<ApiResponse>(`/quotations-suppliers/${leadId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get all supplier quotations
  getQuotationsSuppliers: async (): Promise<QuotationSupplier[]> => {
    return leadApiClient.get<QuotationSupplier[]>('/quotations-suppliers');
  },

  // Get supplier quotation by lead ID
  getQuotationSupplierByLeadId: async (leadId: string): Promise<QuotationSupplier> => {
    return leadApiClient.get<QuotationSupplier>(`/quotations-suppliers/${leadId}`);
  },

  // Update supplier quotation
  updateQuotationSupplier: async (id: string, data: Partial<CreateQuotationSupplierRequest>): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.put<ApiResponse>(`/quotations-suppliers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete supplier quotation
  deleteQuotationSupplier: async (id: string): Promise<ApiResponse> => {
    return leadApiClient.delete<ApiResponse>(`/quotations-suppliers/${id}`);
  },
};

// ==================== QUOTATIONS CUSTOMERS API ====================
export const quotationCustomerApi = {
  // Create quotation shared with customer for a lead
  createQuotationCustomer: async (leadId: string, data: CreateQuotationCustomerRequest): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.post<ApiResponse>(`/quotations-customers/${leadId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get all customer quotations
  getQuotationsCustomers: async (): Promise<QuotationCustomer[]> => {
    return leadApiClient.get<QuotationCustomer[]>('/quotations-customers');
  },

  // Get customer quotation by lead ID
  getQuotationCustomerByLeadId: async (leadId: string): Promise<QuotationCustomer> => {
    return leadApiClient.get<QuotationCustomer>(`/quotations-customers/${leadId}`);
  },

  // Update customer quotation
  updateQuotationCustomer: async (id: string, data: Partial<CreateQuotationCustomerRequest>): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.put<ApiResponse>(`/quotations-customers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete customer quotation
  deleteQuotationCustomer: async (id: string): Promise<ApiResponse> => {
    return leadApiClient.delete<ApiResponse>(`/quotations-customers/${id}`);
  },
};

// ==================== PO RECEIVED API ====================
export const poReceivedApi = {
  // Create PO received record for a lead
  createPOReceived: async (leadId: string, data: CreatePOReceivedRequest): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.post<ApiResponse>(`/po-received/${leadId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get all PO received records
  getPOsReceived: async (): Promise<POReceived[]> => {
    return leadApiClient.get<POReceived[]>('/po-received');
  },

  // Get PO received by lead ID
  getPOReceivedByLeadId: async (leadId: string): Promise<POReceived> => {
    return leadApiClient.get<POReceived>(`/po-received/${leadId}`);
  },

  // Update PO received
  updatePOReceived: async (id: string, data: Partial<CreatePOReceivedRequest>): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.put<ApiResponse>(`/po-received/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete PO received
  deletePOReceived: async (id: string): Promise<ApiResponse> => {
    return leadApiClient.delete<ApiResponse>(`/po-received/${id}`);
  },
};

// ==================== PARTS DELIVERED API ====================
export const partsDeliveredApi = {
  // Create parts delivered record for a lead
  createPartsDelivered: async (leadId: string, data: CreatePartsDeliveredRequest): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.post<ApiResponse>(`/parts-delivered/${leadId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get all parts delivered records
  getPartsDelivered: async (): Promise<PartsDelivered[]> => {
    return leadApiClient.get<PartsDelivered[]>('/parts-delivered');
  },

  // Get parts delivered by lead ID
  getPartsDeliveredByLeadId: async (leadId: string): Promise<PartsDelivered> => {
    return leadApiClient.get<PartsDelivered>(`/parts-delivered/${leadId}`);
  },

  // Update parts delivered
  updatePartsDelivered: async (id: string, data: Partial<CreatePartsDeliveredRequest>): Promise<ApiResponse> => {
    const formData = createFormData(data);
    
    return leadApiClient.put<ApiResponse>(`/parts-delivered/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete parts delivered
  deletePartsDelivered: async (id: string): Promise<ApiResponse> => {
    return leadApiClient.delete<ApiResponse>(`/parts-delivered/${id}`);
  },
};

// ==================== EXPORT ALL APIs ====================
export const leadServiceApi = {
  leads: leadApi,
  opportunities: opportunityApi,
  negotiations: negotiationApi,
  quotationsSuppliers: quotationSupplierApi,
  quotationsCustomers: quotationCustomerApi,
  poReceived: poReceivedApi,
  partsDelivered: partsDeliveredApi,
};