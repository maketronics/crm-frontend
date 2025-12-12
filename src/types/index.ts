export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  mobileNumber: string;
  title: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  mobileNumber: string;
  title: string;
  roles: string[];
  permissions: string[];
}

// Kanban Stage Type
export type LeadStage = 
  | 'lead' // ADD THIS - first stage
  | 'opportunity' 
  | 'quotation_received' 
  | 'quotation_shared' 
  | 'negotiation_started' 
  | 'po_received' 
  | 'parts_delivered';

// API Models for each stage
export interface Opportunity {
  id?: string;
  partNumber: string;
  quantity: number;
  regionCountry: string;
  stage: 'current' | 'next';
  leadId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationSupplier {
  id?: string;
  leadId: string;
  notes: string;
  stage: 'current' | 'next';
  createdAt?: string;
  updatedAt?: string;
}

export interface QuotationCustomer {
  id?: string;
  quotationFromSupplierId: string;
  dealValue: number;
  grossMargin: number;
  dealProbability: number;
  expectedClosureDate: string;
  priceToWinOrder: number;
  stage: 'current' | 'next';
  createdAt?: string;
  updatedAt?: string;
}

export interface Negotiation {
  id?: string;
  quotationSharedWithCustomerId: string;
  poReceivedDocument?: string;
  customerRequest?: string;
  dhlFedexAccountNumber?: string;
  invoiceUpload?: string;
  specialTermsConditions?: string;
  stage: 'current' | 'next';
  createdAt?: string;
  updatedAt?: string;
}

export interface POReceived {
  id?: string;
  negotiationId: string;
  invoice?: string;
  partPictures?: string[];
  orderStage?: 'inspection' | 'testing' | 'ready' | 'shipped';
  testTypeRecommended?: string;
  leadTimeToLabDays?: number;
  testingTimeDays?: number;
  readyToShipDays?: number;
  awbNumber?: string;
  stage: 'current' | 'next';
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  contactPerson: string;
  organization: string;
  title: string;
  value: number;
  currencyType: string;
  labels: string[];
  sourceChannel: string;
  createdBy: string;
  createdDate: string;
  assignedTo?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'CLOSED';
  commentIds?: string[];
  fileUrl?: string;
  
  // Kanban-specific fields
  stage?: LeadStage;
  
  
  // References to stage-specific records
  opportunityId?: string;
  quotationSupplierId?: string;
  quotationCustomerId?: string;
  negotiationId?: string;
  poReceivedId?: string;
  
  // Flattened data for display (populated from related records)
  partNumber?: string;
  quantity?: number;
  region?: string;
  email?: string;
  phone?: string;
  country?: string;
  targetSegment?: string;
  targetPrice?: number;
  expectedClosureDate?: string;
  dealProbability?: number;
  grossMargin?: number;
  grossMarginPercentage?: number;
  priceToWin?: number;
  poDocument?: string;
  invoiceDocument?: string;
  specialTerms?: string;
  customerRequest?: string;
  dhlFedexAccount?: string;
  orderStatus?: string;
  awbNumber?: string;
  testTypes?: string[];
  leadTimeToLab?: number;
  testingTime?: number;
  readyToShip?: number;
  qcImages?: string[];
}

export interface CreateLeadRequest {
  contactPerson: string;
  organization: string;
  title: string;
  value: number;
  currencyType: string;
  labels: string[];
  sourceChannel: string;
  assignedTo?: string;
  status?: Lead['status'];
  createdBy: string;
  fileUrl?: string;
  stage?: LeadStage;
  partNumber?: string;
  quantity?: number;
  region?: string;
  email?: string;
  phone?: string;
  country?: string;
  targetSegment?: string;
  targetPrice?: number;
}

export interface LeadFilters {
  status?: Lead['status'];
  assignedTo?: string;
  sourceChannel?: string;
  startDate?: string;
  endDate?: string;
  labels?: string[];
  search?: string;
  stage?: LeadStage;
  region?: string;
  targetSegment?: string;
}

export interface LeadComment {
  id: string;
  leadId: string;
  personId: string;
  message: string;
  createdAt: string;
  createdBy: string;
}

export interface CreateCommentRequest {
  personId: string;
  message: string;
}

export interface AssignLeadRequest {
  assignedTo: string;
  createdBy: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

