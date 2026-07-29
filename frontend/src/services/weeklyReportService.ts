import apiClient from "../api/apiClient";
import type {
  WeeklyReport,
  WeeklyReportCreateRequest,
} from "../types/weeklyReport";

export async function getWeeklyReportsByProject(
  projectId: number,
): Promise<WeeklyReport[]> {
  const response = await apiClient.get<WeeklyReport[]>(
    `/projects/${projectId}/weekly-reports`,
  );

  return response.data;
}

export async function createWeeklyReport(
  projectId: number,
  request: WeeklyReportCreateRequest,
): Promise<WeeklyReport> {
  const response = await apiClient.post<WeeklyReport>(
    `/projects/${projectId}/weekly-reports`,
    request,
  );

  return response.data;
}