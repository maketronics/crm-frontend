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
  expectedCloseDate?: string;
  phone: string;
  name: string;
  targetSegment?: string;
  email?: string;
  quotationLink?: string;
  notesText?: string;
  notesFile?: File;
  stage?: Stage;
  createdAt?: string;
  updatedAt?: string;
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

export interface LeadsListResponse {
  content: Lead[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Opportunity {
  id: string;
  partNumber: string;
  quantity: number;
  regionCountry: string;
  leadId: string;
}

export interface Negotiation {
  id: string;
  leadId: string;
  notesText?: string;
  notesFile?: File;
  stage?: Stage;
}

export interface QuotationSupplier {
  id: string;
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
  stage?: Stage;
}

export interface QuotationCustomer {
  id: string;
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
  stage?: Stage;
}

export interface POReceived {
  id: string;
  poDocument: File;
  specialTermsAndConditions: string;
  dhlFedexAccountNumber: string;
  notesText?: string;
  notesFile?: File;
  stage?: Stage;
}

export interface PartsDelivered {
  id: string;
  model: string;
  qty: number;
  pricePerUnit: number;
  dc: string;
  leadTime: string;
  deliveredAt?: string;
  notesText?: string;
  notesFile?: File;
  stage?: Stage;
}