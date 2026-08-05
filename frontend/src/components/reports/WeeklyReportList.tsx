import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ResponsiveCardGrid from "../common/ResponsiveCardGrid";
import type { WeeklyReport } from "../../types/weeklyReport";
import EmptyState from "../feedback/EmptyState";
import {
  formatReportDate,
  generalStatusColors,
  generalStatusLabels,
  riskLevelColors,
  riskLevelLabels,
  scheduleStatusColors,
  scheduleStatusLabels,
} from "./reportPresentation";

type WeeklyReportListProps = {
  reports: WeeklyReport[];
  isLoading: boolean;
  errorMessage: string;
  selectedReportId: number | null;
  onManageReportDetails: (report: WeeklyReport) => void;
};

type ProgressSummaryProps = {
  label: string;
  value: number;
};

function ProgressSummary({ label, value }: ProgressSummaryProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          mb: 0.75,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        <Typography variant="caption" sx={{ fontWeight: 900 }}>
          %{value}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={normalizedValue}
        sx={{
          height: 7,
          borderRadius: 999,

          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
          },
        }}
      />
    </Box>
  );
}

function WeeklyReportList({
  reports,
  isLoading,
  errorMessage,
  selectedReportId,
  onManageReportDetails,
}: WeeklyReportListProps) {
  if (isLoading) {
    return (
      <Paper
        sx={{
          minHeight: 220,
          display: "grid",
          placeItems: "center",
          p: 3,
        }}
      >
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <CircularProgress size={30} />

          <Typography color="text.secondary">
            Haftalık raporlar yükleniyor...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (errorMessage) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{errorMessage}</Alert>
      </Paper>
    );
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        label="Rapor bulunamadı"
        title="Bu proje için henüz rapor yok"
        description="Seçilen proje için ilk haftalık rapor oluşturulduğunda rapor bilgileri bu alanda görüntülenecektir."
      />
    );
  }

  return (
    <Box component="section">
      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h5" component="h2">
            Haftalık raporlar
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.25 }}>
            Bir raporu seçerek genel görünümünü, iş kalemlerini ve risklerini
            inceleyin.
          </Typography>
        </Box>

        <Chip
          label={`${reports.length} rapor`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <ResponsiveCardGrid variant="standard">
        {reports.map((report) => {
          const isSelected = selectedReportId === report.id;

          return (
            <Paper
              key={report.id}
              component="article"
              sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: 0,
                minHeight: {
                  xs: "auto",
                  md: 310,
                },
                p: {
                  xs: 2,
                  md: 2.25,
                },
                borderColor: isSelected ? "primary.main" : "divider",
                boxShadow: isSelected ? "0 0 0 1px" : undefined,
                transition:
                  "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",

                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: "primary.main",
                },
              }}
            >
              <Stack spacing={2} sx={{ height: "100%" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="overline"
                    color="primary.main"
                    sx={{ fontWeight: 900 }}
                  >
                    {formatReportDate(report.reportWeekStart)}
                  </Typography>

                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{ overflowWrap: "anywhere" }}
                  >
                    {report.projectName}
                  </Typography>
                </Box>

                <Stack
                  useFlexGap
                  sx={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 0.75,
                  }}
                >
                  <Chip
                    label={generalStatusLabels[report.generalStatus]}
                    color={generalStatusColors[report.generalStatus]}
                    size="small"
                    variant="outlined"
                  />

                  <Chip
                    label={scheduleStatusLabels[report.scheduleStatus]}
                    color={scheduleStatusColors[report.scheduleStatus]}
                    size="small"
                    variant="outlined"
                  />

                  <Chip
                    label={`Risk: ${riskLevelLabels[report.riskLevel]}`}
                    color={riskLevelColors[report.riskLevel]}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                    p: 1.75,
                    borderRadius: 2.5,
                    backgroundColor: "action.hover",
                  }}
                >
                  <ProgressSummary
                    label="Hedef"
                    value={report.targetProgress}
                  />

                  <ProgressSummary
                    label="Gerçekleşen"
                    value={report.actualProgress}
                  />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 0.5,
                      fontWeight: 800,
                    }}
                  >
                    Bu hafta yapılanlar
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.65,
                      overflowWrap: "anywhere",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 3,
                      overflow: "hidden",
                    }}
                  >
                    {report.completedSummary || "Bilgi girilmedi."}
                  </Typography>
                </Box>

                <Button
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => onManageReportDetails(report)}
                  fullWidth
                >
                  {isSelected ? "Detayları kapat" : "Raporu incele"}
                </Button>
              </Stack>
            </Paper>
          );
        })}
      </ResponsiveCardGrid>
    </Box>
  );
}

export default WeeklyReportList;
