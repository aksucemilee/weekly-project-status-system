import type { DashboardProjectSummary } from "../../types/dashboard";

export type DashboardHealth =
  | "HEALTHY"
  | "ATTENTION"
  | "CRITICAL"
  | "NO_REPORT";

type StatusColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

export const dashboardHealthLabels: Record<DashboardHealth, string> = {
  HEALTHY: "İyi",
  ATTENTION: "Dikkat",
  CRITICAL: "Kritik",
  NO_REPORT: "Rapor bekleniyor",
};

export const dashboardHealthColors: Record<
  DashboardHealth,
  StatusColor
> = {
  HEALTHY: "success",
  ATTENTION: "warning",
  CRITICAL: "error",
  NO_REPORT: "default",
};

export function getDashboardHealth(
  project: DashboardProjectSummary,
): DashboardHealth {
  if (project.latestReportId === null) {
    return "NO_REPORT";
  }

  if (
    project.projectStatus === "BLOCKED" ||
    project.generalStatus === "BLOCKED" ||
    project.riskLevel === "HIGH"
  ) {
    return "CRITICAL";
  }

  if (
    project.scheduleStatus === "DELAYED" ||
    project.generalStatus === "DELAYED" ||
    project.generalStatus === "AT_RISK" ||
    project.riskLevel === "MEDIUM"
  ) {
    return "ATTENTION";
  }

  return "HEALTHY";
}

export function formatDashboardDate(date: string | null): string {
  if (!date) {
    return "Rapor yok";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}