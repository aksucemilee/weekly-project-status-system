import type { RoleCode } from "./auth";

export type AssignmentRole =
  | "PROJE_YONETICISI"
  | "EKIP_LIDERI";

export type AdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleCode;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminUserCreateRequest = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: RoleCode;
  active: boolean;
};

export type AdminUserUpdateRequest = {
  firstName: string;
  lastName: string;
  role: RoleCode;
  active: boolean;
};

export type ProjectAssignment = {
  id: number;
  projectId: number;
  projectName: string;
  userId: number;
  userEmail: string;
  assignmentRole: AssignmentRole;
  active: boolean;
};

export type AssignmentCreateRequest = {
  projectId: number;
  userId: number;
  assignmentRole: AssignmentRole;
};

export type AssignmentUpdateRequest = {
  assignmentRole: AssignmentRole;
  active: boolean;
};

export const roleLabels: Record<RoleCode, string> = {
  PROJE_YONETICISI: "Proje Yöneticisi",
  CTO: "CTO",
  ADMIN: "Admin",
  EKIP_LIDERI: "Ekip Lideri",
};

export const assignmentRoleLabels: Record<AssignmentRole, string> = {
  PROJE_YONETICISI: "Proje Yöneticisi",
  EKIP_LIDERI: "Ekip Lideri",
};
