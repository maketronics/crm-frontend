import { leadApiClient } from './leadApiClient';
import type {
  Lead,
  CreateLeadRequest,
  LeadFilters,
  PaginatedResponse,
  LeadComment,
  CreateCommentRequest,
  AssignLeadRequest
} from '../types';

class LeadService {
  // POST /leads - Create a new lead
  async createLead(data: CreateLeadRequest): Promise<Lead> {
    console.log('LeadService: Creating lead with data:', data);
    try {
      const result = await leadApiClient.post<Lead>('/leads', data);
      console.log('LeadService: Lead created successfully:', result);
      return result;
    } catch (error) {
      console.error('LeadService: Error creating lead:', error);
      throw error;
    }
  }

  // GET /leads - List leads with pagination and filters
  async getLeads(page = 1, size = 20, filters?: LeadFilters): Promise<PaginatedResponse<Lead>> {
    const queryParams = new URLSearchParams({
      page: (page - 1).toString(), // API expects 0-based indexing
      size: size.toString(),
    });

    // Add filters to query params
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)) {
          if (key === 'labels' && Array.isArray(value)) {
            queryParams.set('labels', value.join(','));
          } else {
            queryParams.set(key, value.toString());
          }
        }
      });
    }

    console.log('LeadService: Fetching leads with URL:', `/leads?${queryParams}`);

    try {
      const response = await leadApiClient.get<any>(`/leads?${queryParams}`);
      console.log('LeadService: Raw API response:', response);

      // Handle different response formats
      let formattedResponse: PaginatedResponse<Lead>;

      if (response.content && Array.isArray(response.content)) {
        // Spring Boot paginated response format
        formattedResponse = {
          data: response.content,
          total: response.totalElements || response.total || 0,
          page: (response.number || response.page || 0) + 1, // Convert to 1-based
          size: response.size || size,
          totalPages: response.totalPages || 1,
        };
      } else if (Array.isArray(response)) {
        // Direct array response
        formattedResponse = {
          data: response,
          total: response.length,
          page: page,
          size: response.length,
          totalPages: 1,
        };
      } else if (response.data && Array.isArray(response.data)) {
        // Already formatted response
        formattedResponse = response;
      } else {
        // Fallback
        formattedResponse = {
          data: [],
          total: 0,
          page: 1,
          size: size,
          totalPages: 1,
        };
      }

      console.log('LeadService: Formatted response:', formattedResponse);
      return formattedResponse;
    } catch (error) {
      console.error('LeadService: Error fetching leads:', error);
      throw error;
    }
  }

  // GET /leads/{id} - Get lead details by ID
  async getLeadById(id: string): Promise<Lead> {
    return await leadApiClient.get<Lead>(`/leads/${id}`);
  }

  // PUT /leads/{id} - Full update of a lead
  async updateLead(id: string, data: CreateLeadRequest): Promise<Lead> {
    return await leadApiClient.put<Lead>(`/leads/${id}`, data);
  }

  // PATCH /leads/{id} - Partial update (status changes, assignment)
  async updateLeadPartial(id: string, updates: Partial<Lead>): Promise<Lead> {
    return await leadApiClient.patch<Lead>(`/leads/${id}`, updates);
  }

  // DELETE /leads/{id} - Soft delete a lead
  async deleteLead(id: string): Promise<void> {
    return await leadApiClient.delete(`/leads/${id}`);
  }

  // POST /leads/{id}/assign - Assign a lead to a user
  async assignLead(id: string, data: AssignLeadRequest): Promise<Lead> {
    return await leadApiClient.post<Lead>(`/leads/${id}/assign`, data);
  }

  // POST /leads/comments/{id} - Add comment to a lead
  async addComment(leadId: string, data: CreateCommentRequest): Promise<LeadComment> {
    return await leadApiClient.post<LeadComment>(`/leads/comments/${leadId}`, data);
  }

  // GET /leads/comments/{id} - List all comments regarding a lead
  async getComments(leadId: string): Promise<LeadComment[]> {
    return await leadApiClient.get<LeadComment[]>(`/leads/comments/${leadId}`);
  }

  // Helper method to update status
  async updateStatus(id: string, status: Lead['status']): Promise<Lead> {
    return this.updateLeadPartial(id, { status });
  }

  // Helper method to assign lead using PATCH (fallback)
  async assignLeadPatch(id: string, assignedTo: string): Promise<Lead> {
    return this.updateLeadPartial(id, { assignedTo: assignedTo || undefined });
  }
}

export const leadService = new LeadService();