import { apiFetch } from './api';
import { getAccessToken } from './auth';
import type { OrganizationMember } from '@/types/organization';

function requireAccessToken() {
  const token = getAccessToken();

  if (!token) {
    throw new Error('You must be logged in to view organization members');
  }

  return token;
}

export async function getOrganizationMembers() {
  const token = requireAccessToken();

  return apiFetch<OrganizationMember[]>('/api/v1/organizations/members', {
    token,
  });
}