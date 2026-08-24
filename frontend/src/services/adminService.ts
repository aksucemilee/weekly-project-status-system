import apiClient from "../api/apiClient";
import type {
  AdminUser,
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
  AssignmentCreateRequest,
  AssignmentUpdateRequest,
  ProjectAssignment,
} from "../types/admin";

export async function getUsers(): Promise<AdminUser[]> {
  const response = await apiClient.get<AdminUser[]>("/admin/users");

  return response.data;
}

export async function createUser(
  request: AdminUserCreateRequest,
): Promise<AdminUser> {
  const response = await apiClient.post<AdminUser>("/admin/users", request);

  return response.data;
}

export async function updateUser(
  userId: number,
  request: AdminUserUpdateRequest,
): Promise<AdminUser> {
  const response = await apiClient.put<AdminUser>(
    `/admin/users/${userId}`,
    request,
  );

  return response.data;
}

export async function getAssignmentsByUser(
  userId: number,
): Promise<ProjectAssignment[]> {
  const response = await apiClient.get<ProjectAssignment[]>(
    "/admin/assignments",
    {
      params: { userId },
    },
  );

  return response.data;
}

export async function createAssignment(
  request: AssignmentCreateRequest,
): Promise<ProjectAssignment> {
  const response = await apiClient.post<ProjectAssignment>(
    "/admin/assignments",
    request,
  );

  return response.data;
}

export async function updateAssignment(
  assignmentId: number,
  request: AssignmentUpdateRequest,
): Promise<ProjectAssignment> {
  const response = await apiClient.put<ProjectAssignment>(
    `/admin/assignments/${assignmentId}`,
    request,
  );

  return response.data;
}
