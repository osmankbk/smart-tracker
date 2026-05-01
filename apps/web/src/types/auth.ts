export type AuthUser = {
  id: string;
  name?: string;
  email: string;
  role: string;
  organizationId: string | null;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};
