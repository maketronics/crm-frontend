import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lead, PaginatedResponse, LeadFilters, LeadStage } from '../types';

interface LeadStageInfo {
  stage: LeadStage;
  opportunityId?: string;
  quotationSupplierId?: string;
  quotationCustomerId?: string;
  negotiationId?: string;
  poReceivedId?: string;
  updatedAt: string;
}

interface LeadStore {
  leads: Lead[];
  totalLeads: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: LeadFilters;
  
  // ✅ NEW: Stage tracking (persisted)
  stageCache: Record<string, LeadStageInfo>;

  setLeads: (response: any) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  removeLead: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: LeadFilters) => void;
  clearFilters: () => void;
  clearLeads: () => void;
  
  // ✅ NEW: Stage management
  updateLeadStage: (leadId: string, stageInfo: LeadStageInfo) => void;
  getEnrichedLeads: () => Lead[];
  clearStageCache: () => void;
}

// Helper function to enrich a single lead with cached stage data
const enrichLeadWithCache = (lead: Lead, stageCache: Record<string, LeadStageInfo>): Lead => {
  const cachedStage = stageCache[lead.id];
  if (cachedStage) {
    return {
      ...lead,
      stage: cachedStage.stage,
      opportunityId: cachedStage.opportunityId,
      quotationSupplierId: cachedStage.quotationSupplierId,
      quotationCustomerId: cachedStage.quotationCustomerId,
      negotiationId: cachedStage.negotiationId,
      poReceivedId: cachedStage.poReceivedId,
    };
  }
  return { ...lead, stage: (lead.stage || 'lead') as LeadStage };
};

export const leadStore = create<LeadStore>()(
  persist(
    (set, get) => ({
      leads: [],
      totalLeads: 0,
      currentPage: 1,
      totalPages: 1,
      isLoading: false,
      error: null,
      filters: {},
      stageCache: {},

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
          currentPage = (response.number || 0) + 1;
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

        // ✅ Enrich leads with cached stage data
        const { stageCache } = get();
        const enrichedLeads = leads.map(lead => enrichLeadWithCache(lead, stageCache));

        console.log('LeadStore: Processed leads:', { 
          leads: enrichedLeads, 
          totalLeads, 
          currentPage, 
          totalPages,
          enrichedCount: enrichedLeads.filter(l => stageCache[l.id]).length
        });

        set({
          leads: enrichedLeads,
          totalLeads,
          currentPage,
          totalPages,
        });
      },

      addLead: (lead: Lead) => {
        const { stageCache } = get();
        const enrichedLead = enrichLeadWithCache(lead, stageCache);
        
        set((state) => ({
          leads: [enrichedLead, ...(state.leads || [])],
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
        set((state) => {
          // Also remove from stage cache
          const newStageCache = { ...state.stageCache };
          delete newStageCache[id];
          
          return {
            leads: (state.leads || []).filter((lead) => lead.id !== id),
            totalLeads: Math.max(0, (state.totalLeads || 0) - 1),
            stageCache: newStageCache,
          };
        });
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

      // ✅ NEW: Store stage information in cache
      updateLeadStage: (leadId, stageInfo) => {
        set((state) => {
          console.log('💾 Persisting stage data for lead:', leadId, stageInfo);
          
          const newStageCache = {
            ...state.stageCache,
            [leadId]: {
              ...stageInfo,
              updatedAt: new Date().toISOString(),
            },
          };

          // Also update the lead in the leads array
          const updatedLeads = (state.leads || []).map((lead) =>
            lead.id === leadId
              ? {
                  ...lead,
                  stage: stageInfo.stage,
                  opportunityId: stageInfo.opportunityId,
                  quotationSupplierId: stageInfo.quotationSupplierId,
                  quotationCustomerId: stageInfo.quotationCustomerId,
                  negotiationId: stageInfo.negotiationId,
                  poReceivedId: stageInfo.poReceivedId,
                }
              : lead
          );

          return {
            stageCache: newStageCache,
            leads: updatedLeads,
          };
        });
      },

      // ✅ NEW: Get leads enriched with stage data
      getEnrichedLeads: () => {
        const { leads, stageCache } = get();
        return leads.map(lead => enrichLeadWithCache(lead, stageCache));
      },

      // ✅ NEW: Clear cache (for testing/debugging)
      clearStageCache: () => {
        console.log('🗑️ Clearing stage cache');
        set({ stageCache: {} });
      },
    }),
    {
      name: 'lead-storage', // localStorage key
      partialize: (state) => ({
        // Only persist the stage cache, not the leads themselves
        stageCache: state.stageCache,
      }),
    }
  )
);