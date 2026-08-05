import {
  Box,
  Button,
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
  type DashboardHealth,
} from "./dashboardPresentation";

type DashboardProjectTableProps = {
  projects: DashboardProjectSummary[];
  onViewReport: (project: DashboardProjectSummary) => void;
};

type ProgressOverviewProps = {
  targetProgress: number | null;
  actualProgress: number | null;
};

const healthPriority: Record<DashboardHealth, number> = {
  CRITICAL: 0,
  ATTENTION: 1,
  NO_REPORT: 2,
  HEALTHY: 3,
};

function getProgressDifferenceText(
  targetProgress: number,
  actualProgress: number,
): string {
  const difference = actualProgress - targetProgress;

  if (difference === 0) {
    return "Hedefle aynı seviyede";
  }

  if (difference > 0) {
    return `Hedefin ${difference} puan üzerinde`;
  }

  return `Hedefin ${Math.abs(difference)} puan gerisinde`;
}

function ProgressOverview({
  targetProgress,
  actualProgress,
}: ProgressOverviewProps) {
  if (targetProgress === null || actualProgress === null) {
    return (
      <Typography variant="body2" color="text.secondary">
        İlerleme bilgisi bulunmuyor
      </Typography>
    );
  }

  const normalizedTarget = Math.min(100, Math.max(0, targetProgress));

  const normalizedActual = Math.min(100, Math.max(0, actualProgress));

  const difference = actualProgress - targetProgress;

  return (
    <Stack spacing={1.25} sx={{ minWidth: 190 }}>
      <Box>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            mb: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Hedef
          </Typography>

          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            %{targetProgress}
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={normalizedTarget}
          sx={{
            height: 6,
            borderRadius: 999,

            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
            },
          }}
        />
      </Box>

      <Box>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            mb: 0.5,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Gerçekleşen
          </Typography>

          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            %{actualProgress}
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={normalizedActual}
          color="success"
          sx={{
            height: 6,
            borderRadius: 999,

            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
            },
          }}
        />
      </Box>

      <Typography
        variant="caption"
        color={
          difference < 0
            ? "warning.main"
            : difference > 0
              ? "success.main"
              : "text.secondary"
        }
        sx={{ fontWeight: 700 }}
      >
        {getProgressDifferenceText(targetProgress, actualProgress)}
      </Typography>
    </Stack>
  );
}

function StatusOverview({ project }: { project: DashboardProjectSummary }) {
  if (project.generalStatus === null && project.scheduleStatus === null) {
    return (
      <Typography variant="body2" color="text.secondary">
        Durum bilgisi bulunmuyor
      </Typography>
    );
  }

  return (
    <Stack
      direction="row"
      useFlexGap
      sx={{
        flexWrap: "wrap",
        gap: 0.75,
        minWidth: 160,
      }}
    >
      {project.generalStatus && (
        <Chip
          label={generalStatusLabels[project.generalStatus]}
          color={generalStatusColors[project.generalStatus]}
          size="small"
          variant="outlined"
        />
      )}

      {project.scheduleStatus && (
        <Chip
          label={scheduleStatusLabels[project.scheduleStatus]}
          color={scheduleStatusColors[project.scheduleStatus]}
          size="small"
          variant="outlined"
        />
      )}
    </Stack>
  );
}

function RiskAndWorkOverview({
  project,
}: {
  project: DashboardProjectSummary;
}) {
  return (
    <Stack spacing={1} sx={{ minWidth: 125 }}>
      {project.riskLevel ? (
        <Chip
          label={`Risk: ${riskLevelLabels[project.riskLevel]}`}
          color={riskLevelColors[project.riskLevel]}
          size="small"
          variant="outlined"
          sx={{ alignSelf: "flex-start" }}
        />
      ) : (
        <Typography variant="body2" color="text.secondary">
          Risk bilgisi yok
        </Typography>
      )}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 700 }}
      >
        {project.activeWorkItemCount === 0
          ? "Aktif iş bulunmuyor"
          : `${project.activeWorkItemCount} aktif iş`}
      </Typography>
    </Stack>
  );
}

function ReportAction({
  project,
  onViewReport,
}: {
  project: DashboardProjectSummary;
  onViewReport: (project: DashboardProjectSummary) => void;
}) {
  if (project.latestReportId === null) {
    return (
      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          Rapor bekleniyor
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Bu proje için rapor bulunmuyor.
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1} sx={{ minWidth: 125 }}>
      <Typography variant="body2">
        {formatDashboardDate(project.reportWeekStart)}
      </Typography>

      <Button
        variant="outlined"
        size="small"
        onClick={() => onViewReport(project)}
        aria-label={`${project.projectName} rapor detayını aç`}
        sx={{
          alignSelf: "flex-start",
          whiteSpace: "nowrap",
        }}
      >
        Rapor detayı
      </Button>
    </Stack>
  );
}

function DashboardProjectTable({
  projects,
  onViewReport,
}: DashboardProjectTableProps) {
  const sortedProjects = [...projects].sort((first, second) => {
    const firstHealth = getDashboardHealth(first);
    const secondHealth = getDashboardHealth(second);

    const healthDifference =
      healthPriority[firstHealth] - healthPriority[secondHealth];

    if (healthDifference !== 0) {
      return healthDifference;
    }

    return first.projectName.localeCompare(second.projectName, "tr");
  });

  return (
    <Paper
      component="section"
      sx={{
        overflow: "hidden",
      }}
    >
      <Stack
        sx={{
          p: {
            xs: 2,
            md: 2.5,
          },
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h5" component="h2">
            Proje sağlık görünümü
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Öncelikli projeler üstte gösterilir. İlerleme, durum, risk ve rapor
            bilgilerini karşılaştırın.
          </Typography>
        </Box>

        <Chip
          label={`${projects.length} proje`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      {/* Masaüstü ve tablet tablo görünümü */}
      <TableContainer
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
          overflowX: "auto",
        }}
      >
        <Table
          aria-label="CTO proje sağlık görünümü"
          sx={{
            minWidth: 980,

            "& .MuiTableCell-root": {
              verticalAlign: "middle",
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "action.hover" }}>
              <TableCell sx={{ minWidth: 220 }}>Proje</TableCell>

              <TableCell sx={{ minWidth: 105 }}>Sağlık</TableCell>

              <TableCell sx={{ minWidth: 220 }}>İlerleme</TableCell>

              <TableCell sx={{ minWidth: 175 }}>Durum ve takvim</TableCell>

              <TableCell sx={{ minWidth: 150 }}>Risk ve işler</TableCell>

              <TableCell sx={{ minWidth: 145 }}>Rapor</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedProjects.map((project) => {
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
                  <TableCell component="th" scope="row">
                    <Stack spacing={0.75}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 900,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {project.projectName}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {project.customerName}
                      </Typography>

                      <Chip
                        label={projectStatusLabels[project.projectStatus]}
                        color={projectStatusColors[project.projectStatus]}
                        size="small"
                        variant="outlined"
                        sx={{ alignSelf: "flex-start" }}
                      />
                    </Stack>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={dashboardHealthLabels[health]}
                      color={dashboardHealthColors[health]}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    {project.latestReportId === null ? (
                      <Typography variant="body2" color="text.secondary">
                        Rapor bulunmadığı için ilerleme gösterilemiyor.
                      </Typography>
                    ) : (
                      <ProgressOverview
                        targetProgress={project.targetProgress}
                        actualProgress={project.actualProgress}
                      />
                    )}
                  </TableCell>

                  <TableCell>
                    <StatusOverview project={project} />
                  </TableCell>

                  <TableCell>
                    <RiskAndWorkOverview project={project} />
                  </TableCell>

                  <TableCell>
                    <ReportAction
                      project={project}
                      onViewReport={onViewReport}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobil görünüm */}
      <Box
        sx={{
          display: {
            xs: "grid",
            md: "none",
          },
          gap: 1.5,
          p: 2,
        }}
      >
        {sortedProjects.map((project) => {
          const health = getDashboardHealth(project);

          return (
            <Paper
              key={project.projectId}
              variant="outlined"
              component="article"
              sx={{
                p: 2,
                boxShadow: "none",
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle1"
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
                      sx={{ mt: 0.25 }}
                    >
                      {project.customerName}
                    </Typography>
                  </Box>

                  <Chip
                    label={dashboardHealthLabels[health]}
                    color={dashboardHealthColors[health]}
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                <Chip
                  label={projectStatusLabels[project.projectStatus]}
                  color={projectStatusColors[project.projectStatus]}
                  size="small"
                  variant="outlined"
                  sx={{ alignSelf: "flex-start" }}
                />

                {project.latestReportId !== null && (
                  <ProgressOverview
                    targetProgress={project.targetProgress}
                    actualProgress={project.actualProgress}
                  />
                )}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mb: 0.75,
                        fontWeight: 700,
                      }}
                    >
                      Durum
                    </Typography>

                    <StatusOverview project={project} />
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        mb: 0.75,
                        fontWeight: 700,
                      }}
                    >
                      Risk ve aktif işler
                    </Typography>

                    <RiskAndWorkOverview project={project} />
                  </Box>
                </Box>

                <Box
                  sx={{
                    pt: 1.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <ReportAction project={project} onViewReport={onViewReport} />
                </Box>
              </Stack>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}

export default DashboardProjectTable;
