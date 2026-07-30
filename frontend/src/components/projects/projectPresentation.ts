import type { ProjectStatus } from "../../types/project";

type ProjectStatusColor =
  | "info"
  | "primary"
  | "success"
  | "error";

export const projectStatusLabels: Record<
  ProjectStatus,
  string
> = {
  PLANNED: "Planlandı",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
  BLOCKED: "Bloke",
};

export const projectStatusColors: Record<
  ProjectStatus,
  ProjectStatusColor
> = {
  PLANNED: "info",
  IN_PROGRESS: "primary",
  COMPLETED: "success",
  BLOCKED: "error",
};

export const formatProjectDate = (date: string) =>
  new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));