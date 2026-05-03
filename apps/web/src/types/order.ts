import { UserRole } from './invite';
import type { WorkflowStatus } from './workflow';

export type OrderStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';

export type OrderPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Recommendation = {
  type: 'ASSIGN' | 'ESCALATE' | 'REVIEW' | 'REBALANCE' | 'INVESTIGATE';
  message: string;
  priority: number;
  confidence?: number;
};

export type OrderUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole
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
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;

  orderAgeMs: number;
  orderAgeHours: number;

  timeInCurrentStatusMs: number;
  timeInCurrentStatusHours: number;

  isStuck: boolean;

  reasons: string[];
  recommendations: Recommendation[];

  signals: {
    status: string;
    statusLabel: string;
    statusCategory: string;
    priority: string;
    activityCount: number;
    statusChangeCount: number;
    regressionCount: number;
    churnCount: number;
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
    unassignedOrders: number;
    highRiskUnassignedOrders: number;
  };
  assignmentSuggestions: AssignmentSuggestion[];
  workload: {
    assigneeId: string;
    assigneeName: string;
    assigneeEmail: string;
    count: number;
  }[];

  workloadStats: {
    avg: number;
    max: number;
    min: number;
    isImbalanced: boolean;
  };
  focusOrders: DashboardOrderSignal[];
  recommendations: Recommendation[];
};

export type OrderAssignee = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AssignOrderInput = {
  assigneeId?: string | null;
  reason?: string;
};

export type AssignmentSuggestion = {
  orderId: string;
  orderTitle: string;
  suggestedAssigneeId: string;
  suggestedAssigneeName: string;
  suggestedAssigneeEmail: string;
  reason: string;
};