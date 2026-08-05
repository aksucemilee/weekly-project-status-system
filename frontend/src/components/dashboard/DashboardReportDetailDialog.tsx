import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import type { WeeklyReport } from "../../types/weeklyReport";
import DashboardRiskIssueList from "./DashboardRiskIssueList";
import DashboardWorkItemList from "./DashboardWorkItemList";

import {
  formatReportDate,
  generalStatusColors,
  generalStatusLabels,
  riskLevelColors,
  riskLevelLabels,
  scheduleStatusColors,
  scheduleStatusLabels,
} from "../reports/reportPresentation";

type DashboardReportDetailDialogProps = {
  open: boolean;
  report: WeeklyReport | null;
  isLoading: boolean;
  errorMessage: string;
  onClose: () => void;
  onRetry: () => void;
};

type ProgressCardProps = {
  label: string;
  value: number;
  color: "primary" | "success";
};

function ProgressCard({ label, value, color }: ProgressCardProps) {
  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        minWidth: 0,
        backgroundColor: "action.hover",
        boxShadow: "none",
      }}
    >
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          mb: 1,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 700 }}
        >
          {label}
        </Typography>

        <Typography variant="h6">%{value}</Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={normalizedValue}
        color={color}
        sx={{
          height: 8,
          borderRadius: 999,

          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
          },
        }}
      />
    </Paper>
  );
}

type DetailSectionProps = {
  title: string;
  value: string | null;
  emptyText: string;
};

function DetailSection({ title, value, emptyText }: DetailSectionProps) {
  const hasValue = Boolean(value?.trim());

  return (
    <Paper
      variant="outlined"
      component="section"
      sx={{
        minHeight: 130,
        p: 2,
        boxShadow: "none",
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          mb: 0.75,
          fontWeight: 900,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        color={hasValue ? "text.primary" : "text.secondary"}
        sx={{
          lineHeight: 1.7,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        {hasValue ? value : emptyText}
      </Typography>
    </Paper>
  );
}

function DashboardReportDetailDialog({
  open,
  report,
  isLoading,
  errorMessage,
  onClose,
  onRetry,
}: DashboardReportDetailDialogProps) {
  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isSmallScreen}
      maxWidth="lg"
      scroll="paper"
      aria-labelledby="dashboard-report-detail-title"
      slotProps={{
        paper: {
          sx: {
            maxHeight: isSmallScreen ? "100%" : "90vh",
            borderRadius: isSmallScreen ? 0 : 3,
          },
        },
      }}
    >
      <DialogTitle
        id="dashboard-report-detail-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: {
            xs: 2,
            md: 3,
          },
          py: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" component="span">
            Haftalık rapor detayı
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 0.15,
            }}
          >
            Salt okunur CTO görünümü
          </Typography>
        </Box>

        <Tooltip title="Kapat">
          <IconButton
            aria-label="Rapor detayını kapat"
            onClick={onClose}
            edge="end"
          >
            <Box
              component="span"
              aria-hidden="true"
              sx={{
                fontSize: "1.7rem",
                lineHeight: 1,
                fontWeight: 300,
              }}
            >
              ×
            </Box>
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
        }}
      >
        {isLoading && (
          <Stack
            sx={{
              minHeight: 300,
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <CircularProgress size={34} />

            <Typography color="text.secondary">
              Rapor bilgileri yükleniyor...
            </Typography>
          </Stack>
        )}

        {!isLoading && errorMessage && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={onRetry}>
                Tekrar dene
              </Button>
            }
          >
            {errorMessage}
          </Alert>
        )}

        {!isLoading && !errorMessage && report && (
          <Stack spacing={2.5}>
            <Box>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  overflowWrap: "anywhere",
                }}
              >
                {report.projectName}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Rapor haftası: {formatReportDate(report.reportWeekStart)}
              </Typography>
            </Box>

            <Stack
              direction="row"
              useFlexGap
              sx={{
                flexWrap: "wrap",
                gap: 1,
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
              }}
            >
              <ProgressCard
                label="Hedeflenen ilerleme"
                value={report.targetProgress}
                color="primary"
              />

              <ProgressCard
                label="Gerçekleşen ilerleme"
                value={report.actualProgress}
                color="success"
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <DetailSection
                title="Tamamlanan çalışmalar"
                value={report.completedSummary}
                emptyText="Tamamlanan çalışma bilgisi girilmemiş."
              />

              <DetailSection
                title="Gelecek hafta planı"
                value={report.nextWeekPlan}
                emptyText="Gelecek hafta planı girilmemiş."
              />

              <DetailSection
                title="Engeller ve sorunlar"
                value={report.blockers}
                emptyText="Engel veya sorun belirtilmemiş."
              />

              <DetailSection
                title="Genel not"
                value={report.generalNote}
                emptyText="Genel not girilmemiş."
              />
            </Box>

            <Box
              sx={{
                pt: 0.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            />

            <DashboardWorkItemList weeklyReportId={report.id} />

            <Box
              sx={{
                pt: 0.5,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            />

            <DashboardRiskIssueList weeklyReportId={report.id} />
          </Stack>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: {
            xs: 2,
            md: 3,
          },
          py: 1.5,
        }}
      >
        <Button variant="contained" onClick={onClose}>
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DashboardReportDetailDialog;
