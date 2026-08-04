export type WorkItemStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "IN_TEST"
  | "COMPLETED"
  | "BLOCKED";

export type WorkItem = {
  id: number;
  weeklyReportId: number;
  title: string;
  description: string | null;
  responsible: string | null;
  status: WorkItemStatus;
  plannedDate: string | null;
  completedDate: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkItemCreateRequest = {
  title: string;
  description: string;
  responsible: string;
  status: WorkItemStatus;
  plannedDate: string | null;
  completedDate: string | null;
  note: string;
};

export type WorkItemUpdateRequest = WorkItemCreateRequest;