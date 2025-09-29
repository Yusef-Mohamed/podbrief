import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthState;
        setAuth(parsed);
      }
    } catch {
      void 0;
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } catch {
      void 0;
    }
  }, [auth]);

  const signIn = useCallback((payload: { token: string; user: AuthUser }) => {
    setAuth({ token: payload.token, user: payload.user });
  }, []);

  const signOut = useCallback(() => {
    setAuth({ token: null, user: null });
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      void 0;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: auth.token,
      user: auth.user,
      signIn,
      signOut,
    }),
    [auth.token, auth.user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
