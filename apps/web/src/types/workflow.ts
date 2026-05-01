export type StatusCategory =
  | 'TODO'
  | 'ACTIVE'
  | 'REVIEW'
  | 'QA'
  | 'DONE'
  | 'CANCELED';

export type WorkflowStatus = {
  id: string;
  workflowId: string;
  name: string;
  key: string;
  order: number;
  category: StatusCategory;
  isStart: boolean;
  isTerminal: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Workflow = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  statuses: WorkflowStatus[];
  transitions: WorkflowTransition[];
};

export type WorkflowTransition = {
  id: string;
  workflowId: string;
  fromStatusId: string;
  toStatusId: string;
  createdAt: string;
  updatedAt: string;
};