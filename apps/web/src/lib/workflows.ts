import { apiFetch } from './api';
import { getAccessToken } from './auth';
import type { Workflow } from '@/types/workflow';

function requireAccessToken() {
  const token = getAccessToken();

  if (!token) {
    throw new Error('You must be logged in to view workflows');
  }

  return token;
}

export async function getDefaultWorkflow() {
  const token = requireAccessToken();

  return apiFetch<Workflow>('/api/v1/workflows/default', {
    token,
  });
}