export type ProjectStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED";

export type Project = {
  id: number;
  name: string;
  customerName: string;
  description: string;
  startDate: string;
  targetEndDate: string;
  status: ProjectStatus;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectCreateRequest = {
  name: string;
  customerName: string;
  description: string;
  startDate: string;
  targetEndDate: string;
  status: ProjectStatus;
};