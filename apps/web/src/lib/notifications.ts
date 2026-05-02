import { apiFetch } from './api';
import { getAccessToken } from './auth';
import type { Notification } from '@/types/notification';

function requireAccessToken() {
  const token = getAccessToken();

  if (!token) {
    throw new Error('You must be logged in to view notifications');
  }

  return token;
}

export async function getNotifications() {
  const token = requireAccessToken();

  return apiFetch<Notification[]>('/api/v1/notifications', {
    token,
  });
}

export async function markNotificationAsRead(id: string) {
  const token = requireAccessToken();

  return apiFetch<{ count: number }>(`/api/v1/notifications/${id}/read`, {
    method: 'PATCH',
    token,
  });
}