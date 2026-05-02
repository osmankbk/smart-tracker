export type OrganizationInvite = {
  id: string;
  email: string;
  role: string;
  token?: string;
  expiresAt: string;
  acceptedAt?: string | null;
  createdAt: string;
};

export type CreateInviteInput = {
  email: string;
  role?: string;
};

export type AcceptInviteInput = {
  name: string;
  password: string;
};