import apiClient from "../api/apiClient";
import type {
  Project,
  ProjectCreateRequest,
  ProjectUpdateRequest,
} from "../types/project";

export async function getProjects(): Promise<Project[]> {
  const response = await apiClient.get<Project[]>("/projects");
  return response.data;
}

export async function createProject(
  request: ProjectCreateRequest,
): Promise<Project> {
  const response = await apiClient.post<Project>(
    "/projects",
    request,
  );

  return response.data;
}

export async function updateProject(
  projectId: number,
  request: ProjectUpdateRequest,
): Promise<Project> {
  const response = await apiClient.put<Project>(
    `/projects/${projectId}`,
    request,
  );

  return response.data;
}