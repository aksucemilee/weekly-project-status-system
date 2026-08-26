import type { ProjectStatus } from "./project";
import type {
  GeneralStatus,
  RiskLevel,
  ScheduleStatus,
} from "./weeklyReport";

export type DashboardProjectSummary = {
  projectId: number;
  projectName: string;
  customerName: string;
  responsibleManager: string | null;
  projectStatus: ProjectStatus;
  latestReportId: number | null;
  reportWeekStart: string | null;
  targetProgress: number | null;
  actualProgress: number | null;
  generalStatus: GeneralStatus | null;
  scheduleStatus: ScheduleStatus | null;
  riskLevel: RiskLevel | null;
  activeWorkItemCount: number;
};

export type DashboardSummary = {
  totalProjects: number;
  projectsWithReports: number;
  highRiskProjects: number;
  delayedProjects: number;
  blockedProjects: number;
  projects: DashboardProjectSummary[];
};

export type DashboardFilters = {
  weekStart?: string;
  projectId?: number;
  generalStatus?: GeneralStatus;
  riskLevel?: RiskLevel;
  scheduleStatus?: ScheduleStatus;
};