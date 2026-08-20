import apiClient from "../api/apiClient";
import type {
  GeneralStatus,
  RiskLevel,
  ScheduleStatus,
  WeeklyReport,
  WeeklyReportCreateRequest,
} from "../types/weeklyReport";

export type WeeklyReportListFilters = {
  weekStart?: string;
  generalStatus?: GeneralStatus;
  riskLevel?: RiskLevel;
  scheduleStatus?: ScheduleStatus;
};

export async function getWeeklyReportsByProject(
  projectId: number,
  filters: WeeklyReportListFilters = {},
): Promise<WeeklyReport[]> {
  const response = await apiClient.get<WeeklyReport[]>(
    `/projects/${projectId}/weekly-reports`,
    {
      params: filters,
    },
  );

  return response.data;
}

export async function getWeeklyReportById(
  projectId: number,
  weeklyReportId: number,
): Promise<WeeklyReport> {
  const response = await apiClient.get<WeeklyReport>(
    `/projects/${projectId}/weekly-reports/${weeklyReportId}`,
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