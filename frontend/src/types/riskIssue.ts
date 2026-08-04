import type { RiskLevel } from "./weeklyReport";

export type RiskIssueType = "RISK" | "BLOCKER";

export type RiskIssueStatus =
  | "OPEN"
  | "ACTION_IN_PROGRESS"
  | "RESOLVED";

export type RiskIssue = {
  id: number;
  weeklyReportId: number;
  type: RiskIssueType;
  title: string;
  description: string | null;
  riskLevel: RiskLevel;
  actionPlan: string | null;
  responsible: string | null;
  targetDate: string | null;
  status: RiskIssueStatus;
  createdAt: string;
  updatedAt: string;
};

export type RiskIssueCreateRequest = {
  type: RiskIssueType;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  actionPlan: string;
  responsible: string;
  targetDate: string | null;
  status: RiskIssueStatus;
};

export type RiskIssueUpdateRequest = RiskIssueCreateRequest;