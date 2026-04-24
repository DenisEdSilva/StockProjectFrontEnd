import { StoreUser } from '@/types/storeUser'
export interface AuditLog {
  id: number;
  action: string;
  actionLabel: string;
  description: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  isOwner: boolean;
  createdAt: string;
  userName: string;
  formattedDetails: string;
  user?: {
    name: string;
    email: string;
  };
  storeUser?: StoreUser[] | null;
}

export interface AuditLogsResponse {
  data: AuditLog[];
  actions: string[];
  users: Array<{ id: number; name: string; type: string }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}