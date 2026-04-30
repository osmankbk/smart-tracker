'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  clearAccessToken,
  getAccessToken,
  getCurrentUser,
  saveAccessToken,
} from '@/lib/auth';
import type { AuthResponse, AuthUser } from '@/types/auth';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setAuth: (authResponse: AuthResponse) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const storedToken = getAccessToken();

    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      setToken(storedToken);

      const currentUser = await getCurrentUser();

      setUser(currentUser);
    } catch {
      clearAccessToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
    }, []);

    useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storedToken = getAccessToken();

      if (!storedToken) {
        if (!isMounted) return;
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        if (!isMounted) return;
        setToken(storedToken);

        const currentUser = await getCurrentUser();

        if (!isMounted) return;
        setUser(currentUser);
      } catch {
        if (!isMounted) return;
        clearAccessToken();
        setUser(null);
        setToken(null);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  function setAuth(authResponse: AuthResponse) {
    saveAccessToken(authResponse.accessToken);
    setToken(authResponse.accessToken);
    setUser(authResponse.user);
  }

  function handleLogout() {
    clearAccessToken();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      setAuth,
      refreshUser,
      logout: handleLogout,
    }),
    [user, token, isLoading, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}