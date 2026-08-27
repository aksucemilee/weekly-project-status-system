import type {
  GeneralStatus,
  RiskLevel,
  ScheduleStatus,
} from "../../types/weeklyReport";

type StatusColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

export const generalStatusLabels: Record<
  GeneralStatus,
  string
> = {
  PLANNED: "Planlandı",
  IN_PROGRESS: "Devam Ediyor",
  IN_TEST: "Testte",
  COMPLETED: "Tamamlandı",
  BLOCKED: "Bloke",
};

export const generalStatusColors: Record<
  GeneralStatus,
  StatusColor
> = {
  PLANNED: "info",
  IN_PROGRESS: "primary",
  IN_TEST: "warning",
  COMPLETED: "success",
  BLOCKED: "error",
};

export const scheduleStatusLabels: Record<
  ScheduleStatus,
  string
> = {
  ON_TRACK: "Takvime Uygun",
  DELAYED: "Gecikmiş",
};

export const scheduleStatusColors: Record<
  ScheduleStatus,
  StatusColor
> = {
  ON_TRACK: "success",
  DELAYED: "warning",
};

export const riskLevelLabels: Record<RiskLevel, string> = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
};

export const riskLevelColors: Record<
  RiskLevel,
  StatusColor
> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "error",
};

export const formatReportDate = (date: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));

export type ReportFilterForm = {
  weekStart: string;
  generalStatus: "" | GeneralStatus;
  riskLevel: "" | RiskLevel;
  scheduleStatus: "" | ScheduleStatus;
};

export const emptyReportFilterForm: ReportFilterForm = {
  weekStart: "",
  generalStatus: "",
  riskLevel: "",
  scheduleStatus: "",
};

export function hasActiveReportFilters(filters: ReportFilterForm) {
  return Boolean(
    filters.weekStart ||
      filters.generalStatus ||
      filters.riskLevel ||
      filters.scheduleStatus,
  );
}