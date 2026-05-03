import { Injectable } from '@nestjs/common';
import { OrderPriority, OrderStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { recommendationCatalog } from './recommendation-catelog';
import { DashboardIntelligence } from './types/dashboard-intelligence.type';
import { OrderIntelligence, RiskLevel } from './types/order-intelligence.type';
import { Recommendation } from './types/recommendation.type';

const STATUS_CHANGE_ACTIONS = ['STATUS_CHANGED', 'STATUS_REGRESSION'];
const REGRESSION_ACTION = 'STATUS_REGRESSION';

type ActivityLogLike = {
  action: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus | null;
  createdAt: Date;
};

type OrderLike = {
  title?: string;
  id?: string;
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

  async getDashboardBrief(
    organizationId: string | null,
  ): Promise<DashboardIntelligence> {
    const orders = await this.prisma.order.findMany({
      where: { organizationId },
      include: {
        statusRef: true,
        activityLogs: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const members = await this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
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

    const workload = members.map((member) => ({
      assigneeId: member.id,
      assigneeName: member.name,
      assigneeEmail: member.email,
      count: analyzedOrders.filter((order) => order.assigneeId === member.id)
        .length,
    }));

    const workloadCounts = workload.map((item) => item.count);

    const avgWorkload =
      workloadCounts.length > 0
        ? workloadCounts.reduce((sum, count) => sum + count, 0) /
          workloadCounts.length
        : 0;

    const maxWorkload =
      workloadCounts.length > 0 ? Math.max(...workloadCounts) : 0;

    const minWorkload =
      workloadCounts.length > 0 ? Math.min(...workloadCounts) : 0;

    const isImbalanced = workload.length >= 2 && maxWorkload - minWorkload >= 2;

    const availableMembers = workload
      .filter((member) => member.assigneeId)
      .sort((a, b) => a.count - b.count);

    const assignmentSuggestions = analyzedOrders
      .filter(
        (order) =>
          !order.assigneeId &&
          ['MEDIUM', 'HIGH', 'CRITICAL'].includes(order.intelligence.riskLevel),
      )
      .slice(0, 5)
      .map((order) => {
        if (availableMembers.length === 0) {
          return null;
        }

        const scoredMembers = availableMembers.map((member) => ({
          ...member,
          score: this.scoreAssignmentCandidate(
            member,
            order.intelligence.riskLevel,
          ),
        }));

        const bestCandidate = scoredMembers.sort(
          (a, b) => b.score - a.score,
        )[0];

        return {
          orderId: order.id,
          orderTitle: order.title,
          suggestedAssigneeId: bestCandidate.assigneeId,
          suggestedAssigneeName: bestCandidate.assigneeName,
          suggestedAssigneeEmail: bestCandidate.assigneeEmail,
          reason: `${bestCandidate.assigneeName} has one of the lowest workloads and is a good candidate for this assignment.`,
        };
      })
      .filter((suggestion): suggestion is NonNullable<typeof suggestion> =>
        Boolean(suggestion),
      );

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

      recommendations: this.buildDashboardRecommendations({
        stuckOrders: stuckOrders.length,
        highRiskOrders: highRiskOrders.length,
        criticalRiskOrders: criticalRiskOrders.length,
        highRiskUnassignedOrders: highRiskUnassignedOrders.length,
        isImbalanced,
        assignmentSuggestionCount: assignmentSuggestions.length,
      }),

      workload,

      workloadStats: {
        avg: avgWorkload,
        max: maxWorkload,
        min: minWorkload,
        isImbalanced,
      },

      assignmentSuggestions,
    };
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
    const recommendations: Recommendation[] = [];

    let riskScore = 0;

    const isUnassigned = !order.assigneeId;

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

      this.addRecommendation(
        recommendations,
        recommendationCatalog.investigateStuck({ statusLabel }),
      );
    }

    if (isUnassigned && isStuck) {
      riskScore += 15;

      reasons.push('Stuck order has no assigned owner.');

      this.addRecommendation(
        recommendations,
        recommendationCatalog.assignStuckOwner(),
      );
    }

    if (isUnassigned) {
      riskScore += 10;

      reasons.push('Order is currently unassigned.');

      this.addRecommendation(
        recommendations,
        recommendationCatalog.assignOwner(),
      );
    }

    if (order.priority === OrderPriority.HIGH) {
      riskScore += 25;

      reasons.push('Order is marked HIGH priority.');

      this.addRecommendation(
        recommendations,
        recommendationCatalog.reviewHighPriority(),
      );
    }

    if (statusCategory === 'TODO' && timeInCurrentStatusHours >= 24) {
      riskScore += 20;

      reasons.push(
        `Order has remained in ${statusLabel} for at least 24 hours.`,
      );

      this.addRecommendation(
        recommendations,
        recommendationCatalog.reviewTodoDelay({ statusLabel }),
      );
    }

    if (statusCategory === 'ACTIVE' && timeInCurrentStatusHours >= 48) {
      riskScore += 30;

      reasons.push(`Order has been in ${statusLabel} for at least 48 hours.`);

      this.addRecommendation(
        recommendations,
        recommendationCatalog.investigateActiveBlockers({ statusLabel }),
      );
    }

    if (statusCategory === 'REVIEW' && timeInCurrentStatusHours >= 36) {
      riskScore += 25;

      reasons.push(
        `Order has been waiting in ${statusLabel} for at least 36 hours.`,
      );

      this.addRecommendation(
        recommendations,
        recommendationCatalog.reviewHandoffDelay({ statusLabel }),
      );
    }

    if (statusCategory === 'QA' && timeInCurrentStatusHours >= 36) {
      riskScore += 25;

      reasons.push(`Order has been in ${statusLabel} for at least 36 hours.`);

      this.addRecommendation(
        recommendations,
        recommendationCatalog.reviewQaDelay(),
      );
    }

    if (order.activityLogs.length === 0 && timeInCurrentStatusHours >= 24) {
      riskScore += 15;

      reasons.push('Order has no recorded activity after creation.');

      this.addRecommendation(
        recommendations,
        recommendationCatalog.investigateNoActivity(),
      );
    }

    if (regressionCount > 0) {
      const regressionRisk = Math.min(regressionCount * 15, 45);

      riskScore += regressionRisk;

      reasons.push(
        `Order has regressed ${regressionCount} time(s), indicating possible rework or unclear requirements.`,
      );

      this.addRecommendation(
        recommendations,
        recommendationCatalog.reviewRegression(),
      );
    }

    if (churnCount >= 3) {
      riskScore += 20;

      reasons.push(
        `Order has high workflow churn with ${statusChangeCount} status movement(s).`,
      );

      this.addRecommendation(
        recommendations,
        recommendationCatalog.investigateWorkflowChurn(),
      );
    } else if (churnCount >= 1) {
      riskScore += 10;

      reasons.push(
        `Order has changed status ${statusChangeCount} time(s), suggesting some workflow instability.`,
      );

      this.addRecommendation(
        recommendations,
        recommendationCatalog.reviewWorkflowInstability(),
      );
    }

    if (statusCategory === 'DONE') {
      riskScore = Math.min(riskScore, 10);

      reasons.push(`Order is in terminal status ${statusLabel}.`);

      this.addRecommendation(
        recommendations,
        recommendationCatalog.noActionReopenOnly(),
      );
    }

    if (statusCategory === 'CANCELED') {
      riskScore = Math.min(riskScore, 10);

      reasons.push(`Order is canceled in status ${statusLabel}.`);

      this.addRecommendation(
        recommendations,
        recommendationCatalog.noActionCancellationReview(),
      );
    }

    if (
      isUnassigned &&
      (this.getRiskLevel(riskScore) === 'HIGH' ||
        this.getRiskLevel(riskScore) === 'CRITICAL')
    ) {
      reasons.push('High-risk order is not owned by anyone.');

      this.addRecommendation(
        recommendations,
        recommendationCatalog.assignHighRiskOwner(),
      );
    }

    riskScore = Math.min(riskScore, 100);

    if (reasons.length === 0) {
      reasons.push('No major lifecycle risks detected.');
    }

    if (recommendations.length === 0) {
      this.addRecommendation(
        recommendations,
        recommendationCatalog.monitorNormally(),
      );
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
      recommendations: this.sortRecommendations(recommendations),
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
    isImbalanced: boolean;
    assignmentSuggestionCount: number;
  }): Recommendation[] {
    const recommendations: Recommendation[] = [];

    if (input.assignmentSuggestionCount > 0) {
      this.addRecommendation(
        recommendations,
        recommendationCatalog.reviewAssignmentSuggestions(),
      );
    }

    if (input.highRiskUnassignedOrders > 0) {
      this.addRecommendation(
        recommendations,
        recommendationCatalog.assignHighRiskOrders(),
      );
    }

    if (input.isImbalanced) {
      this.addRecommendation(
        recommendations,
        recommendationCatalog.rebalanceWorkload(),
      );
    }

    if (input.criticalRiskOrders > 0) {
      this.addRecommendation(
        recommendations,
        recommendationCatalog.reviewCriticalRiskOrders(),
      );
    }

    if (input.highRiskOrders > 0) {
      this.addRecommendation(
        recommendations,
        recommendationCatalog.reviewHighRiskOrders(),
      );
    }

    if (input.stuckOrders > 0) {
      this.addRecommendation(
        recommendations,
        recommendationCatalog.investigateStuckOrders(),
      );
    }

    if (recommendations.length === 0) {
      this.addRecommendation(
        recommendations,
        recommendationCatalog.monitorDashboard(),
      );
    }

    return this.sortRecommendations(recommendations);
  }

  private addRecommendation(
    recommendations: Recommendation[],
    recommendation: Recommendation,
  ) {
    const exists = recommendations.some(
      (item) =>
        item.type === recommendation.type &&
        item.message === recommendation.message,
    );

    if (!exists) {
      recommendations.push(recommendation);
    }
  }

  private sortRecommendations(recommendations: Recommendation[]) {
    return [...recommendations].sort((a, b) => b.priority - a.priority);
  }

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

  private scoreAssignmentCandidate(
    member: {
      assigneeId: string;
      assigneeName: string;
      assigneeEmail: string;
      count: number;
    },
    orderRiskLevel: RiskLevel,
  ) {
    let score = 0;

    score += Math.max(0, 10 - member.count * 2);

    if (member.count === 0) {
      score += 5;
    }

    if (orderRiskLevel === 'HIGH' || orderRiskLevel === 'CRITICAL') {
      score += Math.max(0, 5 - member.count);
    }

    return score;
  }
}
