import { opportunityApi } from '../api/opportunityApi';
import { negotiationApi } from '../api/negotiationApi';
import { quotationSupplierApi } from '../api/quotationSupplierApi';
import { quotationCustomerApi } from '../api/quotationCustomerApi';
import { poReceivedApi } from '../api/poReceivedApi';
import { partsDeliveredApi } from '../api/partsDeliveredApi';
import type { LeadStage } from '../types/index';

// Import Stage from your types
// export type Stage = 
//   | 'LEAD'
//   | 'OPPORTUNITY'
//   | 'QUOTATION_RECEIVED_FROM_SUPPLIER'
//   | 'QUOTATION_SHARED_WITH_CUSTOMER'
//   | 'NEGOTIATION_STARTED'
//   | 'PO_RECEIVED'
//   | 'PARTS_DELIVERED';

// Stage order for sequential validation
const STAGE_ORDER: Stage[] = [
  'LEAD',
  'OPPORTUNITY',
  'QUOTATION_RECEIVED_FROM_SUPPLIER',
  'QUOTATION_SHARED_WITH_CUSTOMER',
  'NEGOTIATION_STARTED',
  'PO_RECEIVED',
  'PARTS_DELIVERED'
];

export interface StageValidation {
  isValid: boolean;
  missingFields: string[];
  error?: string;
}

export const kanbanService = {
  /**
   * Validate if lead can move to target stage (only to next stage)
   */
  validateStageTransition(currentStage: Stage, targetStage: Stage): StageValidation {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    const targetIndex = STAGE_ORDER.indexOf(targetStage);

    // Can only move forward to the next stage
    if (targetIndex !== currentIndex + 1) {
      return {
        isValid: false,
        missingFields: [],
        error: `Can only move to the next stage. You cannot skip stages.`
      };
    }

    // Get required fields for target stage
    const missingFields = this.getRequiredFieldsForStage(targetStage);

    return {
      isValid: missingFields.length === 0,
      missingFields,
      error: undefined
    };
  },

  /**
   * Get required fields for a stage
   */
  getRequiredFieldsForStage(stage: Stage): string[] {
    const requirements: Record<Stage, string[]> = {
      'LEAD': [],
      'OPPORTUNITY': ['partNumber', 'quantity', 'regionCountry'],
      'QUOTATION_RECEIVED_FROM_SUPPLIER': [
        'partNumber', 'supplierName', 'manufacturer', 'quantity', 
        'amount', 'testingType'
      ],
      'QUOTATION_SHARED_WITH_CUSTOMER': [
        'model', 'brand', 'des', 'coo', 'dc', 'qty', 'quote', 
        'warranty', 'leadTime', 'dealValue', 'totalValue', 'grossMargin'
      ],
      'NEGOTIATION_STARTED': [],
      'PO_RECEIVED': ['poDocument', 'specialTermsAndConditions', 'dhlFedexAccountNumber'],
      'PARTS_DELIVERED': ['model', 'qty', 'pricePerUnit', 'dc', 'leadTime']
    };

    return requirements[stage] || [];
  },

  /**
   * Move lead to next stage by creating the required stage-specific record
   */
  async moveLeadToStage(leadId: string, currentStage: Stage, targetStage: Stage, formData: any): Promise<{ id: string; message: string }> {
    console.log('🚀 Moving lead to stage:', { leadId, currentStage, targetStage, formData });

    // Validate stage transition
    const validation = this.validateStageTransition(currentStage, targetStage);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid stage transition');
    }

    // Create stage-specific record based on target stage
    let response;
    
    try {
      switch (targetStage) {
        case 'OPPORTUNITY':
          response = await opportunityApi.create({
            partNumber: formData.partNumber,
            quantity: parseFloat(formData.quantity),
            regionCountry: formData.regionCountry
          });
          break;

        case 'QUOTATION_RECEIVED_FROM_SUPPLIER':
          response = await quotationSupplierApi.create({
            partNumber: formData.partNumber,
            supplierName: formData.supplierName,
            manufacturer: formData.manufacturer,
            quantity: parseInt(formData.quantity),
            amount: parseFloat(formData.amount),
            estimatedDate: formData.estimatedDate,
            rohsCompliant: formData.rohsCompliant,
            testingType: formData.testingType,
            notesText: formData.notesText,
            notesFile: formData.notesFile,
            stage: targetStage
          });
          break;

        case 'QUOTATION_SHARED_WITH_CUSTOMER':
          response = await quotationCustomerApi.create({
            model: formData.model,
            brand: formData.brand,
            des: formData.des,
            coo: formData.coo,
            dc: formData.dc,
            qty: parseInt(formData.qty),
            quote: formData.quote,
            warranty: formData.warranty,
            leadTime: formData.leadTime,
            dealProbability: formData.dealProbability ? parseFloat(formData.dealProbability) : undefined,
            expectedClosureDate: formData.expectedClosureDate,
            dealValue: parseFloat(formData.dealValue),
            totalValue: parseFloat(formData.totalValue),
            grossMargin: parseFloat(formData.grossMargin),
            notesText: formData.notesText,
            notesFile: formData.notesFile,
            stage: targetStage
          });
          break;

        case 'NEGOTIATION_STARTED':
          response = await negotiationApi.create({
            notesText: formData.notesText,
            notesFile: formData.notesFile,
            stage: targetStage
          });
          break;

        case 'PO_RECEIVED':
          response = await poReceivedApi.create({
            poDocument: formData.poDocument,
            specialTermsAndConditions: formData.specialTermsAndConditions,
            dhlFedexAccountNumber: formData.dhlFedexAccountNumber,
            notesText: formData.notesText,
            notesFile: formData.notesFile,
            stage: targetStage
          });
          break;

        case 'PARTS_DELIVERED':
          response = await partsDeliveredApi.create({
            model: formData.model,
            qty: parseInt(formData.qty),
            pricePerUnit: parseFloat(formData.pricePerUnit),
            dc: formData.dc,
            leadTime: formData.leadTime,
            deliveredAt: formData.deliveredAt,
            notesText: formData.notesText,
            notesFile: formData.notesFile,
            stage: targetStage
          });
          break;

        default:
          throw new Error(`Unknown stage: ${targetStage}`);
      }

      console.log('✅ Stage transition successful:', response);
      return { id: leadId, message: response.message || 'Stage transition successful' };
    } catch (error: any) {
      console.error('❌ Failed to create stage record:', error);
      throw new Error(error.message || 'Failed to move lead to next stage');
    }
  },

  /**
   * Get the next stage in sequence
   */
  getNextStage(currentStage: Stage): Stage | null {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === STAGE_ORDER.length - 1) {
      return null;
    }
    return STAGE_ORDER[currentIndex + 1];
  },

  /**
   * Check if stage transition is allowed
   */
  canMoveToStage(currentStage: Stage, targetStage: Stage): boolean {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    const targetIndex = STAGE_ORDER.indexOf(targetStage);
    return targetIndex === currentIndex + 1;
  }
};