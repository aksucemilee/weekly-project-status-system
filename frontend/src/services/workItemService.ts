import apiClient from "../api/apiClient";
import type {
  WorkItem,
  WorkItemCreateRequest,
  WorkItemUpdateRequest,
} from "../types/workItem";

export const getWorkItemsByWeeklyReport = async (
  weeklyReportId: number,
): Promise<WorkItem[]> => {
  const response = await apiClient.get<WorkItem[]>(
    `/weekly-reports/${weeklyReportId}/work-items`,
  );

  return response.data;
};

export const createWorkItem = async (
  weeklyReportId: number,
  request: WorkItemCreateRequest,
): Promise<WorkItem> => {
  const response = await apiClient.post<WorkItem>(
    `/weekly-reports/${weeklyReportId}/work-items`,
    request,
  );

  return response.data;
};

export const updateWorkItem = async (
  weeklyReportId: number,
  workItemId: number,
  request: WorkItemUpdateRequest,
): Promise<WorkItem> => {
  const response = await apiClient.put<WorkItem>(
    `/weekly-reports/${weeklyReportId}/work-items/${workItemId}`,
    request,
  );

  return response.data;
};

export const deleteWorkItem = async (
  weeklyReportId: number,
  workItemId: number,
): Promise<void> => {
  await apiClient.delete(
    `/weekly-reports/${weeklyReportId}/work-items/${workItemId}`,
  );
};