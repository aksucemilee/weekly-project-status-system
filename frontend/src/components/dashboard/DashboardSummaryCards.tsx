import { Paper, Typography } from "@mui/material";

import type { DashboardSummary } from "../../types/dashboard";
import ResponsiveCardGrid from "../common/ResponsiveCardGrid";

type DashboardSummaryCardsProps = {
  summary: DashboardSummary;
};

function DashboardSummaryCards({ summary }: DashboardSummaryCardsProps) {
  const metrics = [
    {
      label: "Toplam proje",
      value: summary.totalProjects,
      description: "Dashboard kapsamındaki aktif projeler",
      valueColor: "text.primary",
    },
    {
      label: "Raporu bulunan",
      value: summary.projectsWithReports,
      description: "En az bir haftalık raporu bulunan projeler",
      valueColor: "primary.main",
    },
    {
      label: "Yüksek riskli",
      value: summary.highRiskProjects,
      description: "Son raporu yüksek risk seviyesinde olan projeler",
      valueColor: "error.main",
    },
    {
      label: "Geciken",
      value: summary.delayedProjects,
      description: "Son raporunda takvim gecikmesi bulunan projeler",
      valueColor: "warning.main",
    },
    {
      label: "Bloke",
      value: summary.blockedProjects,
      description: "Proje durumu bloke olan projeler",
      valueColor: "error.main",
    },
  ];

  return (
    <ResponsiveCardGrid variant="metrics">
      {metrics.map((metric) => (
        <Paper
          key={metric.label}
          sx={{
            height: "100%",
            minWidth: 0,
            p: {
              xs: 2,
              md: 2.25,
            },
            boxShadow: "none",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 800 }}
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
            sx={{ lineHeight: 1.6 }}
          >
            {metric.description}
          </Typography>
        </Paper>
      ))}
    </ResponsiveCardGrid>
  );
}

export default DashboardSummaryCards;
