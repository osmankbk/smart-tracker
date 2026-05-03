export type RecommendationType =
  | 'ASSIGN'
  | 'ESCALATE'
  | 'REVIEW'
  | 'REBALANCE'
  | 'INVESTIGATE';

export type Recommendation = {
  type: RecommendationType;
  message: string;
  priority: number; // higher = more important
  confidence?: number; // 0–1 (optional for now)
};
