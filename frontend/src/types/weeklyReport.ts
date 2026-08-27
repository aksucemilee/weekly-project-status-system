export type GeneralStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "IN_TEST"
  | "COMPLETED"
  | "BLOCKED";

export type ScheduleStatus =
  | "ON_TRACK"
  | "DELAYED";

export type RiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type WeeklyReport = {
  id: number;
  projectId: number;
  projectName: string;
  reportWeekStart: string;
  targetProgress: number;
  actualProgress: number;
  generalStatus: GeneralStatus;
  scheduleStatus: ScheduleStatus;
  riskLevel: RiskLevel;
  completedSummary: string | null;
  nextWeekPlan: string | null;
  blockers: string | null;
  generalNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WeeklyReportCreateRequest = {
  reportWeekStart: string;
  targetProgress: number;
  actualProgress: number;
  generalStatus: GeneralStatus;
  scheduleStatus: ScheduleStatus;
  completedSummary: string;
  nextWeekPlan: string;
  blockers: string;
  generalNote: string;
};

export type WeeklyReportUpdateRequest = WeeklyReportCreateRequest;