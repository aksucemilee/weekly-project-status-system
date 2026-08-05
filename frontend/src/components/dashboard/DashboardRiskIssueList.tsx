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

import { getRiskIssuesByWeeklyReport } from "../../services/riskIssueService";
import type {
  RiskIssue,
  RiskIssueStatus,
  RiskIssueType,
} from "../../types/riskIssue";
import type { RiskLevel } from "../../types/weeklyReport";
import {
  riskLevelColors,
  riskLevelLabels,
} from "../reports/reportPresentation";

type DashboardRiskIssueListProps = {
  weeklyReportId: number;
};

type StatusColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "info";

const riskIssueTypeLabels: Record<RiskIssueType, string> = {
  RISK: "Risk",
  BLOCKER: "Engel",
};

const riskIssueTypeColors: Record<RiskIssueType, StatusColor> = {
  RISK: "warning",
  BLOCKER: "error",
};

const riskIssueStatusLabels: Record<RiskIssueStatus, string> = {
  OPEN: "Açık",
  ACTION_IN_PROGRESS: "Aksiyon Devam Ediyor",
  RESOLVED: "Çözüldü",
};

const riskIssueStatusColors: Record<RiskIssueStatus, StatusColor> = {
  OPEN: "error",
  ACTION_IN_PROGRESS: "warning",
  RESOLVED: "success",
};

const typePriority: Record<RiskIssueType, number> = {
  BLOCKER: 0,
  RISK: 1,
};

const statusPriority: Record<RiskIssueStatus, number> = {
  OPEN: 0,
  ACTION_IN_PROGRESS: 1,
  RESOLVED: 2,
};

const riskPriority: Record<RiskLevel, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
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

function DashboardRiskIssueList({
  weeklyReportId,
}: DashboardRiskIssueListProps) {
  const [riskIssues, setRiskIssues] = useState<RiskIssue[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadRiskIssues = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const items = await getRiskIssuesByWeeklyReport(weeklyReportId);

      setRiskIssues(items);
    } catch {
      setRiskIssues([]);
      setErrorMessage("Risk ve engel kayıtları yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [weeklyReportId]);

  useEffect(() => {
    void loadRiskIssues();
  }, [loadRiskIssues]);

  const sortedRiskIssues = [...riskIssues].sort((first, second) => {
    const typeDifference = typePriority[first.type] - typePriority[second.type];

    if (typeDifference !== 0) {
      return typeDifference;
    }

    const statusDifference =
      statusPriority[first.status] - statusPriority[second.status];

    if (statusDifference !== 0) {
      return statusDifference;
    }

    return riskPriority[first.riskLevel] - riskPriority[second.riskLevel];
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
            Riskler ve engeller
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Takip ve aksiyon gerektiren proje kayıtları
          </Typography>
        </Box>

        {!isLoading && !errorMessage && (
          <Chip
            label={`${riskIssues.length} kayıt`}
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
              Risk ve engeller yükleniyor...
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
              onClick={() => void loadRiskIssues()}
            >
              Tekrar dene
            </Button>
          }
        >
          {errorMessage}
        </Alert>
      )}

      {!isLoading && !errorMessage && sortedRiskIssues.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            textAlign: "center",
            boxShadow: "none",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Bu rapor için risk veya engel kaydı bulunmuyor.
          </Typography>
        </Paper>
      )}

      {!isLoading && !errorMessage && sortedRiskIssues.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          {sortedRiskIssues.map((riskIssue) => {
            const targetDate = formatOptionalDate(riskIssue.targetDate);

            return (
              <Paper
                key={riskIssue.id}
                variant="outlined"
                component="article"
                sx={{
                  p: 2,
                  minWidth: 0,
                  boxShadow: "none",
                  borderColor:
                    riskIssue.type === "BLOCKER" &&
                    riskIssue.status !== "RESOLVED"
                      ? "error.main"
                      : "divider",
                }}
              >
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    useFlexGap
                    sx={{
                      flexWrap: "wrap",
                      gap: 0.75,
                    }}
                  >
                    <Chip
                      label={riskIssueTypeLabels[riskIssue.type]}
                      color={riskIssueTypeColors[riskIssue.type]}
                      size="small"
                      variant="outlined"
                    />

                    <Chip
                      label={riskLevelLabels[riskIssue.riskLevel]}
                      color={riskLevelColors[riskIssue.riskLevel]}
                      size="small"
                      variant="outlined"
                    />

                    <Chip
                      label={riskIssueStatusLabels[riskIssue.status]}
                      color={riskIssueStatusColors[riskIssue.status]}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 900,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {riskIssue.title}
                  </Typography>

                  {riskIssue.description?.trim() && (
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {riskIssue.description}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                      },
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Sorumlu
                      </Typography>

                      <Typography variant="body2">
                        {riskIssue.responsible?.trim() || "Belirtilmemiş"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Hedef tarih
                      </Typography>

                      <Typography variant="body2">
                        {targetDate || "Belirtilmemiş"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      pt: 1.25,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Aksiyon planı
                    </Typography>

                    <Typography
                      variant="body2"
                      color={
                        riskIssue.actionPlan?.trim()
                          ? "text.primary"
                          : "text.secondary"
                      }
                      sx={{
                        mt: 0.25,
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {riskIssue.actionPlan?.trim() ||
                        "Aksiyon planı girilmemiş."}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default DashboardRiskIssueList;
