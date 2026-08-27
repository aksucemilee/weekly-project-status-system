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
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuth } from "../auth/authContext";
import PageHeader from "../components/common/PageHeader";
import { layoutTokens } from "../theme/layoutTokens";
import { useNotification } from "../components/feedback/NotificationContext";
import RiskIssueManager from "../components/risk-issues/RiskIssueManager";
import ReportFilters from "../components/reports/ReportFilters";
import WeeklyReportForm from "../components/reports/WeeklyReportForm";
import WeeklyReportList from "../components/reports/WeeklyReportList";
import {
  emptyReportFilterForm,
  generalStatusColors,
  generalStatusLabels,
  hasActiveReportFilters,
  riskLevelColors,
  riskLevelLabels,
  scheduleStatusColors,
  scheduleStatusLabels,
} from "../components/reports/reportPresentation";
import type { ReportFilterForm } from "../components/reports/reportPresentation";
import {
  projectStatusColors,
  projectStatusLabels,
} from "../components/projects/projectPresentation";
import WorkItemManager from "../components/work-items/WorkItemManager";
import { getProjects } from "../services/projectService";
import { getWeeklyReportsByProject } from "../services/weeklyReportService";
import type { Project } from "../types/project";
import type { WeeklyReport } from "../types/weeklyReport";
import { formatDisplayDate } from "../utils/dateFormat";

type ReportDetailTab = "overview" | "workItems" | "riskIssues";

const REPORTS_PAGE_SIZE = 10;

type ReportTextSectionProps = {
  title: string;
  value: string | null;
  emptyText: string;
};

function ReportTextSection({
  title,
  value,
  emptyText,
}: ReportTextSectionProps) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 900 }}>
        {title}
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          lineHeight: 1.7,
          whiteSpace: "pre-line",
        }}
      >
        {value || emptyText}
      </Typography>
    </Box>
  );
}

function ReportsPage() {
  const theme = useTheme();
  const { showNotification } = useNotification();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const isTabletOrSmaller = useMediaQuery(theme.breakpoints.down("md"));

  const { hasPermission } = useAuth();

  const canCreateReport = hasPermission("REPORT_CREATE");
  const canUpdateReport = hasPermission("REPORT_UPDATE");

  // Admin rolunun REPORT_VIEW yetkisi var ancak WORKITEM_VIEW/RISK_VIEW
  // yetkisi yok (bkz. docs/t14-authorization-matrix.md bolum 3). Sekmeler
  // kosulsuz gosterilirse alt listeler 403 alip genel bir hata mesaji
  // gosteriyordu; yetkisi olmayan role sekme hic acilmaz.
  const canViewWorkItems = hasPermission("WORKITEM_VIEW");
  const canViewRiskIssues = hasPermission("RISK_VIEW");

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null,
  );

  const [reportFilters, setReportFilters] = useState<ReportFilterForm>(
    emptyReportFilterForm,
  );

  const [reportPage, setReportPage] = useState(0);
  const [reportTotalElements, setReportTotalElements] = useState(0);
  const [reportTotalPages, setReportTotalPages] = useState(0);

  const [selectedDetailTab, setSelectedDetailTab] =
    useState<ReportDetailTab>("overview");

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // null => olusturma modu, dolu => o raporun duzenleme modu.
  const [reportBeingEdited, setReportBeingEdited] =
    useState<WeeklyReport | null>(null);

  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  const [isReportsLoading, setIsReportsLoading] = useState(false);

  const [projectErrorMessage, setProjectErrorMessage] = useState("");

  const [reportListErrorMessage, setReportListErrorMessage] = useState("");

  const reportDetailsRef = useRef<HTMLDivElement | null>(null);

  const selectedProject =
    projects.find((project) => String(project.id) === selectedProjectId) ??
    null;

  const loadProjects = useCallback(async () => {
    setIsProjectsLoading(true);
    setProjectErrorMessage("");

    try {
      const projectList = await getProjects();

      setProjects(projectList);

      if (projectList.length > 0) {
        setSelectedProjectId((currentProjectId) => {
          const currentProjectStillExists = projectList.some(
            (project) => String(project.id) === currentProjectId,
          );

          return currentProjectStillExists
            ? currentProjectId
            : String(projectList[0].id);
        });
      } else {
        setSelectedProjectId("");
      }
    } catch {
      setProjectErrorMessage("Projeler yüklenirken bir hata oluştu.");
    } finally {
      setIsProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await loadProjects();
    };
    void run();
  }, [loadProjects]);

  const loadReports = useCallback(async () => {
    if (!selectedProjectId) {
      setReports([]);
      setSelectedReport(null);
      setSelectedDetailTab("overview");
      setReportTotalElements(0);
      setReportTotalPages(0);
      setIsReportsLoading(false);
      return;
    }

    setIsReportsLoading(true);
    setReportListErrorMessage("");
    setReports([]);
    setSelectedReport(null);
    setSelectedDetailTab("overview");

    try {
      const reportPageResult = await getWeeklyReportsByProject(
        Number(selectedProjectId),
        {
          weekStart: reportFilters.weekStart || undefined,
          generalStatus: reportFilters.generalStatus || undefined,
          riskLevel: reportFilters.riskLevel || undefined,
          scheduleStatus: reportFilters.scheduleStatus || undefined,
          page: reportPage,
          size: REPORTS_PAGE_SIZE,
        },
      );

      setReports(reportPageResult.content);
      setReportTotalElements(reportPageResult.totalElements);
      setReportTotalPages(reportPageResult.totalPages);
    } catch {
      setReportListErrorMessage(
        "Haftalık raporlar yüklenirken bir hata oluştu.",
      );
      setReportTotalElements(0);
      setReportTotalPages(0);
    } finally {
      setIsReportsLoading(false);
    }
  }, [selectedProjectId, reportFilters, reportPage]);

  useEffect(() => {
    const run = async () => {
      await loadReports();
    };
    void run();
  }, [loadReports]);

  useEffect(() => {
    if (!selectedReport) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      reportDetailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [selectedReport]);

  const handleManageReport = (report: WeeklyReport) => {
    if (selectedReport?.id === report.id) {
      setSelectedReport(null);
      setSelectedDetailTab("overview");
      return;
    }

    setSelectedReport(report);
    setSelectedDetailTab("overview");
  };

  const handleCloseReportDetails = () => {
    setSelectedReport(null);
    setSelectedDetailTab("overview");
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedReport(null);
    setSelectedDetailTab("overview");
    setReportFilters(emptyReportFilterForm);
    setReportPage(0);
  };

  const handleReportFiltersChange = (filters: ReportFilterForm) => {
    setReportFilters(filters);
    setReportPage(0);
  };

  /**
   * Sayfa degistiginde acik rapor detayi kapatilir: detay listenin
   * ustunde durdugu icin, aksi halde artik listede olmayan bir raporun
   * detayi ekranda kalirdi.
   */
  const handleReportPageChange = (newPage: number) => {
    setReportPage(newPage - 1);
    setSelectedReport(null);
    setSelectedDetailTab("overview");
  };

  const handleOpenCreateDialog = () => {
    setReportBeingEdited(null);
    setIsReportDialogOpen(true);
  };

  const handleOpenEditDialog = (report: WeeklyReport) => {
    setReportBeingEdited(report);
    setIsReportDialogOpen(true);
  };

  const handleCloseReportDialog = () => {
    setIsReportDialogOpen(false);
    setReportBeingEdited(null);
  };

  const handleReportSaved = (savedReport: WeeklyReport) => {
    const wasEditing = reportBeingEdited !== null;

    if (wasEditing) {
      setReports((previousReports) =>
        previousReports.map((report) =>
          report.id === savedReport.id ? savedReport : report,
        ),
      );
    } else {
      setReports((previousReports) => [savedReport, ...previousReports]);
    }

    setSelectedReport(savedReport);
    setSelectedDetailTab("overview");
    setIsReportDialogOpen(false);
    setReportBeingEdited(null);

    showNotification(
      wasEditing
        ? "Haftalık rapor başarıyla güncellendi."
        : "Haftalık rapor başarıyla oluşturuldu.",
    );
  };

  return (
    <Box>
      <PageHeader
        title="Haftalık raporlar"
        action={
          canCreateReport ? (
            <Button
              variant="contained"
              onClick={handleOpenCreateDialog}
              disabled={!selectedProject}
              fullWidth={isSmallScreen}
            >
              + Yeni rapor
            </Button>
          ) : null
        }
      />

      {isProjectsLoading && (
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
              Projeler yükleniyor...
            </Typography>
          </Stack>
        </Paper>
      )}

      {!isProjectsLoading && projectErrorMessage && (
        <Paper sx={{ p: 3 }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => void loadProjects()}
              >
                Tekrar dene
              </Button>
            }
          >
            {projectErrorMessage}
          </Alert>
        </Paper>
      )}

      {!isProjectsLoading && !projectErrorMessage && projects.length === 0 && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="info">
            Haftalık rapor oluşturabilmek için önce bir proje oluşturulmalıdır.
          </Alert>
        </Paper>
      )}

      {!isProjectsLoading && !projectErrorMessage && projects.length > 0 && (
        <Stack
          sx={{
            gap: layoutTokens.spacing.section,
          }}
        >
          <Paper
            component="section"
            sx={{
              p: {
                xs: 1.5,
                md: 1.75,
              },
            }}
          >
            <Stack
              spacing={2}
              sx={{
                flexDirection: {
                  xs: "column",
                  md: "row",
                },
                alignItems: {
                  xs: "stretch",
                  md: "center",
                },
                justifyContent: "space-between",
              }}
            >
              <TextField
                select
                label="Görüntülenen proje"
                value={selectedProjectId}
                onChange={(event) => handleProjectChange(event.target.value)}
                sx={{
                  width: {
                    xs: "100%",
                    md: 420,
                  },
                }}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>

              <Stack
                direction="row"
                useFlexGap
                sx={{
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {selectedProject && (
                  <Chip
                    label={projectStatusLabels[selectedProject.status]}
                    color={projectStatusColors[selectedProject.status]}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>
            </Stack>
          </Paper>

          <ReportFilters
            filters={reportFilters}
            isLoading={isReportsLoading}
            onChange={handleReportFiltersChange}
          />

          {selectedReport && (
            <Box
              ref={reportDetailsRef}
              sx={{
                scrollMarginTop: 88,
              }}
            >
              <Paper
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
                  <Stack
                    spacing={2}
                    sx={{
                      flexDirection: {
                        xs: "column",
                        md: "row",
                      },
                      alignItems: {
                        xs: "flex-start",
                        md: "center",
                      },
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="h6" component="h2">
                        {selectedReport.projectName}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.25 }}
                      >
                        {formatDisplayDate(selectedReport.reportWeekStart)}
                      </Typography>
                    </Box>

                    <Stack
                      spacing={1.25}
                      sx={{
                        alignItems: {
                          xs: "flex-start",
                          md: "flex-end",
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        useFlexGap
                        sx={{
                          flexWrap: "wrap",
                          gap: 0.75,
                        }}
                      >
                        <Chip
                          label={
                            generalStatusLabels[selectedReport.generalStatus]
                          }
                          color={
                            generalStatusColors[selectedReport.generalStatus]
                          }
                          size="small"
                          variant="outlined"
                        />

                        <Chip
                          label={
                            scheduleStatusLabels[selectedReport.scheduleStatus]
                          }
                          color={
                            scheduleStatusColors[selectedReport.scheduleStatus]
                          }
                          size="small"
                          variant="outlined"
                        />

                        <Chip
                          label={`Risk: ${
                            riskLevelLabels[selectedReport.riskLevel]
                          }`}
                          color={riskLevelColors[selectedReport.riskLevel]}
                          size="small"
                          variant="outlined"
                        />
                      </Stack>

                      <Stack
                        direction="row"
                        useFlexGap
                        sx={{
                          flexWrap: "wrap",
                          gap: 0.75,
                        }}
                      >
                        {canUpdateReport && (
                          <Button
                            type="button"
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenEditDialog(selectedReport)}
                            sx={{ minHeight: 32 }}
                          >
                            Raporu düzenle
                          </Button>
                        )}

                        <Tooltip title="Rapor detaylarını kapat">
                          <Button
                            type="button"
                            variant="text"
                            size="small"
                            onClick={handleCloseReportDetails}
                            sx={{
                              minHeight: 32,
                              px: 1,
                              color: "text.secondary",
                            }}
                          >
                            Detayları kapat
                          </Button>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>

                <Tabs
                  value={selectedDetailTab}
                  onChange={(_event, newValue: ReportDetailTab) => {
                    setSelectedDetailTab(newValue);
                  }}
                  variant={isTabletOrSmaller ? "scrollable" : "fullWidth"}
                  scrollButtons="auto"
                  aria-label="Rapor detay bölümleri"
                  sx={{
                    px: {
                      xs: 1,
                      md: 2,
                    },
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Tab value="overview" label="Genel Bakış" />

                  {canViewWorkItems && (
                    <Tab value="workItems" label="İş Kalemleri" />
                  )}

                  {canViewRiskIssues && (
                    <Tab value="riskIssues" label="Risk ve Engeller" />
                  )}
                </Tabs>

                {selectedDetailTab === "overview" && (
                  <Box
                    sx={{
                      p: {
                        xs: 2,
                        md: 2.5,
                      },
                    }}
                  >
                    <Stack spacing={2.5}>
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
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            backgroundColor: "action.hover",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Hedeflenen ilerleme
                          </Typography>

                          <Typography variant="h5" sx={{ my: 0.75 }}>
                            %{selectedReport.targetProgress}
                          </Typography>

                          <LinearProgress
                            variant="determinate"
                            value={selectedReport.targetProgress}
                            sx={{
                              height: 8,
                              borderRadius: 999,

                              "& .MuiLinearProgress-bar": {
                                borderRadius: 999,
                              },
                            }}
                          />
                        </Box>

                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            backgroundColor: "action.hover",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Gerçekleşen ilerleme
                          </Typography>

                          <Typography variant="h5" sx={{ my: 0.75 }}>
                            %{selectedReport.actualProgress}
                          </Typography>

                          <LinearProgress
                            variant="determinate"
                            value={selectedReport.actualProgress}
                            color="success"
                            sx={{
                              height: 8,
                              borderRadius: 999,

                              "& .MuiLinearProgress-bar": {
                                borderRadius: 999,
                              },
                            }}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            lg: "repeat(2, minmax(0, 1fr))",
                          },
                          gap: 2,
                        }}
                      >
                        <ReportTextSection
                          title="Bu hafta yapılanlar"
                          value={selectedReport.completedSummary}
                          emptyText="Bilgi girilmedi."
                        />

                        <ReportTextSection
                          title="Gelecek hafta planı"
                          value={selectedReport.nextWeekPlan}
                          emptyText="Bilgi girilmedi."
                        />

                        <ReportTextSection
                          title="Engeller"
                          value={selectedReport.blockers}
                          emptyText="Engel belirtilmedi."
                        />

                        <ReportTextSection
                          title="Genel not"
                          value={selectedReport.generalNote}
                          emptyText="Not girilmedi."
                        />
                      </Box>
                    </Stack>
                  </Box>
                )}

                {selectedDetailTab === "workItems" && canViewWorkItems && (
                  <Box
                    sx={{
                      p: {
                        xs: 1.5,
                        md: 2,
                      },
                    }}
                  >
                    <WorkItemManager
                      key={`work-items-${selectedReport.id}`}
                      report={selectedReport}
                    />
                  </Box>
                )}

                {selectedDetailTab === "riskIssues" && canViewRiskIssues && (
                  <Box
                    sx={{
                      p: {
                        xs: 1.5,
                        md: 2,
                      },
                    }}
                  >
                    <RiskIssueManager
                      key={`risk-issues-${selectedReport.id}`}
                      report={selectedReport}
                    />
                  </Box>
                )}
              </Paper>
            </Box>
          )}

          <WeeklyReportList
            reports={reports}
            totalCount={reportTotalElements}
            isLoading={isReportsLoading}
            errorMessage={reportListErrorMessage}
            selectedReportId={selectedReport?.id ?? null}
            hasActiveFilters={hasActiveReportFilters(reportFilters)}
            onManageReportDetails={handleManageReport}
            onRetry={() => void loadReports()}
          />

          {!isReportsLoading && !reportListErrorMessage && reportTotalPages > 1 && (
            <Stack
              sx={{
                alignItems: "center",
              }}
            >
              <Pagination
                count={reportTotalPages}
                page={reportPage + 1}
                onChange={(_event, newPage) => handleReportPageChange(newPage)}
                color="primary"
                shape="rounded"
              />
            </Stack>
          )}
        </Stack>
      )}

      <Dialog
        open={isReportDialogOpen && selectedProject !== null}
        onClose={handleCloseReportDialog}
        fullWidth
        maxWidth={layoutTokens.dialog.formMaxWidth}
        fullScreen={isSmallScreen}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="h6" component="span">
            {reportBeingEdited
              ? "Haftalık raporu düzenle"
              : "Yeni haftalık rapor"}
          </Typography>

          <IconButton
            type="button"
            aria-label="Rapor formunu kapat"
            onClick={handleCloseReportDialog}
          >
            <Typography
              component="span"
              aria-hidden="true"
              sx={{ fontSize: 24, lineHeight: 1 }}
            >
              ×
            </Typography>
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedProject && (
            <WeeklyReportForm
              // Duzenlenen rapor degistiginde form durumu bastan kurulur.
              key={reportBeingEdited?.id ?? "create"}
              project={selectedProject}
              report={reportBeingEdited}
              onReportSaved={handleReportSaved}
              onCancel={handleCloseReportDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ReportsPage;
