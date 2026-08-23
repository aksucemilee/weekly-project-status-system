export type RoleCode =
  | "PROJE_YONETICISI"
  | "CTO"
  | "ADMIN"
  | "EKIP_LIDERI";

export type PermissionCode =
  | "PROJECT_VIEW"
  | "PROJECT_MANAGE"
  | "REPORT_VIEW"
  | "REPORT_CREATE"
  | "WORKITEM_VIEW"
  | "WORKITEM_MANAGE"
  | "RISK_VIEW"
  | "RISK_MANAGE"
  | "DASHBOARD_VIEW"
  | "USER_MANAGE"
  | "ASSIGNMENT_MANAGE";

export type CurrentUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleCode;
  permissions: PermissionCode[];
};

export type LoginRequest = {
  email: string;
  password: string;
};

/**
 * Rolun baslangic ekrani. Dashboard yalnizca DASHBOARD_VIEW yetkisi olan
 * kullaniciya acik oldugu icin, giris sonrasi kosulsuz /dashboard'a
 * yonlendirme yapilamaz.
 */
export function getLandingPath(user: CurrentUser): string {
  if (user.permissions.includes("DASHBOARD_VIEW")) {
    return "/dashboard";
  }

  if (user.permissions.includes("USER_MANAGE")) {
    return "/admin";
  }

  if (user.permissions.includes("REPORT_VIEW")) {
    return "/reports";
  }

  return "/projects";
}
