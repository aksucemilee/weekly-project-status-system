import { createContext, useContext } from "react";

import type { CurrentUser, PermissionCode } from "../types/auth";

export type AuthContextValue = {
  user: CurrentUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<CurrentUser>;
  signOut: () => Promise<void>;
  hasPermission: (permission: PermissionCode) => boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth, AuthProvider içinde kullanılmalıdır.");
  }

  return context;
}
