import { apiFetch } from './api';
import { getAccessToken } from './auth';
import type {
  AcceptInviteInput,
  CreateInviteInput,
  OrganizationInvite,
} from '@/types/invite';
import type { AuthResponse } from '@/types/auth';

function requireAccessToken() {
  const token = getAccessToken();

  if (!token) {
    throw new Error('You must be logged in to manage invites');
  }

  return token;
}

export async function getInvites() {
  const token = requireAccessToken();

  return apiFetch<OrganizationInvite[]>('/api/v1/invites', {
    token,
  });
}

export async function createInvite(input: CreateInviteInput) {
  const token = requireAccessToken();

  return apiFetch<OrganizationInvite>('/api/v1/invites', {
    method: 'POST',
    token,
    body: JSON.stringify(input),
  });
}

export async function acceptInvite(token: string, input: AcceptInviteInput) {
  return apiFetch<AuthResponse>(`/api/v1/invites/${token}/accept`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}