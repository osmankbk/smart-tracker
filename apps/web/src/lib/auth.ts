import { apiFetch } from './api';
import type {
  AuthResponse,
  AuthUser,
  LoginInput,
  RegisterInput,
} from '@/types/auth';

const TOKEN_STORAGE_KEY = 'smart_tracker_access_token';

export function saveAccessToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function login(input: LoginInput) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  saveAccessToken(response.accessToken);

  return response;
}

export async function register(input: RegisterInput) {
  const response = await apiFetch<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  saveAccessToken(response.accessToken);

  return response;
}

export async function getCurrentUser() {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  return apiFetch<AuthUser>('/api/v1/auth/me', {
    token,
  });
}

export function logout() {
  clearAccessToken();
}