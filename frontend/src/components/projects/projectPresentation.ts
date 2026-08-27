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
  PLANNED: "Başlamadı",
  ACTIVE: "Aktif",
  ON_HOLD: "Askıda",
  CLOSED: "Kapandı",
};

export const projectStatusColors: Record<
  ProjectStatus,
  ProjectStatusColor
> = {
  PLANNED: "info",
  ACTIVE: "primary",
  ON_HOLD: "error",
  CLOSED: "success",
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