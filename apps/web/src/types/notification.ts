export type NotificationType = 'MENTION';

export type Notification = {
  id: string;
  organizationId: string;
  userId: string;
  actorId?: string | null;
  orderId?: string | null;
  commentId?: string | null;
  type: NotificationType;
  title: string;
  body?: string | null;
  readAt?: string | null;
  createdAt: string;
  updatedAt: string;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  order?: {
    id: string;
    title: string;
  } | null;
  comment?: {
    id: string;
    body: string;
  } | null;
};