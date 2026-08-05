import apiClient from "../api/apiClient";
import type {
  DashboardFilters,
  DashboardSummary,
} from "../types/dashboard";

export async function getDashboardSummary(
  filters: DashboardFilters = {},
): Promise<DashboardSummary> {
  const response = await apiClient.get<DashboardSummary>(
    "/dashboard",
    {
      params: filters,
    },
  );

  return response.data;
}