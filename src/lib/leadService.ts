import { leadApiClient } from './leadApiClient';
import type { 
  Lead, 
  CreateLeadRequest, 
  LeadFilters, 
  PaginatedResponse, 
  LeadComment, 
  CreateCommentRequest, 
  AssignLeadRequest,
  LeadStage,
  UpdateLeadStageRequest,
  SupplierQuotation,
  CustomerQuotation,
  OrderStatus
} from '../types';

export const leadService = {
  // Existing methods
  async getAllLeads(params?: {
    page?: number;
    size?: number;
    filters?: LeadFilters;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (params?.page !== undefined) queryParams.append('page', (params.page - 1).toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              queryParams.append(key, value.join(','));
            }
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    return leadApiClient.get<any>(`/leads?${queryParams.toString()}`);
  },

  async getLeadById(id: string): Promise<Lead> {
    return leadApiClient.get<Lead>(`/leads/${id}`);
  },

  async createLead(data: CreateLeadRequest): Promise<Lead> {
    return leadApiClient.post<Lead>('/leads', data);
  },

 async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  console.log('📤 Updating lead:', id);
  console.log('📤 Request body:', JSON.stringify(data, null, 2));
  
  const result = await leadApiClient.put<Lead>(`/leads/${id}`, data);
  
  console.log('✅ Update response:', result);
  return result;
},

  async deleteLead(id: string): Promise<void> {
    return leadApiClient.delete<void>(`/leads/${id}`);
  },

  async assignLeadPatch(leadId: string, userId: string): Promise<Lead> {
    return leadApiClient.patch<Lead>(`/leads/${leadId}/assign`, { assignedTo: userId });
  },

  async updateStatus(leadId: string, status: Lead['status']): Promise<Lead> {
    return leadApiClient.patch<Lead>(`/leads/${leadId}/status`, { status });
  },

  // Kanban-specific methods
  async updateLeadStage(id: string, stage: LeadStage, updatedBy?: string): Promise<Lead> {
    const data: UpdateLeadStageRequest = {
      stage,
      updatedBy: updatedBy || 'system'
    };
    return leadApiClient.patch<Lead>(`/leads/${id}/stage`, data);
  },

  async bulkUpdateStage(leadIds: string[], stage: LeadStage): Promise<Lead[]> {
    return leadApiClient.post<Lead[]>('/leads/bulk-update-stage', {
      leadIds,
      stage,
    });
  },

  // Validation for stage transitions
  async validateLeadForStage(leadId: string, stage: LeadStage): Promise<{
    isValid: boolean;
    missingFields: string[];
  }> {
    try {
      return leadApiClient.get<{
        isValid: boolean;
        missingFields: string[];
      }>(`/leads/${leadId}/validate-stage/${stage}`);
    } catch (error) {
      // If endpoint doesn't exist, do client-side validation
      const lead = await this.getLeadById(leadId);
      return this.clientSideValidation(lead, stage);
    }
  },

  // Client-side validation helper
  clientSideValidation(lead: Lead, stage: LeadStage): {
    isValid: boolean;
    missingFields: string[];
  } {
    const validations: Record<LeadStage, (keyof Lead)[]> = {
      qualified: ['title', 'contactPerson', 'organization', 'partNumber', 'quantity', 'region'],
      quotation_received: ['title', 'contactPerson', 'organization', 'partNumber', 'quantity', 'region'],
      quotation_shared: ['title', 'contactPerson', 'organization', 'partNumber', 'quantity', 'region', 'value'],
      negotiation_started: ['title', 'contactPerson', 'organization', 'partNumber', 'quantity', 'region', 'value'],
      po_received: ['title', 'contactPerson', 'organization', 'partNumber', 'quantity', 'region', 'value', 'poDocument'],
      parts_delivered: ['title', 'contactPerson', 'organization', 'partNumber', 'quantity', 'region', 'value', 'poDocument', 'awbNumber']
    };

    const requiredFields = validations[stage] || [];
    const missingFields: string[] = [];
    
    requiredFields.forEach(field => {
      const value = lead[field];
      if (!value || (typeof value === 'number' && value <= 0)) {
        missingFields.push(field);
      }
    });

    return { isValid: missingFields.length === 0, missingFields };
  },

  // Comment methods
  async getLeadComments(leadId: string): Promise<LeadComment[]> {
    return leadApiClient.get<LeadComment[]>(`/leads/${leadId}/comments`);
  },

  async createComment(leadId: string, data: CreateCommentRequest): Promise<LeadComment> {
    return leadApiClient.post<LeadComment>(`/leads/${leadId}/comments`, data);
  },

  async deleteComment(leadId: string, commentId: string): Promise<void> {
    return leadApiClient.delete<void>(`/leads/${leadId}/comments/${commentId}`);
  },

  // File upload
  async uploadFile(leadId: string, file: File, fileType: 'po' | 'invoice' | 'qc' | 'general' = 'general'): Promise<{ fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);
    
    return leadApiClient.post<{ fileUrl: string }>(
      `/leads/${leadId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // Supplier Quotation methods
  async addSupplierQuotation(leadId: string, quotation: Omit<SupplierQuotation, 'id' | 'createdAt'>): Promise<Lead> {
    return leadApiClient.post<Lead>(`/leads/${leadId}/supplier-quotations`, quotation);
  },

  async updateSupplierQuotation(leadId: string, quotationId: string, quotation: Partial<SupplierQuotation>): Promise<Lead> {
    return leadApiClient.patch<Lead>(`/leads/${leadId}/supplier-quotations/${quotationId}`, quotation);
  },

  async deleteSupplierQuotation(leadId: string, quotationId: string): Promise<Lead> {
    return leadApiClient.delete<Lead>(`/leads/${leadId}/supplier-quotations/${quotationId}`);
  },

  // Customer Quotation methods
  async createCustomerQuotation(leadId: string, quotation: Omit<CustomerQuotation, 'id' | 'sentAt'>): Promise<Lead> {
    return leadApiClient.post<Lead>(`/leads/${leadId}/customer-quotation`, quotation);
  },

  async sendCustomerQuotation(leadId: string, emailIds: string[]): Promise<Lead> {
    return leadApiClient.post<Lead>(`/leads/${leadId}/customer-quotation/send`, { emailIds });
  },

  // PO and Order management
  async updateOrderStatus(leadId: string, status: OrderStatus, notes?: string): Promise<Lead> {
    return leadApiClient.patch<Lead>(`/leads/${leadId}/order-status`, { status, notes });
  },

  async addQCImages(leadId: string, images: File[]): Promise<Lead> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images`, image);
    });
    
    return leadApiClient.post<Lead>(
      `/leads/${leadId}/qc-images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  async updateAWBNumber(leadId: string, awbNumber: string): Promise<Lead> {
    return leadApiClient.patch<Lead>(`/leads/${leadId}/awb`, { awbNumber });
  },

  // Email sequencing
  async scheduleFeedbackEmails(leadId: string, frequency: number, count: number): Promise<void> {
    return leadApiClient.post<void>(`/leads/${leadId}/schedule-feedback`, {
      frequency,
      count
    });
  },
};