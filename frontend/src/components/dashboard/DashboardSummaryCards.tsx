import { Box, Paper, Stack, Typography } from "@mui/material";

import type { DashboardSummary } from "../../types/dashboard";

type DashboardSummaryCardsProps = {
  summary: DashboardSummary;
  weekStart: string;
};

type Metric = {
  label: string;
  value: number;
  valueColor: string;
  accentColor: string;
  highlighted: boolean;
};

const periodFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatPeriod(weekStart: string): string {
  if (!weekStart) {
    return "En güncel raporlar";
  }

  const startDate = new Date(`${weekStart}T00:00:00`);

  if (Number.isNaN(startDate.getTime())) {
    return "Seçili dönem";
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return `${periodFormatter.format(startDate)} – ${periodFormatter.format(
    endDate,
  )}`;
}

function DashboardSummaryCards({
  summary,
  weekStart,
}: DashboardSummaryCardsProps) {
  const missingReportCount = Math.max(
    0,
    summary.totalProjects - summary.projectsWithReports,
  );

  const metrics: Metric[] = [
    {
      label: "Aktif proje",
      value: summary.totalProjects,
      valueColor: "text.primary",
      accentColor: "primary.main",
      highlighted: false,
    },
    {
      label: "Rapor bekleyen",
      value: missingReportCount,
      valueColor: missingReportCount > 0 ? "warning.main" : "text.primary",
      accentColor: missingReportCount > 0 ? "warning.main" : "divider",
      highlighted: missingReportCount > 0,
    },
    {
      label: "Yüksek riskli",
      value: summary.highRiskProjects,
      valueColor: summary.highRiskProjects > 0 ? "error.main" : "text.primary",
      accentColor: summary.highRiskProjects > 0 ? "error.main" : "divider",
      highlighted: summary.highRiskProjects > 0,
    },
    {
      label: "Geciken",
      value: summary.delayedProjects,
      valueColor: summary.delayedProjects > 0 ? "warning.main" : "text.primary",
      accentColor: summary.delayedProjects > 0 ? "warning.main" : "divider",
      highlighted: summary.delayedProjects > 0,
    },
    {
      label: "Bloke",
      value: summary.blockedProjects,
      valueColor: summary.blockedProjects > 0 ? "error.main" : "text.primary",
      accentColor: summary.blockedProjects > 0 ? "error.main" : "divider",
      highlighted: summary.blockedProjects > 0,
    },
  ];

  return (
    <Box component="section" aria-labelledby="dashboard-summary-title">
      <Stack
        sx={{
          mb: 1.25,
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 0.75,
        }}
      >
        <Typography id="dashboard-summary-title" variant="h6" component="h2">
          Portföy özeti
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {formatPeriod(weekStart)}
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
          },
          gap: {
            xs: 1.25,
            md: 1.5,
          },
        }}
      >
        {metrics.map((metric) => (
          <Paper
            key={metric.label}
            variant="outlined"
            sx={{
              position: "relative",
              minWidth: 0,
              minHeight: 104,
              overflow: "hidden",
              p: {
                xs: 1.5,
                md: 1.75,
              },
              borderColor: metric.highlighted ? metric.accentColor : "divider",

              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: 3,
                backgroundColor: metric.accentColor,
              },
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 700,
              }}
            >
              {metric.label}
            </Typography>

            <Typography
              variant="h4"
              color={metric.valueColor}
              sx={{
                mt: 1,
                fontSize: {
                  xs: "1.65rem",
                  md: "1.85rem",
                },
                lineHeight: 1,
              }}
            >
              {metric.value}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default DashboardSummaryCards;
