import { OrderIntelligence } from './order-intelligence.type';

export type DashboardOrderSignal = {
  id: string;
  title: string;
  status: string;
  priority: string;
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
  focusOrders: DashboardOrderSignal[];
  recommendedActions: string[];

  workload: {
    assigneeId: string;
    count: number;
  }[];

  workloadStats: {
    avg: number;
    max: number;
    min: number;
    isImbalanced: boolean;
  };
};
