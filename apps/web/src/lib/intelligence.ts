import { apiFetch } from './api';
import { getAccessToken } from './auth';
import type { DashboardIntelligence } from '@/types/order';

function requireAccessToken() {
  const token = getAccessToken();

  if (!token) {
    throw new Error('You must be logged in to view intelligence');
  }

  return token;
}

export async function getDashboardBrief() {
  const token = requireAccessToken();

  return apiFetch<DashboardIntelligence>('/api/v1/intelligence/brief', {
    token,
  });
}