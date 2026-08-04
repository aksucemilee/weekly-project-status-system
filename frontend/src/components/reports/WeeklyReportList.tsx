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
  onManageWorkItems: (report: WeeklyReport) => void;
};

type ProgressSummaryProps = {
  label: string;
  value: number;
};

function ProgressSummary({ label, value }: ProgressSummaryProps) {
  const isValueValid = Number.isFinite(value) && value >= 0 && value <= 100;

  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>

        <Typography
          variant="body2"
          color={isValueValid ? "text.primary" : "error.main"}
          sx={{ fontWeight: 800 }}
        >
          {isValueValid ? `%${value}` : `Geçersiz değer: %${value}`}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={normalizedValue}
        color={isValueValid ? "primary" : "error"}
        sx={{
          height: 8,
          borderRadius: 999,
          backgroundColor: "rgba(37, 99, 235, 0.08)",

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
  onManageWorkItems,
}: WeeklyReportListProps) {
  if (isLoading) {
    return (
      <Paper
        sx={{
          minHeight: 240,
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
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box>
          <Typography variant="h5" component="h2">
            Rapor Listesi
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Seçilen projeye ait haftalık durum raporları
          </Typography>
        </Box>

        <Chip
          label={`${reports.length} rapor`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Stack spacing={2.5}>
        {reports.map((report) => (
          <Paper
            key={report.id}
            component="article"
            sx={{
              p: {
                xs: 2.5,
                md: 3,
              },
              transition:
                "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",

              "&:hover": {
                transform: "translateY(-2px)",
                borderColor: "rgba(37, 99, 235, 0.22)",
                boxShadow: "0 14px 32px rgba(15, 23, 42, 0.08)",
              },
            }}
          >
            <Stack spacing={3}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: {
                    xs: "flex-start",
                    md: "center",
                  },
                  justifyContent: "space-between",
                  flexDirection: {
                    xs: "column",
                    md: "row",
                  },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" component="h3">
                    {report.projectName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Hafta başlangıcı: {formatReportDate(report.reportWeekStart)}
                  </Typography>
                </Box>

                <Stack
                  spacing={1}
                  useFlexGap
                  sx={{
                    flexDirection: "row",
                    flexWrap: "wrap",
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
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 3,
                  p: 2.5,
                  borderRadius: 2.5,
                  backgroundColor: "rgba(15, 23, 42, 0.025)",
                }}
              >
                <ProgressSummary
                  label="Hedeflenen ilerleme"
                  value={report.targetProgress}
                />

                <ProgressSummary
                  label="Gerçekleşen ilerleme"
                  value={report.actualProgress}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    lg: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 0.75,
                      fontWeight: 800,
                    }}
                  >
                    Yapılanlar
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {report.completedSummary || "Bilgi girilmedi."}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 0.75,
                      fontWeight: 800,
                    }}
                  >
                    Gelecek hafta yapılacaklar
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {report.nextWeekPlan || "Bilgi girilmedi."}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 0.75,
                      fontWeight: 800,
                    }}
                  >
                    Engeller
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {report.blockers || "Engel belirtilmedi."}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 0.75,
                      fontWeight: 800,
                    }}
                  >
                    Genel not
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {report.generalNote || "Not girilmedi."}
                  </Typography>
                </Box>
              </Box>
              {/* BURAYA EKLENECEK */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: {
                    xs: "stretch",
                    sm: "flex-end",
                  },
                }}
              >
                <Button
                  variant={
                    selectedReportId === report.id ? "contained" : "outlined"
                  }
                  onClick={() => onManageWorkItems(report)}
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "auto",
                    },
                  }}
                >
                  {selectedReportId === report.id
                    ? "Rapor Detayları Seçildi"
                    : "Rapor Detaylarını Yönet"}
                </Button>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}

export default WeeklyReportList;
