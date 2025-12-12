import { opportunityApi } from '../api/opportunityApi';
import { negotiationApi } from '../api/negotiationApi';
import { quotationSupplierApi } from '../api/quotationSupplierApi';
import { quotationCustomerApi } from '../api/quotationCustomerApi';
import { poReceivedApi } from '../api/poReceivedApi';
import { partsDeliveredApi } from '../api/partsDeliveredApi';

type Stage = 'LEAD' | 'OPPORTUNITY' | 'QUOTATION_RECEIVED_FROM_SUPPLIER' | 
  'QUOTATION_SHARED_WITH_CUSTOMER' | 'NEGOTIATION_STARTED' | 'PO_RECEIVED' | 'PARTS_DELIVERED';

const STAGE_ORDER: Stage[] = [
  'LEAD',
  'OPPORTUNITY',
  'QUOTATION_RECEIVED_FROM_SUPPLIER',
  'QUOTATION_SHARED_WITH_CUSTOMER',
  'NEGOTIATION_STARTED',
  'PO_RECEIVED',
  'PARTS_DELIVERED'
];

const STAGE_REQUIRED_FIELDS: Record<Stage, string[]> = {
  LEAD: [],
  OPPORTUNITY: ['partNumber', 'quantity', 'regionCountry'],
  QUOTATION_RECEIVED_FROM_SUPPLIER: ['partNumber', 'supplierName', 'manufacturer', 'quantity', 'amount', 'testingType'],
  QUOTATION_SHARED_WITH_CUSTOMER: ['model', 'brand', 'des', 'coo', 'dc', 'qty', 'quote', 'warranty', 'leadTime', 'dealValue', 'totalValue', 'grossMargin'],
  NEGOTIATION_STARTED: [],
  PO_RECEIVED: ['poDocument', 'specialTermsAndConditions', 'dhlFedexAccountNumber'],
  PARTS_DELIVERED: ['model', 'qty', 'pricePerUnit', 'dc', 'leadTime']
};

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
  error?: string;
}

export const kanbanService = {
  validateStageTransition(currentStage: Stage, targetStage: Stage): ValidationResult {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    const targetIndex = STAGE_ORDER.indexOf(targetStage);

    // Check if skipping stages
    if (targetIndex > currentIndex + 1) {
      return {
        isValid: false,
        missingFields: [],
        error: 'Cannot skip stages. Please move to the next stage sequentially.'
      };
    }

    // Check if moving backwards
    if (targetIndex < currentIndex) {
      return {
        isValid: false,
        missingFields: [],
        error: 'Cannot move backwards to a previous stage.'
      };
    }

    // Get required fields for target stage
    const requiredFields = STAGE_REQUIRED_FIELDS[targetStage];

    return {
      isValid: requiredFields.length === 0,
      missingFields: requiredFields
    };
  },

  async moveLeadToStage(
    leadId: string,
    currentStage: Stage,
    targetStage: Stage,
    formData: any
  ): Promise<void> {
    // Validate transition
    const validation = this.validateStageTransition(currentStage, targetStage);
    
    if (!validation.isValid && validation.error) {
      throw new Error(validation.error);
    }

    try {
      // Call the appropriate API based on target stage
      switch (targetStage) {
        case 'OPPORTUNITY':
          await opportunityApi.create(leadId, {  // <-- ADD leadId HERE
            partNumber: formData.partNumber,
            quantity: formData.quantity,
            regionCountry: formData.regionCountry
          });
          break;

        case 'QUOTATION_RECEIVED_FROM_SUPPLIER':
          await quotationSupplierApi.create( leadId,{  // <-- ADD leadId HERE TOO
            partNumber: formData.partNumber,
            supplierName: formData.supplierName,
            manufacturer: formData.manufacturer,
            quantity: formData.quantity,
            amount: formData.amount,
            testingType: formData.testingType,
            estimatedDate: formData.estimatedDate,
            rohsCompliant: formData.rohsCompliant,
            notesText: formData.notesText,
            notesFile: formData.file
          });
          break;

        case 'QUOTATION_SHARED_WITH_CUSTOMER':
          await quotationCustomerApi.create(leadId,{  // <-- ADD leadId HERE TOO
            model: formData.model,
            brand: formData.brand,
            des: formData.des,
            coo: formData.coo,
            dc: formData.dc,
            qty: formData.qty,
            quote: formData.quote,
            warranty: formData.warranty,
            leadTime: formData.leadTime,
            dealValue: formData.dealValue,
            totalValue: formData.totalValue,
            grossMargin: formData.grossMargin,
            dealProbability: formData.dealProbability,
            expectedClosureDate: formData.expectedClosureDate,
            notesText: formData.notesText,
            notesFile: formData.file
          });
          break;

        case 'NEGOTIATION_STARTED':
          await negotiationApi.create(leadId,{  // <-- ADD leadId HERE TOO
            notesText: formData.notesText,
            notesFile: formData.file
          });
          break;

        case 'PO_RECEIVED':
          if (!formData.file) {
            throw new Error('PO document is required');
          }
          await poReceivedApi.create(leadId,{  // <-- ADD leadId HERE TOO
            poDocument: formData.file,
            specialTermsAndConditions: formData.specialTermsAndConditions,
            dhlFedexAccountNumber: formData.dhlFedexAccountNumber,
            notesText: formData.notesText,
            notesFile: formData.notesFile
          });
          break;

        case 'PARTS_DELIVERED':
          await partsDeliveredApi.create(leadId,{  // <-- ADD leadId HERE TOO
            model: formData.model,
            qty: formData.qty,
            pricePerUnit: formData.pricePerUnit,
            dc: formData.dc,
            leadTime: formData.leadTime,
            deliveredAt: formData.deliveredAt,
            notesText: formData.notesText,
            notesFile: formData.file
          });
          break;

        default:
          throw new Error(`Unknown target stage: ${targetStage}`);
      }
    } catch (error: any) {
      console.error('Failed to move lead to stage:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to move lead');
    }
  },

  getNextStage(currentStage: Stage): Stage | null {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === STAGE_ORDER.length - 1) {
      return null;
    }
    return STAGE_ORDER[currentIndex + 1];
  },

  canMoveToStage(currentStage: Stage, targetStage: Stage): boolean {
    const validation = this.validateStageTransition(currentStage, targetStage);
    return validation.isValid || validation.missingFields.length > 0;
  }
};