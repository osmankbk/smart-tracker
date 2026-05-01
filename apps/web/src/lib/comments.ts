import { apiFetch } from './api';
import { getAccessToken } from './auth';
import type { CreateCommentInput, OrderComment } from '@/types/comment';

function requireAccessToken() {
  const token = getAccessToken();

  if (!token) {
    throw new Error('You must be logged in to view comments');
  }

  return token;
}

export async function getOrderComments(orderId: string) {
  const token = requireAccessToken();

  return apiFetch<OrderComment[]>(`/api/v1/orders/${orderId}/comments`, {
    token,
  });
}

export async function createOrderComment(
  orderId: string,
  input: CreateCommentInput,
) {
  const token = requireAccessToken();

  return apiFetch<OrderComment>(`/api/v1/orders/${orderId}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}