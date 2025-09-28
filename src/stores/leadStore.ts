import { create } from 'zustand';
import type { Lead, PaginatedResponse, LeadFilters } from '../types';

interface LeadStore {
  leads: Lead[];
  totalLeads: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: LeadFilters;

  setLeads: (response: any) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  removeLead: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: LeadFilters) => void;
  clearFilters: () => void;
  clearLeads: () => void;
}

export const leadStore = create<LeadStore>((set) => ({
  leads: [],
  totalLeads: 0,
  currentPage: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  filters: {},

  setLeads: (response: any) => {
    console.log('LeadStore: Setting leads with response:', response);

    // Handle Spring Boot paginated response format
    let leads = [];
    let totalLeads = 0;
    let currentPage = 1;
    let totalPages = 1;

    if (response.content && Array.isArray(response.content)) {
      // Spring Boot format
      leads = response.content;
      totalLeads = response.totalElements || 0;
      currentPage = (response.number || 0) + 1; // Convert from 0-based to 1-based
      totalPages = response.totalPages || 1;
    } else if (response.data && Array.isArray(response.data)) {
      // Standard format
      leads = response.data;
      totalLeads = response.total || 0;
      currentPage = response.page || 1;
      totalPages = response.totalPages || 1;
    } else if (Array.isArray(response)) {
      // Direct array
      leads = response;
      totalLeads = response.length;
      currentPage = 1;
      totalPages = 1;
    }

    console.log('LeadStore: Processed leads:', { leads, totalLeads, currentPage, totalPages });

    set({
      leads,
      totalLeads,
      currentPage,
      totalPages,
    });
  },

  addLead: (lead: Lead) => {
    set((state) => ({
      leads: [lead, ...(state.leads || [])],
      totalLeads: (state.totalLeads || 0) + 1,
    }));
  },

  updateLead: (id: string, updates: Partial<Lead>) => {
    set((state) => ({
      leads: (state.leads || []).map((lead) =>
        lead.id === id ? { ...lead, ...updates } : lead
      ),
    }));
  },

  removeLead: (id: string) => {
    set((state) => ({
      leads: (state.leads || []).filter((lead) => lead.id !== id),
      totalLeads: Math.max(0, (state.totalLeads || 0) - 1),
    }));
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setFilters: (filters: LeadFilters) => {
    set({ filters });
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearLeads: () => {
    set({
      leads: [],
      totalLeads: 0,
      currentPage: 1,
      totalPages: 1,
      error: null,
    });
  },
}));