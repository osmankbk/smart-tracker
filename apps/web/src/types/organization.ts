import type { UserRole } from './invite';

export type OrganizationMember = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};