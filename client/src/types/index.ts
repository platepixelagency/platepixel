export type Role = 'ADMIN' | 'TEAM_MEMBER' | 'CLIENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  client?: Client | null;
}

export interface Client {
  id: string;
  userId: string;
  companyName: string;
  phone: string;
  address: string;
  renewalDate: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  businessName: string;
  mobile: string;
  email: string;
  category: string;
  service: string;
  budget: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'PROPOSAL_SENT' | 'WON' | 'LOST';
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  projectName: string;
  status: 'PLANNING' | 'DEVELOPMENT' | 'TESTING' | 'DELIVERED';
  deliveryDate: string;
  description: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  createdAt: string;
}

export interface Ticket {
  id: string;
  clientId: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
