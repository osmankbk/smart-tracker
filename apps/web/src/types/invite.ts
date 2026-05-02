export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

export type InviteStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'EXPIRED'
  | 'CANCELED';

export type OrganizationInvite = {
  id: string;
  email: string;
  role: UserRole;

  status: InviteStatus;

  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

export type CreateInviteInput = {
  email: string;
  role?: UserRole;
};

export type CreateInviteResponse = OrganizationInvite & {
  token: string;
  inviteUrl: string;
};

export type InvitePreview = {
  email: string;
  role: UserRole;
  expiresAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
};

export type AcceptInviteInput = {
  name: string;
  password: string;
};