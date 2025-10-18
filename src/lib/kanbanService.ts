// src/lib/kanbanService.ts
import { kanbanApiClient } from './kanbanApiClient';
import { store } from '../stores/store';
import { updateLeadStage, selectLeadStageData } from '../stores/kanbanSlice';
import type { Lead, LeadStage } from '../types';

export const kanbanService = {
  /**
   * Move lead to a new stage and create/update the appropriate record
   */
  async moveLeadToStage(lead: Lead, newStage: LeadStage, userId: string): Promise<Lead> {
    try {
      console.log(`🔄 Moving lead ${lead.id} from ${lead.stage} to ${newStage}`);
      
      const updatedLead = { ...lead, stage: newStage };
      let stageRecordId: string | undefined;
      
      try {
        switch (newStage) {
          case 'lead':
            console.log('✅ Lead stage - no API call needed');
            break;
            
          case 'opportunity':
            stageRecordId = await this.handleOpportunityStage(updatedLead);
            updatedLead.opportunityId = stageRecordId;
            console.log('✅ Set opportunityId:', stageRecordId);
            break;
            
          case 'quotation_received':
            stageRecordId = await this.handleQuotationReceivedStage(updatedLead);
            updatedLead.quotationSupplierId = stageRecordId;
            console.log('✅ Set quotationSupplierId:', stageRecordId);
            break;
            
          case 'quotation_shared':
            stageRecordId = await this.handleQuotationSharedStage(updatedLead);
            updatedLead.quotationCustomerId = stageRecordId;
            console.log('✅ Set quotationCustomerId:', stageRecordId);
            break;
            
          case 'negotiation_started':
            stageRecordId = await this.handleNegotiationStage(updatedLead);
            updatedLead.negotiationId = stageRecordId;
            console.log('✅ Set negotiationId:', stageRecordId);
            break;
            
          case 'po_received':
            stageRecordId = await this.handlePOReceivedStage(updatedLead);
            updatedLead.poReceivedId = stageRecordId;
            console.log('✅ Set poReceivedId:', stageRecordId);
            break;
            
          case 'parts_delivered':
            console.log('✅ Parts delivered stage');
            break;
        }
        
        // ✅ Save to Redux store with persistence
        store.dispatch(
          updateLeadStage({
            leadId: lead.id,
            stageData: {
              stage: newStage,
              opportunityId: updatedLead.opportunityId,
              quotationSupplierId: updatedLead.quotationSupplierId,
              quotationCustomerId: updatedLead.quotationCustomerId,
              negotiationId: updatedLead.negotiationId,
              poReceivedId: updatedLead.poReceivedId,
              updatedAt: new Date().toISOString(),
            },
          })
        );
        
        console.log('💾 [Redux] Successfully saved stage data');
        
        return updatedLead;
        
      } catch (stageError: any) {
        console.error(`❌ Failed to create stage-specific record (${newStage}):`, stageError);
        throw stageError;
      }
      
    } catch (error) {
      console.error('❌ Error moving lead to stage:', error);
      throw error;
    }
  },

  /**
   * Load lead stage info from Redux store
   */
  loadLeadStageFromStore(leadId: string): Partial<Lead> | null {
    const state = store.getState();
    const selector = selectLeadStageData(leadId);
    const cached = selector(state);
    
    if (cached) {
      console.log('📦 [Redux] Loaded cached data for lead:', leadId, cached);
      return {
        stage: cached.stage,
        opportunityId: cached.opportunityId,
        quotationSupplierId: cached.quotationSupplierId,
        quotationCustomerId: cached.quotationCustomerId,
        negotiationId: cached.negotiationId,
        poReceivedId: cached.poReceivedId,
      };
    }
    
    return null;
  },

  /**
   * Enrich leads with Redux store data
   */
  enrichLeadsWithStageData(leads: Lead[]): Lead[] {
    const state = store.getState();
    const stageCache = state.kanban.stageCache;
    
    console.log('📦 [Redux] Enriching leads. Cache size:', Object.keys(stageCache).length);
    
    return leads.map(lead => {
      const cached = stageCache[lead.id];
      if (cached) {
        console.log(`✅ [Redux] Enriching lead ${lead.id} with:`, {
          stage: cached.stage,
          opportunityId: cached.opportunityId,
          quotationSupplierId: cached.quotationSupplierId,
          quotationCustomerId: cached.quotationCustomerId,
        });
        
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
      return { ...lead, stage: (lead.stage || 'lead') as LeadStage };
    });
  },

  /**
   * Generate a UUID for frontend-generated IDs
   */
  generateId(): string {
    return crypto.randomUUID();
  },

  /**
   * Stage 1: Opportunity
   * Uses lead.id as the opportunity ID
   */
  async handleOpportunityStage(lead: Lead): Promise<string> {
    if (!lead.partNumber || !lead.quantity) {
      throw new Error('Part Number and Quantity are required for Opportunity stage');
    }

    const opportunityId = lead.id;

    const requestBody = {
      id: opportunityId,
      partNumber: lead.partNumber,
      quantity: lead.quantity,
      regionCountry: lead.country || lead.region || '',
      stage: "current" as const
    };

    console.log('📤 Creating Opportunity with lead ID:', opportunityId);
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    try {
      await kanbanApiClient.createOpportunity(requestBody);
      console.log('✅ Opportunity created with ID:', opportunityId);
      return opportunityId;
    } catch (error: any) {
      console.error('❌ Opportunity API Error:', error);
      throw error;
    }
  },

  /**
   * Stage 2: Quotation Received from Supplier
   * Uses lead.id as the quotation supplier ID
   */
  async handleQuotationReceivedStage(lead: Lead): Promise<string> {
    const quotationSupplierId = lead.id;

    const requestBody = {
      id: quotationSupplierId,
      leadId: lead.id,
      notes: `Quotation received for ${lead.title}`,
      stage: 'current' as const
    };

    console.log('📤 Creating Quotation Supplier with lead ID:', quotationSupplierId);
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    try {
      await kanbanApiClient.createQuotationSupplier(requestBody);
      console.log('✅ Quotation Supplier created with ID:', quotationSupplierId);
      return quotationSupplierId;
    } catch (error: any) {
      console.error('❌ Quotation Supplier API Error:', error);
      throw error;
    }
  },

  /**
   * Stage 3: Quotation Shared with Customer
   * Uses lead.id as the quotation customer ID
   */
  async handleQuotationSharedStage(lead: Lead): Promise<string> {
    console.log('🔍 [handleQuotationSharedStage] Lead data:', {
      leadId: lead.id,
      quotationSupplierId: lead.quotationSupplierId,
    });
    
    if (!lead.quotationSupplierId) {
      throw new Error('Quotation from supplier is required before sharing with customer');
    }

    const quotationCustomerId = lead.id;

    const requestBody = {
      id: quotationCustomerId,
      quotationFromSupplierId: lead.quotationSupplierId,
      dealValue: lead.value || 0,
      grossMargin: lead.grossMargin || 0,
      dealProbability: lead.dealProbability || 0,
      expectedClosureDate: lead.expectedClosureDate || new Date().toISOString().split('T')[0],
      priceToWinOrder: lead.priceToWin || 0,
      stage: 'current' as const
    };

    console.log('📤 Creating Quotation Customer with lead ID:', quotationCustomerId);
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    try {
      await kanbanApiClient.createQuotationCustomer(requestBody);
      console.log('✅ Quotation Customer created with ID:', quotationCustomerId);
      return quotationCustomerId;
    } catch (error: any) {
      console.error('❌ Quotation Customer API Error:', error);
      throw error;
    }
  },

  /**
   * Stage 4: Negotiation Started
   * Uses lead.id as the negotiation ID
   */
  async handleNegotiationStage(lead: Lead): Promise<string> {
    if (!lead.quotationCustomerId) {
      throw new Error('Customer quotation is required before starting negotiation');
    }

    const negotiationId = lead.id;

    const requestBody = {
      id: negotiationId,
      quotationSharedWithCustomerId: lead.quotationCustomerId,
      poReceivedDocument: lead.poDocument || '',
      customerRequest: lead.customerRequest || '',
      dhlFedexAccountNumber: lead.dhlFedexAccount || '',
      invoiceUpload: lead.invoiceDocument || '',
      specialTermsConditions: lead.specialTerms || '',
      stage: 'current' as const
    };

    console.log('📤 Creating Negotiation with lead ID:', negotiationId);
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    try {
      await kanbanApiClient.createNegotiation(requestBody);
      console.log('✅ Negotiation created with ID:', negotiationId);
      return negotiationId;
    } catch (error: any) {
      console.error('❌ Negotiation API Error:', error);
      throw error;
    }
  },

  /**
   * Stage 5: PO Received
   * Uses lead.id as the PO received ID
   */
  async handlePOReceivedStage(lead: Lead): Promise<string> {
    if (!lead.negotiationId) {
      throw new Error('Negotiation is required before receiving PO');
    }

    const poReceivedId = lead.id;

    const requestBody = {
      id: poReceivedId,
      negotiationId: lead.negotiationId,
      invoice: lead.invoiceDocument || '',
      partPictures: lead.qcImages || [],
      orderStage: 'inspection' as const,
      testTypeRecommended: lead.testTypes?.join(', ') || '',
      leadTimeToLabDays: lead.leadTimeToLab || 0,
      testingTimeDays: lead.testingTime || 0,
      readyToShipDays: lead.readyToShip || 0,
      awbNumber: lead.awbNumber || '',
      stage: 'next' as const
    };

    console.log('📤 Creating PO Received with lead ID:', poReceivedId);
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    try {
      await kanbanApiClient.createPOReceived(requestBody);
      console.log('✅ PO Received created with ID:', poReceivedId);
      return poReceivedId;
    } catch (error: any) {
      console.error('❌ PO Received API Error:', error);
      throw error;
    }
  },

  /**
   * Validate if lead can move to target stage
   */
  validateStageTransition(lead: Lead, targetStage: LeadStage): { 
    isValid: boolean; 
    missingFields: string[]; 
    error?: string 
  } {
    const validations: Record<LeadStage, { fields: (keyof Lead)[]; dependencies?: string[] }> = {
      lead: {
        fields: ['title', 'contactPerson', 'organization'],
      },
      opportunity: {
        fields: ['partNumber', 'quantity', 'region'],
      },
      quotation_received: {
        fields: [],
        dependencies: ['opportunityId'],
      },
      quotation_shared: {
        fields: ['value', 'grossMargin', 'dealProbability', 'expectedClosureDate', 'priceToWin'],
        dependencies: ['quotationSupplierId'],
      },
      negotiation_started: {
        fields: ['poDocument', 'invoiceDocument'],
        dependencies: ['quotationCustomerId'],
      },
      po_received: {
        fields: ['awbNumber', 'leadTimeToLab', 'testingTime', 'readyToShip'],
        dependencies: ['negotiationId'],
      },
      parts_delivered: {
        fields: ['awbNumber'],
        dependencies: ['poReceivedId'],
      },
    };

    const validation = validations[targetStage];
    
    if (!validation) {
      return {
        isValid: false,
        missingFields: [],
        error: `Unknown stage: ${targetStage}`
      };
    }
    
    const missingFields: string[] = [];

    // Check required fields
    validation.fields.forEach(field => {
      const value = lead[field];
      if (!value || (typeof value === 'number' && value <= 0)) {
        missingFields.push(field);
      }
    });

    // Check dependencies
    if (validation.dependencies) {
      for (const dep of validation.dependencies) {
        const hasValue = !!lead[dep as keyof Lead];
        console.log(`🔍 [Validation] Checking dependency ${dep}:`, hasValue);
        
        if (!hasValue) {
          return {
            isValid: false,
            missingFields,
            error: `Previous stage record (${dep}) is required. Please complete the previous stage first.`,
          };
        }
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  },
};