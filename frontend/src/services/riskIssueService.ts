import apiClient from "../api/apiClient";
import type {
  RiskIssue,
  RiskIssueCreateRequest,
  RiskIssueUpdateRequest,
} from "../types/riskIssue";

export const getRiskIssuesByWeeklyReport = async (
  weeklyReportId: number,
): Promise<RiskIssue[]> => {
  const response = await apiClient.get<RiskIssue[]>(
    `/weekly-reports/${weeklyReportId}/risk-issues`,
  );

  return response.data;
};

export const createRiskIssue = async (
  weeklyReportId: number,
  request: RiskIssueCreateRequest,
): Promise<RiskIssue> => {
  const response = await apiClient.post<RiskIssue>(
    `/weekly-reports/${weeklyReportId}/risk-issues`,
    request,
  );

  return response.data;
};

export const updateRiskIssue = async (
  weeklyReportId: number,
  riskIssueId: number,
  request: RiskIssueUpdateRequest,
): Promise<RiskIssue> => {
  const response = await apiClient.put<RiskIssue>(
    `/weekly-reports/${weeklyReportId}/risk-issues/${riskIssueId}`,
    request,
  );

  return response.data;
};

export const deleteRiskIssue = async (
  weeklyReportId: number,
  riskIssueId: number,
): Promise<void> => {
  await apiClient.delete(
    `/weekly-reports/${weeklyReportId}/risk-issues/${riskIssueId}`,
  );
};