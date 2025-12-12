export enum Stage {
  LEAD = 'LEAD',
  QUOTATION_RECEIVED_FROM_SUPPLIER = 'QUOTATION_RECEIVED_FROM_SUPPLIER',
  QUOTATION_SHARED_WITH_CUSTOMER = 'QUOTATION_SHARED_WITH_CUSTOMER',
  NEGOTIATION_STARTED = 'NEGOTIATION_STARTED',
  PO_RECEIVED = 'PO_RECEIVED',
  PARTS_DELIVERED = 'PARTS_DELIVERED',
  CLOSED_WON = 'CLOSED_WON',
  CLOSED_LOST = 'CLOSED_LOST'
}

export enum Labels {
  HOT = 'HOT',
  WARM = 'WARM',
  COLD = 'COLD'
}

// ==================== LEAD TYPES ====================
export interface Notes {
  text?: string;
  fileUrls?: string[];
}

export interface PersonDetails {
  id: string;
  name: string;
  targetSegment?: string;
  phone: string;
  email?: string;
  quotationLink?: string;
}

export interface Lead {
  id: string;
  contactPerson: string;
  organization: string;
  title: string;
  value?: number;
  currency: string;
  label: Labels;
  owner: string;
  sourceChannel: string;
  sourceChannelId: string;
  sourceOrigin: string;
  commentIds?: string[] | null;
  expectedCloseDate?: string;
  leadCreated?: string;
  updatedAt?: string | null;
  personDetails?: PersonDetails; // Made optional to handle old structure
  notes?: Notes;
  stage: Stage;
  
  // Fallback fields for backward compatibility (if API returns flat structure)
  phone?: string;
  name?: string;
  targetSegment?: string;
  email?: string;
  quotationLink?: string;
  notesText?: string;
  createdBy?: string;
  createdDate?: string;
}

export interface CreateLeadRequest {
  contactPerson: string;
  organization: string;
  title: string;
  value?: number;
  currency: string;
  label: Labels;
  owner: string;
  sourceChannel: string;
  sourceChannelId: string;
  sourceOrigin: string;
  expectedCloseDate?: string;
  phone: string;
  name: string;
  targetSegment?: string;
  email?: string;
  quotationLink?: string;
  notesText?: string;
  notesFile?: File;
  stage?: Stage;
}

export interface LeadsListParams {
  label?: Labels;
  owner?: string;
  page?: number;
  size?: number;
}

export interface PageableInfo {
  pageNumber: number;
  pageSize: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface LeadsListResponse {
  content: Lead[];
  pageable: PageableInfo;
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface ApiResponse {
  message: string;
}

// Helper function to safely access lead data
export const getLeadName = (lead: Lead): string => {
  console.log('getLeadName - Checking lead:', {
    hasPersonDetails: !!lead.personDetails,
    personDetailsName: lead.personDetails?.name,
    flatName: lead.name,
    contactPerson: lead.contactPerson
  });
  
  // Check in order: personDetails.name -> flat name -> contactPerson -> N/A
  const name = lead.personDetails?.name || lead.name || lead.contactPerson || 'N/A';
  console.log('getLeadName - Returning:', name);
  return name;
};

export const getLeadPhone = (lead: Lead): string => {
  return lead.personDetails?.phone || lead.phone || 'N/A';
};

export const getLeadEmail = (lead: Lead): string | undefined => {
  return lead.personDetails?.email || lead.email;
};

export const getLeadTargetSegment = (lead: Lead): string | undefined => {
  return lead.personDetails?.targetSegment || lead.targetSegment;
};

export const getLeadQuotationLink = (lead: Lead): string | undefined => {
  return lead.personDetails?.quotationLink || lead.quotationLink;
};

// ==================== OPPORTUNITY TYPES ====================
export interface Opportunity {
  id: string;
  leadId: string;
  partNumber: string;
  quantity: number;
  regionCountry: string;
}

export interface CreateOpportunityRequest {
  partNumber: string;
  quantity: number;
  regionCountry: string;
}

// ==================== NEGOTIATION TYPES ====================
export interface Negotiation {
  id: string;
  leadId: string;
  notes?: Notes;
}

export interface CreateNegotiationRequest {
  notesText?: string;
  notesFile?: File;
}

// ==================== QUOTATION SUPPLIER TYPES ====================
export interface QuotationSupplier {
  id: string;
  leadId: string;
  partNumber: string;
  supplierName: string;
  manufacturer: string;
  quantity: number;
  amount: number;
  estimatedDate?: string;
  rohsCompliant?: boolean;
  testingType: string;
  notes?: Notes;
}

export interface CreateQuotationSupplierRequest {
  partNumber: string;
  supplierName: string;
  manufacturer: string;
  quantity: number;
  amount: number;
  estimatedDate?: string;
  rohsCompliant?: boolean;
  testingType: string;
  notesText?: string;
  notesFile?: File;
}

// ==================== QUOTATION CUSTOMER TYPES ====================
export interface QuotationCustomer {
  id: string;
  leadId: string;
  model: string;
  brand: string;
  des: string;
  coo: string;
  dc: string;
  qty: number;
  quote: string;
  warranty: string;
  leadTime: string;
  dealProbability?: number;
  expectedClosureDate?: string;
  dealValue: number;
  totalValue: number;
  grossMargin: number;
  notes?: Notes;
}

export interface CreateQuotationCustomerRequest {
  model: string;
  brand: string;
  des: string;
  coo: string;
  dc: string;
  qty: number;
  quote: string;
  warranty: string;
  leadTime: string;
  dealProbability?: number;
  expectedClosureDate?: string;
  dealValue: number;
  totalValue: number;
  grossMargin: number;
  notesText?: string;
  notesFile?: File;
}

// ==================== PO RECEIVED TYPES ====================
export interface POReceived {
  id: string;
  leadId: string;
  poDocument: string; // URL to uploaded document
  specialTermsAndConditions: string;
  dhlFedexAccountNumber: string;
  notes?: Notes;
}

export interface CreatePOReceivedRequest {
  poDocument: File;
  specialTermsAndConditions: string;
  dhlFedexAccountNumber: string;
  notesText?: string;
  notesFile?: File;
}

// ==================== PARTS DELIVERED TYPES ====================
export interface PartsDelivered {
  id: string;
  leadId: string;
  model: string;
  qty: number;
  pricePerUnit: number;
  dc: string;
  leadTime: string;
  deliveredAt?: string;
  note?: Notes;
}

export interface CreatePartsDeliveredRequest {
  model: string;
  qty: number;
  pricePerUnit: number;
  dc: string;
  leadTime: string;
  deliveredAt?: string;
  notesText?: string;
  notesFile?: File;
}