export type ProjectStatus =
  | "PLANNED"
  | "ACTIVE"
  | "ON_HOLD"
  | "CLOSED";

export type Project = {
  id: number;
  name: string;
  customerName: string;
  responsibleManager: string | null;
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

export type ProjectUpdateRequest = ProjectCreateRequest & {
  active: boolean;
};