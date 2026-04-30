import { apiFetch } from './api';
import { getAccessToken } from './auth';
import type { CreateOrderInput, Order, UpdateOrderInput } from '@/types/order';

function requireAccessToken() {
  const token = getAccessToken();

  if (!token) {
    throw new Error('You must be logged in to perform this action');
  }

  return token;
}

export async function getOrders() {
  return apiFetch<Order[]>('/api/v1/orders');
}

export async function createOrder(input: CreateOrderInput) {
  const token = requireAccessToken();

  return apiFetch<Order>('/api/v1/orders', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export async function updateOrder(id: string, input: UpdateOrderInput) {
  const token = requireAccessToken();

  return apiFetch<Order>(`/api/v1/orders/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}

export async function cancelOrder(id: string) {
  const token = requireAccessToken();

  return apiFetch<Order>(`/api/v1/orders/${id}`, {
    method: 'DELETE',
    token,
  });
}

export async function getOrderById(id: string) {
  return apiFetch<Order>(`/api/v1/orders/${id}`);
}