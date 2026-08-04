import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import PageHeader from "../components/common/PageHeader";
import WeeklyReportForm from "../components/reports/WeeklyReportForm";
import WeeklyReportList from "../components/reports/WeeklyReportList";
import { getProjects } from "../services/projectService";
import { getWeeklyReportsByProject } from "../services/weeklyReportService";
import type { Project } from "../types/project";
import type { WeeklyReport } from "../types/weeklyReport";
import WorkItemManager from "../components/work-items/WorkItemManager";
import RiskIssueManager from "../components/risk-issues/RiskIssueManager";

function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(
    null,
  );

  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  const [isReportsLoading, setIsReportsLoading] = useState(false);

  const [projectErrorMessage, setProjectErrorMessage] = useState("");

  const [reportListErrorMessage, setReportListErrorMessage] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      setProjectErrorMessage("");

      try {
        const projectList = await getProjects();

        setProjects(projectList);

        if (projectList.length > 0) {
          setSelectedProjectId(String(projectList[0].id));
        }
      } catch {
        setProjectErrorMessage("Projeler yüklenirken bir hata oluştu.");
      } finally {
        setIsProjectsLoading(false);
      }
    };

    void loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setReports([]);
      setSelectedReport(null);
      return;
    }

    const loadReports = async () => {
      setIsReportsLoading(true);
      setReportListErrorMessage("");
      setReports([]);
      setSelectedReport(null);

      try {
        const reportList = await getWeeklyReportsByProject(
          Number(selectedProjectId),
        );

        setReports(reportList);
      } catch {
        setReportListErrorMessage(
          "Haftalık raporlar yüklenirken bir hata oluştu.",
        );
      } finally {
        setIsReportsLoading(false);
      }
    };

    void loadReports();
  }, [selectedProjectId]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedReport(null);
  };

  const handleReportCreated = (createdReport: WeeklyReport) => {
    setReports((previousReports) => [createdReport, ...previousReports]);
    setSelectedReport(createdReport);
  };

  return (
    <Box>
      <PageHeader
        title="Haftalık Raporlar"
        description="Projelerin haftalık ilerleme, durum, risk ve plan bilgilerini oluşturun ve geçmiş raporları inceleyin."
      />

      {isProjectsLoading && (
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
              Projeler yükleniyor...
            </Typography>
          </Stack>
        </Paper>
      )}

      {!isProjectsLoading && projectErrorMessage && (
        <Paper sx={{ p: 3 }}>
          <Alert severity="error">{projectErrorMessage}</Alert>
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
        <Stack spacing={4}>
          <WeeklyReportForm
            projects={projects}
            selectedProjectId={selectedProjectId}
            onProjectChange={handleProjectChange}
            onReportCreated={handleReportCreated}
          />

          <WeeklyReportList
            reports={reports}
            isLoading={isReportsLoading}
            errorMessage={reportListErrorMessage}
            selectedReportId={selectedReport?.id ?? null}
            onManageWorkItems={setSelectedReport}
          />

          {selectedReport && (
            <Stack spacing={4}>
              <WorkItemManager
                key={`work-items-${selectedReport.id}`}
                report={selectedReport}
              />

              <RiskIssueManager
                key={`risk-issues-${selectedReport.id}`}
                report={selectedReport}
              />
            </Stack>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default ReportsPage;
