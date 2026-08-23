import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { AuthContext } from "./authContext";
import type { AuthContextValue } from "./authContext";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "../services/authService";
import type { CurrentUser, PermissionCode } from "../types/auth";

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Sayfa yenilendiginde oturum sunucuda durmaya devam eder; mevcut
   * kullaniciyi /api/me ile geri okuruz. 401 donmesi "oturum yok"
   * anlamina gelir ve hata sayilmaz.
   */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setUser(currentUser);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const signedInUser = await loginRequest({ email, password });

    setUser(signedInUser);

    return signedInUser;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: PermissionCode) =>
      user?.permissions.includes(permission) ?? false,
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signIn,
      signOut,
      hasPermission,
    }),
    [user, isLoading, signIn, signOut, hasPermission],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export default AuthProvider;
