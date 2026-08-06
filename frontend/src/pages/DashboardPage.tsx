import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import PageHeader from "../components/common/PageHeader";
import DashboardFilters from "../components/dashboard/DashboardFilters";
import type { DashboardFilterForm } from "../components/dashboard/DashboardFilters";
import DashboardProjectTable from "../components/dashboard/DashboardProjectTable";
import DashboardReportDetailDialog from "../components/dashboard/DashboardReportDetailDialog";
import DashboardSummaryCards from "../components/dashboard/DashboardSummaryCards";
import EmptyState from "../components/feedback/EmptyState";
import { getDashboardSummary } from "../services/dashboardService";
import { getProjects } from "../services/projectService";
import { getWeeklyReportById } from "../services/weeklyReportService";
import { layoutTokens } from "../theme/layoutTokens";
import type {
  DashboardProjectSummary,
  DashboardSummary,
} from "../types/dashboard";
import type { Project } from "../types/project";
import type { WeeklyReport } from "../types/weeklyReport";

function getCurrentWeekStart(): string {
  const today = new Date();
  const currentDay = today.getDay();

  const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(today.getDate() - daysSinceMonday);

  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const day = String(monday.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const defaultFilters: DashboardFilterForm = {
  weekStart: getCurrentWeekStart(),
  projectId: "",
  generalStatus: "",
  riskLevel: "",
};

function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);

  const [filterForm, setFilterForm] =
    useState<DashboardFilterForm>(defaultFilters);

  const [appliedFilters, setAppliedFilters] =
    useState<DashboardFilterForm>(defaultFilters);

  const [displayedFilters, setDisplayedFilters] =
    useState<DashboardFilterForm>(defaultFilters);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );

  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null,
  );

  const [isReportLoading, setIsReportLoading] = useState(false);

  const [reportErrorMessage, setReportErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const [summary, projectList] = await Promise.all([
        getDashboardSummary({
          weekStart: appliedFilters.weekStart || undefined,

          projectId: appliedFilters.projectId
            ? Number(appliedFilters.projectId)
            : undefined,

          generalStatus: appliedFilters.generalStatus || undefined,

          riskLevel: appliedFilters.riskLevel || undefined,
        }),

        getProjects(),
      ]);

      setDashboardSummary(summary);
      setProjects(projectList);
      setDisplayedFilters(appliedFilters);
    } catch {
      setErrorMessage("Dashboard bilgileri yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const loadReportDetail = async (projectId: number, reportId: number) => {
    setIsReportLoading(true);
    setReportErrorMessage("");
    setSelectedReport(null);

    try {
      const report = await getWeeklyReportById(projectId, reportId);

      setSelectedReport(report);
    } catch {
      setReportErrorMessage(
        "Haftalık rapor ayrıntıları yüklenirken bir hata oluştu.",
      );
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filterForm);
  };

  const handleClearFilters = () => {
    const resetFilters: DashboardFilterForm = {
      weekStart: getCurrentWeekStart(),
      projectId: "",
      generalStatus: "",
      riskLevel: "",
    };

    setFilterForm(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const handleViewReport = (project: DashboardProjectSummary) => {
    if (project.latestReportId === null) {
      return;
    }

    setSelectedProjectId(project.projectId);
    setSelectedReportId(project.latestReportId);

    void loadReportDetail(project.projectId, project.latestReportId);
  };

  const handleRetryReport = () => {
    if (selectedProjectId === null || selectedReportId === null) {
      return;
    }

    void loadReportDetail(selectedProjectId, selectedReportId);
  };

  const handleCloseReport = () => {
    setSelectedProjectId(null);
    setSelectedReportId(null);
    setSelectedReport(null);
    setReportErrorMessage("");
    setIsReportLoading(false);
  };

  return (
    <Box>
      <PageHeader title="CTO Dashboard" />

      <Stack
        sx={{
          gap: layoutTokens.spacing.section,
        }}
      >
        {!errorMessage && dashboardSummary && (
          <DashboardSummaryCards
            summary={dashboardSummary}
            weekStart={displayedFilters.weekStart}
          />
        )}

        <DashboardFilters
          projects={projects}
          filters={filterForm}
          appliedFilters={appliedFilters}
          isLoading={isLoading}
          onChange={setFilterForm}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />

        {isLoading && (
          <Paper
            sx={{
              minHeight: 220,
              display: "grid",
              placeItems: "center",
              p: 3,
            }}
          >
            <Stack
              spacing={2}
              sx={{
                alignItems: "center",
              }}
            >
              <CircularProgress size={32} />

              <Typography color="text.secondary">
                Proje durumları yükleniyor...
              </Typography>
            </Stack>
          </Paper>
        )}

        {!isLoading && errorMessage && (
          <Paper sx={{ p: 3 }}>
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => void loadDashboard()}
                >
                  Tekrar dene
                </Button>
              }
            >
              {errorMessage}
            </Alert>
          </Paper>
        )}

        {!isLoading &&
          !errorMessage &&
          dashboardSummary &&
          dashboardSummary.projects.length === 0 && (
            <EmptyState
              label="Sonuç bulunamadı"
              title="Seçilen filtrelerle eşleşen proje yok"
              description="Filtreleri değiştirerek veya varsayılan haftaya dönerek tekrar deneyin."
            />
          )}

        {!isLoading &&
          !errorMessage &&
          dashboardSummary &&
          dashboardSummary.projects.length > 0 && (
            <DashboardProjectTable
              projects={dashboardSummary.projects}
              onViewReport={handleViewReport}
            />
          )}
      </Stack>

      <DashboardReportDetailDialog
        open={selectedReportId !== null}
        report={selectedReport}
        isLoading={isReportLoading}
        errorMessage={reportErrorMessage}
        onClose={handleCloseReport}
        onRetry={handleRetryReport}
      />
    </Box>
  );
}

export default DashboardPage;
