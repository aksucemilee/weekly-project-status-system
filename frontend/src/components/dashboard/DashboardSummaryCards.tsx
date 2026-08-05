import { Box, Paper, Stack, Typography } from "@mui/material";

import type { DashboardSummary } from "../../types/dashboard";

type DashboardSummaryCardsProps = {
  summary: DashboardSummary;
  weekStart: string;
};

type Metric = {
  label: string;
  value: number;
  description: string;
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
    return "Projelerin en güncel raporları";
  }

  const startDate = new Date(`${weekStart}T00:00:00`);

  if (Number.isNaN(startDate.getTime())) {
    return "Seçili rapor dönemi";
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  return `${periodFormatter.format(
    startDate,
  )} – ${periodFormatter.format(endDate)}`;
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
      description: "Seçili filtrelerle eşleşen aktif projeler",
      valueColor: "text.primary",
      accentColor: "primary.main",
      highlighted: false,
    },
    {
      label: "Rapor bekleyen",
      value: missingReportCount,
      description: "Seçili dönemde henüz raporu bulunmayan projeler",
      valueColor: missingReportCount > 0 ? "warning.main" : "text.primary",
      accentColor: missingReportCount > 0 ? "warning.main" : "divider",
      highlighted: missingReportCount > 0,
    },
    {
      label: "Yüksek riskli",
      value: summary.highRiskProjects,
      description: "Yüksek risk seviyesinde raporlanan projeler",
      valueColor: summary.highRiskProjects > 0 ? "error.main" : "text.primary",
      accentColor: summary.highRiskProjects > 0 ? "error.main" : "divider",
      highlighted: summary.highRiskProjects > 0,
    },
    {
      label: "Geciken",
      value: summary.delayedProjects,
      description: "Takvim durumu gecikmiş olan projeler",
      valueColor: summary.delayedProjects > 0 ? "warning.main" : "text.primary",
      accentColor: summary.delayedProjects > 0 ? "warning.main" : "divider",
      highlighted: summary.delayedProjects > 0,
    },
    {
      label: "Bloke",
      value: summary.blockedProjects,
      description: "Proje durumu bloke olarak işaretlenen projeler",
      valueColor: summary.blockedProjects > 0 ? "error.main" : "text.primary",
      accentColor: summary.blockedProjects > 0 ? "error.main" : "divider",
      highlighted: summary.blockedProjects > 0,
    },
  ];

  return (
    <Box component="section" aria-labelledby="dashboard-summary-title">
      <Stack
        sx={{
          mb: 1.5,
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "flex-start",
            sm: "flex-end",
          },
          justifyContent: "space-between",
          gap: 0.75,
        }}
      >
        <Box>
          <Typography id="dashboard-summary-title" variant="h5" component="h2">
            Portföy özeti
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            Seçili dönemde müdahale veya takip gerektiren proje durumları
          </Typography>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 700 }}
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
            lg: "repeat(3, minmax(0, 1fr))",
            xl: "repeat(5, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {metrics.map((metric) => (
          <Paper
            key={metric.label}
            variant="outlined"
            sx={{
              position: "relative",
              minWidth: 0,
              height: "100%",
              overflow: "hidden",
              p: {
                xs: 2,
                md: 2.25,
              },
              borderColor: metric.highlighted ? metric.accentColor : "divider",
              boxShadow: "none",

              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: metric.accentColor,
              },
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 800,
              }}
            >
              {metric.label}
            </Typography>

            <Typography
              variant="h4"
              color={metric.valueColor}
              sx={{
                mt: 0.5,
                mb: 0.75,
                fontSize: {
                  xs: "1.65rem",
                  md: "2rem",
                },
              }}
            >
              {metric.value}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.55,
              }}
            >
              {metric.description}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default DashboardSummaryCards;
