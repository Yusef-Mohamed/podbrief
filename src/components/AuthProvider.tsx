import React, { useCallback, useMemo, useState } from "react";
import {
  AUTH_STORAGE_KEY,
  type AuthContextValue,
  type AuthState,
  type AuthUser,
  AuthContext,
} from "./auth-context";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState;
        return { token: parsed.token ?? null, user: parsed.user ?? null };
      }
    } catch {
      // ignore
    }
    return { token: null, user: null };
  });

  const signIn = useCallback((payload: { token: string; user: AuthUser }) => {
    const nextAuth: AuthState = { token: payload.token, user: payload.user };
    setAuth(nextAuth);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    } catch {
      void 0;
    }
  }, []);

  const signOut = useCallback(() => {
    setAuth({ token: null, user: null });
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      void 0;
    }
  }, []);

  // Alias for clarity in consumers
  const logout = useCallback(() => {
    signOut();
  }, [signOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: auth.token,
      user: auth.user,
      signIn,
      signOut,
      logout,
    }),
    [auth.token, auth.user, signIn, signOut, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
