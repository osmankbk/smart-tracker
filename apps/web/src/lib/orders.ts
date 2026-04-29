import { apiFetch } from './api';
import { getAccessToken } from './auth';
import type { CreateOrderInput, Order } from '@/types/order';

export async function getOrders() {
  return apiFetch<Order[]>('/api/v1/orders');
}

export async function createOrder(input: CreateOrderInput) {
  const token = getAccessToken();

  if (!token) {
    throw new Error('You must be logged in to create an order');
  }

  return apiFetch<Order>('/api/v1/orders', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}