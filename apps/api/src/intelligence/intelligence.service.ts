import { Injectable } from '@nestjs/common';
import { OrderPriority, OrderStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { DashboardIntelligence } from './types/dashboard-intelligence.type';
import { OrderIntelligence, RiskLevel } from './types/order-intelligence.type';

type ActivityLogLike = {
  action: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus | null;
  createdAt: Date;
};

type OrderLike = {
  status: OrderStatus;
  priority: OrderPriority;
  createdAt: Date;
  updatedAt: Date;
  activityLogs: ActivityLogLike[];
  statusRef?: {
    category: string;
  } | null;
};

const HOURS = 1000 * 60 * 60;

@Injectable()
export class IntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getDashboardBrief(_userId: string): Promise<DashboardIntelligence> {
    const orders = await this.prisma.order.findMany({
      include: {
        activityLogs: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const analyzedOrders = orders.map((order) => ({
      id: order.id,
      title: order.title,
      status: order.status,
      priority: order.priority,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      intelligence: this.analyzeOrder(order),
    }));

    const stuckOrders = analyzedOrders.filter(
      (order) => order.intelligence.isStuck,
    );

    const highRiskOrders = analyzedOrders.filter((order) =>
      ['HIGH', 'CRITICAL'].includes(order.intelligence.riskLevel),
    );

    const criticalRiskOrders = analyzedOrders.filter(
      (order) => order.intelligence.riskLevel === 'CRITICAL',
    );

    const focusOrders = analyzedOrders
      .filter(
        (order) =>
          order.intelligence.isStuck ||
          ['HIGH', 'CRITICAL'].includes(order.intelligence.riskLevel),
      )
      .sort((a, b) => b.intelligence.riskScore - a.intelligence.riskScore)
      .slice(0, 5);

    return {
      generatedAt: new Date().toISOString(),
      summary: this.buildBriefSummary({
        totalOrders: analyzedOrders.length,
        stuckOrders: stuckOrders.length,
        highRiskOrders: highRiskOrders.length,
        criticalRiskOrders: criticalRiskOrders.length,
      }),
      metrics: {
        totalOrders: analyzedOrders.length,
        openOrders: analyzedOrders.filter((order) => order.status === 'OPEN')
          .length,
        inProgressOrders: analyzedOrders.filter(
          (order) => order.status === 'IN_PROGRESS',
        ).length,
        doneOrders: analyzedOrders.filter((order) => order.status === 'DONE')
          .length,
        canceledOrders: analyzedOrders.filter(
          (order) => order.status === 'CANCELED',
        ).length,
        stuckOrders: stuckOrders.length,
        highRiskOrders: highRiskOrders.length,
        criticalRiskOrders: criticalRiskOrders.length,
      },
      focusOrders,
      recommendedActions: this.buildDashboardRecommendations({
        stuckOrders: stuckOrders.length,
        highRiskOrders: highRiskOrders.length,
        criticalRiskOrders: criticalRiskOrders.length,
      }),
    };
  }

  private buildBriefSummary(input: {
    totalOrders: number;
    stuckOrders: number;
    highRiskOrders: number;
    criticalRiskOrders: number;
  }) {
    if (input.totalOrders === 0) {
      return 'No active operational work is currently being tracked.';
    }

    if (input.criticalRiskOrders > 0) {
      return `${input.criticalRiskOrders} critical-risk order(s) need immediate attention.`;
    }

    if (input.highRiskOrders > 0) {
      return `${input.highRiskOrders} high-risk order(s) should be reviewed today.`;
    }

    if (input.stuckOrders > 0) {
      return `${input.stuckOrders} stuck order(s) may need follow-up.`;
    }

    return 'No major operational risks detected right now.';
  }

  private buildDashboardRecommendations(input: {
    stuckOrders: number;
    highRiskOrders: number;
    criticalRiskOrders: number;
  }) {
    const actions: string[] = [];

    if (input.criticalRiskOrders > 0) {
      actions.push('Review critical-risk orders before handling routine work.');
    }

    if (input.highRiskOrders > 0) {
      actions.push(
        'Check high-risk orders for blockers, ownership, or escalation needs.',
      );
    }

    if (input.stuckOrders > 0) {
      actions.push('Review stuck orders and confirm the next required action.');
    }

    if (actions.length === 0) {
      actions.push(
        'Continue monitoring normal workflow and keep statuses updated.',
      );
    }

    return actions;
  }

  analyzeOrder(order: OrderLike): OrderIntelligence {
    const category = order.statusRef?.category ?? order.status;

    const sortedLogs = [...order.activityLogs].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    const currentStatusStartedAt = this.getCurrentStatusStartedAt(
      order,
      sortedLogs,
    );

    const now = new Date();

    const timeInCurrentStatusMs =
      now.getTime() - currentStatusStartedAt.getTime();

    const timeInCurrentStatusHours = Math.round(timeInCurrentStatusMs / HOURS);

    const reasons: string[] = [];
    const recommendedActions: string[] = [];
    const orderAgeMs = now.getTime() - order.createdAt.getTime();
    const orderAgeHours = Math.round(orderAgeMs / HOURS);

    let riskScore = 0;

    const isStuck = this.isOrderStuck(
      order.status,
      order.priority,
      timeInCurrentStatusHours,
    );

    if (isStuck) {
      riskScore += 40;
      reasons.push(
        `Order has been ${order.status} for ${timeInCurrentStatusHours} hours.`,
      );
      recommendedActions.push(
        'Review the order for blockers and confirm the next owner.',
      );
    }

    if (order.priority === OrderPriority.HIGH) {
      riskScore += 25;
      reasons.push('Order is marked HIGH priority.');
      recommendedActions.push('Escalate visibility to a manager or lead.');
    }

    if (order.status === OrderStatus.OPEN && timeInCurrentStatusHours >= 24) {
      riskScore += 20;
      reasons.push('Order has remained OPEN for at least 24 hours.');
      recommendedActions.push('Assign the order or move it into progress.');
    }

    if (
      order.status === OrderStatus.IN_PROGRESS &&
      timeInCurrentStatusHours >= 48
    ) {
      riskScore += 30;
      reasons.push('Order has been IN_PROGRESS for at least 48 hours.');
      recommendedActions.push('Check if the work is blocked or needs help.');
    }

    if (order.activityLogs.length === 0 && timeInCurrentStatusHours >= 24) {
      riskScore += 15;
      reasons.push('Order has no recorded activity after creation.');
      recommendedActions.push('Add an update or confirm whether work started.');
    }

    if (category === 'DONE' || category === 'CANCELED') {
      riskScore = Math.min(riskScore, 10);
    }

    if (order.status === OrderStatus.DONE) {
      riskScore = Math.min(riskScore, 10);
      reasons.push('Order is completed and locked.');
      recommendedActions.push(
        'No action needed unless an admin override is required.',
      );
    }

    if (order.status === OrderStatus.CANCELED) {
      riskScore = Math.min(riskScore, 10);
      reasons.push('Order is canceled and locked.');
      recommendedActions.push(
        'No action needed unless an admin override is required.',
      );
    }

    riskScore = Math.min(riskScore, 100);

    if (reasons.length === 0) {
      reasons.push('No major lifecycle risks detected.');
    }

    if (recommendedActions.length === 0) {
      recommendedActions.push('Continue monitoring normally.');
    }

    return {
      riskLevel: this.getRiskLevel(riskScore),
      riskScore,
      orderAgeMs,
      orderAgeHours,
      timeInCurrentStatusMs,
      timeInCurrentStatusHours,
      isStuck,
      reasons,
      recommendedActions,
      signals: {
        status: order.status,
        priority: order.priority,
        activityCount: order.activityLogs.length,
        lastActivityAt:
          sortedLogs.length > 0
            ? sortedLogs[sortedLogs.length - 1].createdAt.toISOString()
            : null,
      },
    };
  }

  private getCurrentStatusStartedAt(
    order: OrderLike,
    sortedLogs: ActivityLogLike[],
  ) {
    const latestStatusChange = [...sortedLogs]
      .reverse()
      .find((log) => log.toStatus === order.status);

    return latestStatusChange?.createdAt ?? order.createdAt;
  }

  private isOrderStuck(
    status: OrderStatus,
    priority: OrderPriority,
    hours: number,
  ) {
    if (status === OrderStatus.DONE || status === OrderStatus.CANCELED) {
      return false;
    }

    if (priority === OrderPriority.HIGH && hours >= 12) {
      return true;
    }

    if (status === OrderStatus.OPEN && hours >= 24) {
      return true;
    }

    if (status === OrderStatus.IN_PROGRESS && hours >= 48) {
      return true;
    }

    return false;
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }
}
