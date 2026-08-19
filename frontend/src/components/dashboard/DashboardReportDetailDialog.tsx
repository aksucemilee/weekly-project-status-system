import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";

import type { WeeklyReport } from "../../types/weeklyReport";
import {
  formatReportDate,
  generalStatusColors,
  generalStatusLabels,
  riskLevelColors,
  riskLevelLabels,
  scheduleStatusColors,
  scheduleStatusLabels,
} from "../reports/reportPresentation";
import DashboardRiskIssueList from "./DashboardRiskIssueList";
import DashboardWorkItemList from "./DashboardWorkItemList";

type DashboardReportDetailDialogProps = {
  open: boolean;
  report: WeeklyReport | null;
  isLoading: boolean;
  errorMessage: string;
  onClose: () => void;
  onRetry: () => void;
};

type ReportDetailTab = 0 | 1 | 2;

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
        minWidth: 0,
        p: {
          xs: 1.75,
          md: 2,
        },
        backgroundColor: "action.hover",
      }}
    >
      <Stack
        direction="row"
        sx={{
          mb: 1,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>

        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          %{value}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={normalizedValue}
        color={color}
        sx={{
          height: 7,
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
        minWidth: 0,
        minHeight: 116,
        p: {
          xs: 1.75,
          md: 2,
        },
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          mb: 0.75,
          fontWeight: 800,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        color={hasValue ? "text.primary" : "text.secondary"}
        sx={{
          lineHeight: 1.65,
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

  const [activeTab, setActiveTab] = useState<ReportDetailTab>(0);

  useEffect(() => {
    if (open) {
      setActiveTab(0);
    }
  }, [open, report?.id]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={isSmallScreen}
      maxWidth={false}
      scroll="paper"
      aria-labelledby="dashboard-report-detail-title"
      slotProps={{
        paper: {
          sx: {
            width: isSmallScreen ? "100%" : "min(1180px, calc(100vw - 48px))",
            maxWidth: "none",
            maxHeight: isSmallScreen ? "100%" : "88vh",
            borderRadius: isSmallScreen ? 0 : 3,
          },
        },
      }}
    >
      <DialogTitle
        id="dashboard-report-detail-title"
        sx={{
          px: {
            xs: 2,
            md: 3,
          },
          py: 2,
          borderBottom: report ? 0 : "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              component="span"
              sx={{
                overflowWrap: "anywhere",
              }}
            >
              {report?.projectName ?? "Haftalık rapor detayı"}
            </Typography>

            {report ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.35 }}
              >
                {formatReportDate(report.reportWeekStart)} haftası
              </Typography>
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.35 }}
              >
                Salt okunur CTO görünümü
              </Typography>
            )}
          </Box>

          <Tooltip title="Kapat">
            <IconButton
              type="button"
              aria-label="Rapor detayını kapat"
              onClick={onClose}
              edge="end"
              sx={{
                flexShrink: 0,
              }}
            >
              <Box
                component="span"
                aria-hidden="true"
                sx={{
                  fontSize: "1.7rem",
                  fontWeight: 300,
                  lineHeight: 1,
                }}
              >
                ×
              </Box>
            </IconButton>
          </Tooltip>
        </Stack>

        {report ? (
          <Stack
            direction="row"
            useFlexGap
            sx={{
              mt: 1.5,
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
        ) : null}
      </DialogTitle>

      {!isLoading && !errorMessage && report ? (
        <Tabs
          value={activeTab}
          onChange={(_, value: ReportDetailTab) => setActiveTab(value)}
          variant={isSmallScreen ? "scrollable" : "fullWidth"}
          scrollButtons={isSmallScreen ? "auto" : false}
          aria-label="Haftalık rapor detay bölümleri"
          sx={{
            px: {
              xs: 1,
              md: 2,
            },
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tab
            id="report-detail-tab-overview"
            aria-controls="report-detail-panel-overview"
            label="Genel Bakış"
          />

          <Tab
            id="report-detail-tab-work-items"
            aria-controls="report-detail-panel-work-items"
            label="İş Kalemleri"
          />

          <Tab
            id="report-detail-tab-risks"
            aria-controls="report-detail-panel-risks"
            label="Risk ve Engeller"
          />
        </Tabs>
      ) : null}

      <DialogContent
        sx={{
          p: {
            xs: 2,
            md: 3,
          },
        }}
      >
        {isLoading ? (
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
        ) : null}

        {!isLoading && errorMessage ? (
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
        ) : null}

        {!isLoading && !errorMessage && report && activeTab === 0 ? (
          <Stack
            id="report-detail-panel-overview"
            role="tabpanel"
            aria-labelledby="report-detail-tab-overview"
            spacing={2}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1.5,
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
                gap: 1.5,
              }}
            >
              <DetailSection
                title="Bu hafta yapılanlar"
                value={report.completedSummary}
                emptyText="Tamamlanan çalışma bilgisi girilmemiş."
              />

              <DetailSection
                title="Gelecek hafta planı"
                value={report.nextWeekPlan}
                emptyText="Gelecek hafta planı girilmemiş."
              />

              <DetailSection
                title="Engeller"
                value={report.blockers}
                emptyText="Engel veya sorun belirtilmemiş."
              />

              <DetailSection
                title="Genel not"
                value={report.generalNote}
                emptyText="Genel not girilmemiş."
              />
            </Box>
          </Stack>
        ) : null}

        {!isLoading && !errorMessage && report && activeTab === 1 ? (
          <Box
            id="report-detail-panel-work-items"
            role="tabpanel"
            aria-labelledby="report-detail-tab-work-items"
          >
            <DashboardWorkItemList weeklyReportId={report.id} />
          </Box>
        ) : null}

        {!isLoading && !errorMessage && report && activeTab === 2 ? (
          <Box
            id="report-detail-panel-risks"
            role="tabpanel"
            aria-labelledby="report-detail-tab-risks"
          >
            <DashboardRiskIssueList weeklyReportId={report.id} />
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default DashboardReportDetailDialog;
