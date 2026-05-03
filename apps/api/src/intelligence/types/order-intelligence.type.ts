import { OrderPriority, OrderStatus } from '@prisma/client';
import { Recommendation } from './recommendation.type';

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
  recommendations: Recommendation[];
  signals: {
    status: OrderStatus;
    statusLabel: string;
    statusCategory: string;
    priority: OrderPriority;
    activityCount: number;
    statusChangeCount: number;
    regressionCount: number;
    churnCount: number;
    lastActivityAt: string | null;
  };
};
