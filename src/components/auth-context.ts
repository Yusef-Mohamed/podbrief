import { createContext } from "react";

export type AuthUser = {
  user_id: string;
  email: string;
};

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
};

export type AuthContextValue = AuthState & {
  signIn: (payload: { token: string; user: AuthUser }) => void;
  signOut: () => void;
  logout: () => void;
};

export const AUTH_STORAGE_KEY = "podbreaf_auth";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);
