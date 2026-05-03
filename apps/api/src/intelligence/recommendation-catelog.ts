import { Recommendation } from './types/recommendation.type';

type RecommendationInput = {
  statusLabel?: string;
};

export const recommendationCatalog = {
  // =========================
  // DASHBOARD RECOMMENDATIONS
  // =========================

  reviewAssignmentSuggestions(): Recommendation {
    return {
      type: 'ASSIGN',
      message:
        'Review smart assignment suggestions for unassigned risk-bearing orders.',
      priority: 90,
    };
  },

  assignHighRiskOrders(): Recommendation {
    return {
      type: 'ASSIGN',
      message:
        'Assign owners to high-risk unassigned orders before reviewing lower-risk work.',
      priority: 95,
    };
  },

  rebalanceWorkload(): Recommendation {
    return {
      type: 'REBALANCE',
      message:
        'Workload is unevenly distributed across team members. Consider rebalancing assignments.',
      priority: 80,
    };
  },

  reviewCriticalRiskOrders(): Recommendation {
    return {
      type: 'ESCALATE',
      message: 'Review critical-risk orders before handling routine work.',
      priority: 100,
    };
  },

  reviewHighRiskOrders(): Recommendation {
    return {
      type: 'REVIEW',
      message:
        'Check high-risk orders for blockers, ownership, or escalation needs.',
      priority: 85,
    };
  },

  investigateStuckOrders(): Recommendation {
    return {
      type: 'INVESTIGATE',
      message: 'Review stuck orders and confirm the next required action.',
      priority: 75,
    };
  },

  monitorDashboard(): Recommendation {
    return {
      type: 'REVIEW',
      message: 'Continue monitoring normal workflow and keep statuses updated.',
      priority: 20,
    };
  },

  // =========================
  // ORDER-LEVEL RECOMMENDATIONS
  // =========================

  assignOwner(): Recommendation {
    return {
      type: 'ASSIGN',
      message: 'Assign an owner so this order has clear accountability.',
      priority: 70,
    };
  },

  assignStuckOwner(): Recommendation {
    return {
      type: 'ASSIGN',
      message:
        'Assign an owner immediately because this stuck order has no clear owner.',
      priority: 95,
    };
  },

  assignHighRiskOwner(): Recommendation {
    return {
      type: 'ASSIGN',
      message: 'Assign ownership before escalating this high-risk order.',
      priority: 100,
    };
  },

  investigateStuck({ statusLabel }: RecommendationInput): Recommendation {
    return {
      type: 'INVESTIGATE',
      message: `Investigate why this order has been stuck in ${statusLabel}.`,
      priority: 85,
    };
  },

  reviewHighPriority(): Recommendation {
    return {
      type: 'ESCALATE',
      message:
        'Review this high-priority order and escalate if progress is blocked.',
      priority: 90,
    };
  },

  reviewTodoDelay({ statusLabel }: RecommendationInput): Recommendation {
    return {
      type: 'REVIEW',
      message: `Review why this order has not moved past ${statusLabel}.`,
      priority: 75,
    };
  },

  investigateActiveBlockers({
    statusLabel,
  }: RecommendationInput): Recommendation {
    return {
      type: 'INVESTIGATE',
      message: `Investigate blockers preventing progress from ${statusLabel}.`,
      priority: 85,
    };
  },

  reviewHandoffDelay({ statusLabel }: RecommendationInput): Recommendation {
    return {
      type: 'REVIEW',
      message: `Review approval or handoff delays in ${statusLabel}.`,
      priority: 80,
    };
  },

  reviewQaDelay(): Recommendation {
    return {
      type: 'REVIEW',
      message:
        'Review QA delays and confirm what is needed to complete this order.',
      priority: 80,
    };
  },

  investigateNoActivity(): Recommendation {
    return {
      type: 'INVESTIGATE',
      message: 'Investigate why no activity has been recorded after creation.',
      priority: 70,
    };
  },

  reviewRegression(): Recommendation {
    return {
      type: 'REVIEW',
      message:
        'Review recent regression to identify rework or unclear requirements.',
      priority: 80,
    };
  },

  investigateWorkflowChurn(): Recommendation {
    return {
      type: 'INVESTIGATE',
      message:
        'Investigate repeated status movement and possible workflow confusion.',
      priority: 78,
    };
  },

  reviewWorkflowInstability(): Recommendation {
    return {
      type: 'REVIEW',
      message:
        'Review recent status movement for signs of workflow instability.',
      priority: 65,
    };
  },

  noActionReopenOnly(): Recommendation {
    return {
      type: 'REVIEW',
      message:
        'No action needed unless this order must be reopened by an admin.',
      priority: 10,
    };
  },

  noActionCancellationReview(): Recommendation {
    return {
      type: 'REVIEW',
      message:
        'No action needed unless this cancellation needs review or reversal.',
      priority: 10,
    };
  },

  monitorNormally(): Recommendation {
    return {
      type: 'REVIEW',
      message: 'Continue monitoring this order normally.',
      priority: 20,
    };
  },
};
