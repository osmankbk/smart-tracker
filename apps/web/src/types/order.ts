export type OrderStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';

export type OrderPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type OrderUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Order = {
  id: string;
  title: string;
  description?: string | null;
  status: OrderStatus;
  priority: OrderPriority;
  assigneeId?: string | null;
  createdById?: string | null;
  assignee?: OrderUser | null;
  createdBy?: OrderUser | null;
  createdAt: string;
  updatedAt: string;
  activityLogs: ActivityLog[];
  intelligence?: OrderIntelligence;
};

export type CreateOrderInput = {
  title: string;
  description?: string;
  priority: OrderPriority;
  assigneeId?: string;
};

export type UpdateOrderInput = {
  title?: string;
  description?: string;
  status?: OrderStatus;
  priority?: OrderPriority;
  assigneeId?: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  reason?: string | null;
  createdAt: string;
  actor?: {
    email: string;
  } | null;
};

export type OrderIntelligence = {
  riskLevel: RiskLevel;
  riskScore: number;
  timeInCurrentStatusMs: number;
  timeInCurrentStatusHours: number;
  isStuck: boolean;
  reasons: string[];
  recommendedActions: string[];
  signals: {
    status: OrderStatus;
    priority: OrderPriority;
    activityCount: number;
    lastActivityAt: string | null;
  };
};