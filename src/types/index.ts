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
}

export interface LeadFilters {
  status?: Lead['status'];
  assignedTo?: string;
  sourceChannel?: string;
  startDate?: string;
  endDate?: string;
  labels?: string[];
  search?: string;
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