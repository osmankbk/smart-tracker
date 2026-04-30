export type OrderStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';

export type OrderPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type OrderUser = {
  id: string;
  name: string;
  email: string;
  role: string;
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
  priority?: OrderPriority;
  assigneeId?: string;
};