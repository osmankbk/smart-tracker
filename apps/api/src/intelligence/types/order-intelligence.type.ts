import { OrderPriority, OrderStatus } from '@prisma/client';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

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
