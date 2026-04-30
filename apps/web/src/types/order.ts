import type { WorkflowStatus } from './workflow';

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
  workflowId?: string | null;
  statusId?: string | null;
  statusRef?: WorkflowStatus | null;
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
  statusId?: string;
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
  orderAgeMs: number;
  orderAgeHours: number;
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

export type DashboardOrderSignal = {
  id: string;
  title: string;
  status: OrderStatus;
  priority: OrderPriority;
  createdAt: string;
  updatedAt: string;
  intelligence: OrderIntelligence;
};

export type DashboardIntelligence = {
  generatedAt: string;
  summary: string;
  metrics: {
    totalOrders: number;
    openOrders: number;
    inProgressOrders: number;
    doneOrders: number;
    canceledOrders: number;
    stuckOrders: number;
    highRiskOrders: number;
    criticalRiskOrders: number;
  };
  focusOrders: DashboardOrderSignal[];
  recommendedActions: string[];
};