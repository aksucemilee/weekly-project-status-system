import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { getWorkItemsByWeeklyReport } from "../../services/workItemService";
import type { WorkItem, WorkItemStatus } from "../../types/workItem";

type DashboardWorkItemListProps = {
  weeklyReportId: number;
};

type StatusColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

const workItemStatusLabels: Record<WorkItemStatus, string> = {
  PLANNED: "Planlandı",
  IN_PROGRESS: "Devam Ediyor",
  IN_TEST: "Testte",
  COMPLETED: "Tamamlandı",
  BLOCKED: "Bloke",
};

const workItemStatusColors: Record<WorkItemStatus, StatusColor> = {
  PLANNED: "info",
  IN_PROGRESS: "primary",
  IN_TEST: "warning",
  COMPLETED: "success",
  BLOCKED: "error",
};

const workItemStatusPriority: Record<WorkItemStatus, number> = {
  BLOCKED: 0,
  IN_PROGRESS: 1,
  IN_TEST: 2,
  PLANNED: 3,
  COMPLETED: 4,
};

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatOptionalDate(date: string | null): string | null {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return dateFormatter.format(parsedDate);
}

function DashboardWorkItemList({ weeklyReportId }: DashboardWorkItemListProps) {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadWorkItems = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const items = await getWorkItemsByWeeklyReport(weeklyReportId);

      setWorkItems(items);
    } catch {
      setWorkItems([]);
      setErrorMessage("İş kalemleri yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [weeklyReportId]);

  useEffect(() => {
    void loadWorkItems();
  }, [loadWorkItems]);

  const sortedWorkItems = [...workItems].sort((first, second) => {
    const statusDifference =
      workItemStatusPriority[first.status] -
      workItemStatusPriority[second.status];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return first.title.localeCompare(second.title, "tr");
  });

  return (
    <Box component="section">
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 1.5,
        }}
      >
        <Box>
          <Typography variant="h6" component="h3">
            İş kalemleri
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Bu rapor döneminde takip edilen çalışmalar
          </Typography>
        </Box>

        {!isLoading && !errorMessage && (
          <Chip
            label={`${workItems.length} kayıt`}
            size="small"
            variant="outlined"
          />
        )}
      </Stack>

      {isLoading && (
        <Paper
          variant="outlined"
          sx={{
            minHeight: 130,
            display: "grid",
            placeItems: "center",
            p: 2,
            boxShadow: "none",
          }}
        >
          <Stack spacing={1.5} sx={{ alignItems: "center" }}>
            <CircularProgress size={26} />

            <Typography variant="body2" color="text.secondary">
              İş kalemleri yükleniyor...
            </Typography>
          </Stack>
        </Paper>
      )}

      {!isLoading && errorMessage && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void loadWorkItems()}
            >
              Tekrar dene
            </Button>
          }
        >
          {errorMessage}
        </Alert>
      )}

      {!isLoading && !errorMessage && sortedWorkItems.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            textAlign: "center",
            boxShadow: "none",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Bu rapor için iş kalemi girilmemiş.
          </Typography>
        </Paper>
      )}

      {!isLoading && !errorMessage && sortedWorkItems.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md:
                sortedWorkItems.length === 1
                  ? "minmax(0, 1fr)"
                  : "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          {sortedWorkItems.map((workItem) => {
            const plannedDate = formatOptionalDate(workItem.plannedDate);

            const completedDate = formatOptionalDate(workItem.completedDate);

            return (
              <Paper
                key={workItem.id}
                variant="outlined"
                component="article"
                sx={{
                  p: {
                    xs: 1.75,
                    md: 2,
                  },
                  minWidth: 0,
                  borderColor:
                    workItem.status === "BLOCKED" ? "error.main" : "divider",
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 900,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {workItem.title}
                    </Typography>

                    <Chip
                      label={workItemStatusLabels[workItem.status]}
                      color={workItemStatusColors[workItem.status]}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  {workItem.description?.trim() && (
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {workItem.description}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        md: completedDate
                          ? "repeat(3, minmax(0, 1fr))"
                          : "repeat(2, minmax(0, 1fr))",
                      },
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Sorumlu
                      </Typography>

                      <Typography variant="body2">
                        {workItem.responsible?.trim() || "Belirtilmemiş"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Planlanan tarih
                      </Typography>

                      <Typography variant="body2">
                        {plannedDate || "Belirtilmemiş"}
                      </Typography>
                    </Box>

                    {completedDate && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Tamamlanma tarihi
                        </Typography>

                        <Typography variant="body2">{completedDate}</Typography>
                      </Box>
                    )}
                  </Box>

                  {workItem.note?.trim() && (
                    <Box
                      sx={{
                        pt: 1.25,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Not
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.25,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {workItem.note}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default DashboardWorkItemList;
