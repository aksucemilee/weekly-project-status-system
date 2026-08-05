export const formatDisplayDate = (
  date: string | null | undefined,
): string => {
  if (!date) {
    return "Belirtilmedi";
  }

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}.${month}.${year}`;
};