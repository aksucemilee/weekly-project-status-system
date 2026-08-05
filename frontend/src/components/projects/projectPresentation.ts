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

export const formatProjectDate = (
  date: string | null | undefined,
) => {
  if (!date) {
    return "Belirtilmedi";
  }

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}.${month}.${year}`;
};