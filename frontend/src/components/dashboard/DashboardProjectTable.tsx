import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { DashboardProjectSummary } from "../../types/dashboard";
import {
  projectStatusColors,
  projectStatusLabels,
} from "../projects/projectPresentation";
import {
  generalStatusColors,
  generalStatusLabels,
  riskLevelColors,
  riskLevelLabels,
  scheduleStatusColors,
  scheduleStatusLabels,
} from "../reports/reportPresentation";
import {
  dashboardHealthColors,
  dashboardHealthLabels,
  formatDashboardDate,
  getDashboardHealth,
} from "./dashboardPresentation";

type DashboardProjectTableProps = {
  projects: DashboardProjectSummary[];
};

type ProgressValueProps = {
  label: string;
  value: number | null;
  color?: "primary" | "success";
};

function ProgressValue({
  label,
  value,
  color = "primary",
}: ProgressValueProps) {
  if (value === null) {
    return (
      <Typography variant="body2" color="text.secondary">
        —
      </Typography>
    );
  }

  const normalizedValue = Math.min(100, Math.max(0, value));

  return (
    <Box sx={{ minWidth: 135 }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          gap: 1,
          mb: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        <Typography variant="caption" sx={{ fontWeight: 900 }}>
          %{value}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={normalizedValue}
        color={color}
        sx={{
          height: 6,
          borderRadius: 999,

          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
          },
        }}
      />
    </Box>
  );
}

function DashboardProjectTable({ projects }: DashboardProjectTableProps) {
  return (
    <Paper
      component="section"
      sx={{
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" component="h2">
          Proje sağlık görünümü
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Projelerin son haftalık raporları üzerinden ilerleme, risk, takvim ve
          aktif iş bilgilerini karşılaştırın.
        </Typography>
      </Box>

      <TableContainer sx={{ overflowX: "auto" }}>
        <Table
          aria-label="CTO proje sağlık tablosu"
          sx={{
            minWidth: 1120,
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "action.hover" }}>
              <TableCell>Sağlık</TableCell>
              <TableCell>Proje</TableCell>
              <TableCell>Son rapor</TableCell>
              <TableCell>İlerleme</TableCell>
              <TableCell>Genel durum</TableCell>
              <TableCell>Takvim</TableCell>
              <TableCell>Risk</TableCell>
              <TableCell align="center">Aktif iş</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {projects.map((project) => {
              const health = getDashboardHealth(project);

              return (
                <TableRow
                  key={project.projectId}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": {
                      borderBottom: 0,
                    },
                  }}
                >
                  <TableCell>
                    <Chip
                      label={dashboardHealthLabels[health]}
                      color={dashboardHealthColors[health]}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell component="th" scope="row">
                    <Stack spacing={0.75} sx={{ minWidth: 180 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 900,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {project.projectName}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {project.customerName}
                      </Typography>

                      <Chip
                        label={projectStatusLabels[project.projectStatus]}
                        color={projectStatusColors[project.projectStatus]}
                        size="small"
                        variant="outlined"
                        sx={{
                          alignSelf: "flex-start",
                        }}
                      />
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {formatDashboardDate(project.reportWeekStart)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {project.latestReportId === null ? (
                      <Typography variant="body2" color="text.secondary">
                        Rapor bulunmuyor
                      </Typography>
                    ) : (
                      <Stack spacing={1.25}>
                        <ProgressValue
                          label="Hedef"
                          value={project.targetProgress}
                        />

                        <ProgressValue
                          label="Gerçekleşen"
                          value={project.actualProgress}
                          color="success"
                        />
                      </Stack>
                    )}
                  </TableCell>

                  <TableCell>
                    {project.generalStatus ? (
                      <Chip
                        label={generalStatusLabels[project.generalStatus]}
                        color={generalStatusColors[project.generalStatus]}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    {project.scheduleStatus ? (
                      <Chip
                        label={scheduleStatusLabels[project.scheduleStatus]}
                        color={scheduleStatusColors[project.scheduleStatus]}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    {project.riskLevel ? (
                      <Chip
                        label={riskLevelLabels[project.riskLevel]}
                        color={riskLevelColors[project.riskLevel]}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      label={project.activeWorkItemCount}
                      color={
                        project.activeWorkItemCount > 0 ? "primary" : "default"
                      }
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default DashboardProjectTable;
