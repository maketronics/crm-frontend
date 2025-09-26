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

  setLeads: (response: PaginatedResponse<Lead>) => void;
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

  setLeads: (response: PaginatedResponse<Lead>) => {
    set({
      leads: response.data,
      totalLeads: response.total,
      currentPage: response.page,
      totalPages: response.totalPages,
    });
  },

  addLead: (lead: Lead) => {
    set((state) => ({
      leads: [lead, ...state.leads],
      totalLeads: state.totalLeads + 1,
    }));
  },

  updateLead: (id: string, updates: Partial<Lead>) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, ...updates } : lead
      ),
    }));
  },

  removeLead: (id: string) => {
    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
      totalLeads: state.totalLeads - 1,
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