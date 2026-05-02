import { Injectable } from '@nestjs/common';
import { OrderPriority, OrderStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { DashboardIntelligence } from './types/dashboard-intelligence.type';
import { OrderIntelligence, RiskLevel } from './types/order-intelligence.type';

const STATUS_CHANGE_ACTIONS = ['STATUS_CHANGED', 'STATUS_REGRESSION'];
const REGRESSION_ACTION = 'STATUS_REGRESSION';

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
  assigneeId?: string | null;
  statusRef?: {
    id: string;
    name: string;
    key: string;
    order: number;
    category: string;
    isStart: boolean;
    isTerminal: boolean;
  } | null;
};

const HOURS = 1000 * 60 * 60;

@Injectable()
export class IntelligenceService {
  constructor(private readonly prisma: PrismaService) {}

  private getStatusCategory(order: OrderLike) {
    return order.statusRef?.category ?? this.getFallbackCategory(order.status);
  }

  private getStatusLabel(order: OrderLike) {
    return order.statusRef?.name ?? order.status.replace('_', ' ');
  }

  private getFallbackCategory(status: OrderStatus) {
    if (status === OrderStatus.OPEN) return 'TODO';
    if (status === OrderStatus.IN_PROGRESS) return 'ACTIVE';
    if (status === OrderStatus.DONE) return 'DONE';
    if (status === OrderStatus.CANCELED) return 'CANCELED';

    return 'ACTIVE';
  }

  private isTerminalCategory(category: string) {
    return category === 'DONE' || category === 'CANCELED';
  }

  async getDashboardBrief(
    organizationId: string | null,
  ): Promise<DashboardIntelligence> {
    const orders = await this.prisma.order.findMany({
      where: {
        organizationId,
      },
      include: {
        statusRef: true,
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
      assigneeId: order.assigneeId,
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

    const unassignedOrders = analyzedOrders.filter(
      (order) => !order.assigneeId,
    );

    const highRiskUnassignedOrders = analyzedOrders.filter(
      (order) =>
        !order.assigneeId &&
        ['HIGH', 'CRITICAL'].includes(order.intelligence.riskLevel),
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
        highRiskUnassignedOrders: highRiskUnassignedOrders.length,
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
        unassignedOrders: unassignedOrders.length,
        highRiskUnassignedOrders: highRiskUnassignedOrders.length,
      },
      focusOrders,
      recommendedActions: this.buildDashboardRecommendations({
        stuckOrders: stuckOrders.length,
        highRiskOrders: highRiskOrders.length,
        criticalRiskOrders: criticalRiskOrders.length,
        highRiskUnassignedOrders: highRiskUnassignedOrders.length,
      }),
    };
  }

  private buildBriefSummary(input: {
    totalOrders: number;
    stuckOrders: number;
    highRiskOrders: number;
    criticalRiskOrders: number;
    highRiskUnassignedOrders: number;
  }) {
    if (input.totalOrders === 0) {
      return 'No active operational work is currently being tracked.';
    }

    if (input.highRiskUnassignedOrders > 0) {
      return `${input.highRiskUnassignedOrders} high-risk unassigned order(s) need ownership assigned.`;
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
    highRiskUnassignedOrders: number;
  }) {
    const actions: string[] = [];

    if (input.highRiskUnassignedOrders > 0) {
      actions.push(
        'Assign owners to high-risk unassigned orders before reviewing lower-risk work.',
      );
    }

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
    const sortedLogs = [...order.activityLogs].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

    const statusChangeCount = sortedLogs.filter((log) =>
      STATUS_CHANGE_ACTIONS.includes(log.action),
    ).length;

    const regressionCount = sortedLogs.filter(
      (log) => log.action === REGRESSION_ACTION,
    ).length;

    const churnCount = Math.max(statusChangeCount - 1, 0);

    const currentStatusStartedAt = this.getCurrentStatusStartedAt(
      order,
      sortedLogs,
    );

    const statusCategory = this.getStatusCategory(order);
    const statusLabel = this.getStatusLabel(order);

    const now = new Date();

    const orderAgeMs = now.getTime() - order.createdAt.getTime();
    const orderAgeHours = Math.round(orderAgeMs / HOURS);

    const timeInCurrentStatusMs =
      now.getTime() - currentStatusStartedAt.getTime();

    const timeInCurrentStatusHours = Math.round(timeInCurrentStatusMs / HOURS);

    const reasons: string[] = [];
    const recommendedActions: string[] = [];

    let riskScore = 0;

    const isUnassigned = !order.assigneeId;

    if (isUnassigned) {
      riskScore += 10;

      reasons.push('Order is currently unassigned.');

      recommendedActions.push('Assign this order to a team member.');
    }

    const isStuck = this.isOrderStuck(
      statusCategory,
      order.priority,
      timeInCurrentStatusHours,
    );

    if (isStuck) {
      riskScore += 40;
      reasons.push(
        `Order has been in ${statusLabel} for ${timeInCurrentStatusHours} hours.`,
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

    if (isUnassigned && isStuck) {
      riskScore += 15;

      reasons.push('Stuck order has no assigned owner.');

      recommendedActions.push(
        'Immediately assign an owner to unblock progress.',
      );
    }

    if (statusCategory === 'TODO' && timeInCurrentStatusHours >= 24) {
      riskScore += 20;
      reasons.push(
        `Order has remained in ${statusLabel} for at least 24 hours.`,
      );
      recommendedActions.push('Assign the order or move it into active work.');
    }

    if (statusCategory === 'ACTIVE' && timeInCurrentStatusHours >= 48) {
      riskScore += 30;
      reasons.push(`Order has been in ${statusLabel} for at least 48 hours.`);
      recommendedActions.push('Check if the work is blocked or needs help.');
    }

    if (statusCategory === 'REVIEW' && timeInCurrentStatusHours >= 36) {
      riskScore += 25;
      reasons.push(
        `Order has been waiting in ${statusLabel} for at least 36 hours.`,
      );
      recommendedActions.push(
        'Confirm who owns the review and whether a decision is needed.',
      );
    }

    if (statusCategory === 'QA' && timeInCurrentStatusHours >= 36) {
      riskScore += 25;
      reasons.push(`Order has been in ${statusLabel} for at least 36 hours.`);
      recommendedActions.push(
        'Check QA blockers and confirm expected completion timing.',
      );
    }

    if (order.activityLogs.length === 0 && timeInCurrentStatusHours >= 24) {
      riskScore += 15;
      reasons.push('Order has no recorded activity after creation.');
      recommendedActions.push('Add an update or confirm whether work started.');
    }

    if (regressionCount > 0) {
      const regressionRisk = Math.min(regressionCount * 15, 45);

      riskScore += regressionRisk;

      reasons.push(
        `Order has regressed ${regressionCount} time(s), indicating possible rework or unclear requirements.`,
      );

      recommendedActions.push(
        'Review why the order moved backward and clarify the next required step.',
      );
    }

    if (churnCount >= 3) {
      riskScore += 20;

      reasons.push(
        `Order has high workflow churn with ${statusChangeCount} status movement(s).`,
      );

      recommendedActions.push(
        'Confirm ownership and reduce unnecessary status cycling.',
      );
    } else if (churnCount >= 1) {
      riskScore += 10;

      reasons.push(
        `Order has changed status ${statusChangeCount} time(s), suggesting some workflow instability.`,
      );

      recommendedActions.push(
        'Check whether the workflow path is clear for this order.',
      );
    }

    if (statusCategory === 'DONE') {
      riskScore = Math.min(riskScore, 10);
      reasons.push(`Order is in terminal status ${statusLabel}.`);
      recommendedActions.push(
        'No action needed unless an admin override is required.',
      );
    }

    if (statusCategory === 'CANCELED') {
      riskScore = Math.min(riskScore, 10);
      reasons.push(`Order is canceled in status ${statusLabel}.`);
      recommendedActions.push(
        'No action needed unless an admin override is required.',
      );
    }

    if (
      isUnassigned &&
      (this.getRiskLevel(riskScore) === 'HIGH' ||
        this.getRiskLevel(riskScore) === 'CRITICAL')
    ) {
      reasons.push('High-risk order is not owned by anyone.');

      recommendedActions.push(
        'Assign ownership immediately to reduce operational risk.',
      );
    }

    riskScore = Math.min(riskScore, 100);

    if (reasons.length === 0) {
      reasons.push('No major lifecycle risks detected.');
    }

    if (recommendedActions.length === 0) {
      recommendedActions.push('Continue monitoring normally.');
    }
    const uniqueRecommendedActions = Array.from(new Set(recommendedActions));

    return {
      riskLevel: this.getRiskLevel(riskScore),
      riskScore,
      orderAgeMs,
      orderAgeHours,
      timeInCurrentStatusMs,
      timeInCurrentStatusHours,
      isStuck,
      reasons,
      recommendedActions: uniqueRecommendedActions,
      signals: {
        status: order.status,
        statusLabel,
        statusCategory,
        priority: order.priority,
        activityCount: order.activityLogs.length,
        statusChangeCount,
        regressionCount,
        churnCount,
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
    category: string,
    priority: OrderPriority,
    hours: number,
  ) {
    if (this.isTerminalCategory(category)) {
      return false;
    }

    if (priority === OrderPriority.HIGH && hours >= 12) {
      return true;
    }

    if (category === 'TODO' && hours >= 24) {
      return true;
    }

    if (category === 'ACTIVE' && hours >= 48) {
      return true;
    }

    if (category === 'REVIEW' && hours >= 36) {
      return true;
    }

    if (category === 'QA' && hours >= 36) {
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
