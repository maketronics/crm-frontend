// src/stores/kanbanSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Lead, LeadStage } from '../types';

interface LeadStageData {
  stage: LeadStage;
  opportunityId?: string;
  quotationSupplierId?: string;
  quotationCustomerId?: string;
  negotiationId?: string;
  poReceivedId?: string;
  updatedAt: string;
}

interface KanbanState {
  stageCache: Record<string, LeadStageData>;
}

const initialState: KanbanState = {
  stageCache: {},
};

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    updateLeadStage: (
      state,
      action: PayloadAction<{ leadId: string; stageData: LeadStageData }>
    ) => {
      const { leadId, stageData } = action.payload;
      state.stageCache[leadId] = {
        ...stageData,
        updatedAt: new Date().toISOString(),
      };
      console.log('💾 [Redux] Cached stage data for lead:', leadId, stageData);
    },

    enrichLeadWithStage: (
      state,
      action: PayloadAction<{ leadId: string; lead: Lead }>
    ) => {
      const { leadId } = action.payload;
      const cached = state.stageCache[leadId];
      if (cached) {
        console.log('📦 [Redux] Enriching lead with cached data:', leadId, cached);
      }
    },

    clearLeadStage: (state, action: PayloadAction<string>) => {
      delete state.stageCache[action.payload];
      console.log('🗑️ [Redux] Cleared stage data for lead:', action.payload);
    },

    clearAllStageCache: (state) => {
      state.stageCache = {};
      console.log('🗑️ [Redux] Cleared all stage cache');
    },

    bulkUpdateStageCache: (
      state,
      action: PayloadAction<Record<string, LeadStageData>>
    ) => {
      state.stageCache = {
        ...state.stageCache,
        ...action.payload,
      };
      console.log('💾 [Redux] Bulk updated stage cache');
    },
  },
});

export const {
  updateLeadStage,
  enrichLeadWithStage,
  clearLeadStage,
  clearAllStageCache,
  bulkUpdateStageCache,
} = kanbanSlice.actions;

export default kanbanSlice.reducer;

// Selectors
export const selectStageCache = (state: { kanban: KanbanState }) => state.kanban.stageCache;
export const selectLeadStageData = (leadId: string) => (state: { kanban: KanbanState }) =>
  state.kanban.stageCache[leadId];
export const selectEnrichedLead = (lead: Lead) => (state: { kanban: KanbanState }) => {
  const cached = state.kanban.stageCache[lead.id];
  if (cached) {
    return {
      ...lead,
      stage: cached.stage,
      opportunityId: cached.opportunityId,
      quotationSupplierId: cached.quotationSupplierId,
      quotationCustomerId: cached.quotationCustomerId,
      negotiationId: cached.negotiationId,
      poReceivedId: cached.poReceivedId,
    };
  }
  return lead;
};