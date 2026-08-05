import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useCallback, useEffect, useMemo, useState } from "react";

import PageHeader from "../components/common/PageHeader";
import ResponsiveCardGrid from "../components/common/ResponsiveCardGrid";
import { useNotification } from "../components/feedback/NotificationProvider";
import ProjectCreateForm from "../components/projects/ProjectCreateForm";
import ProjectList from "../components/projects/ProjectList";
import { getProjects } from "../services/projectService";
import { layoutTokens } from "../theme/layoutTokens";
import type { Project } from "../types/project";

function ProjectsPage() {
  const theme = useTheme();
  const { showNotification } = useNotification();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadErrorMessage("");

    try {
      const projectList = await getProjects();
      setProjects(projectList);
    } catch {
      setLoadErrorMessage("Projeler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const projectSummary = useMemo(
    () => ({
      total: projects.length,
      planned: projects.filter((project) => project.status === "PLANNED")
        .length,
      inProgress: projects.filter((project) => project.status === "IN_PROGRESS")
        .length,
      completed: projects.filter((project) => project.status === "COMPLETED")
        .length,
    }),
    [projects],
  );

  const handleProjectCreated = (createdProject: Project) => {
    setProjects((previousProjects) => [createdProject, ...previousProjects]);

    setIsCreateDialogOpen(false);
    showNotification("Proje başarıyla oluşturuldu.");
  };

  return (
    <Box>
      <PageHeader
        title="Projeler"
        description="Projeleri kompakt kartlarla takip edin; yeni proje oluşturun ve planlanan çalışma tarihlerini tek ekrandan görüntüleyin."
        action={
          <Button
            variant="contained"
            onClick={() => setIsCreateDialogOpen(true)}
            fullWidth={isSmallScreen}
          >
            + Yeni Proje
          </Button>
        }
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
            <CircularProgress size={30} />

            <Typography color="text.secondary">
              Projeler yükleniyor...
            </Typography>
          </Stack>
        </Paper>
      )}

      {!isLoading && loadErrorMessage && (
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
            {loadErrorMessage}
          </Alert>
        </Paper>
      )}

      {!isLoading && !loadErrorMessage && (
        <Stack
          sx={{
            gap: layoutTokens.spacing.section,
          }}
        >
          <ResponsiveCardGrid variant="summary">
            <Paper
              sx={{
                p: {
                  xs: 1.75,
                  sm: 2,
                },
                minWidth: 0,
                boxShadow: "none",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 800 }}
              >
                Toplam proje
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,
                  fontSize: {
                    xs: "1.55rem",
                    md: "2rem",
                  },
                }}
              >
                {projectSummary.total}
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: {
                  xs: 1.75,
                  sm: 2,
                },
                minWidth: 0,
                boxShadow: "none",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 800 }}
              >
                Planlanan
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,
                  fontSize: {
                    xs: "1.55rem",
                    md: "2rem",
                  },
                }}
              >
                {projectSummary.planned}
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: {
                  xs: 1.75,
                  sm: 2,
                },
                minWidth: 0,
                boxShadow: "none",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 800 }}
              >
                Devam eden
              </Typography>

              <Typography
                variant="h4"
                color="primary.main"
                sx={{
                  mt: 0.5,
                  fontSize: {
                    xs: "1.55rem",
                    md: "2rem",
                  },
                }}
              >
                {projectSummary.inProgress}
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: {
                  xs: 1.75,
                  sm: 2,
                },
                minWidth: 0,
                boxShadow: "none",
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 800 }}
              >
                Tamamlanan
              </Typography>

              <Typography
                variant="h4"
                color="success.main"
                sx={{
                  mt: 0.5,
                  fontSize: {
                    xs: "1.55rem",
                    md: "2rem",
                  },
                }}
              >
                {projectSummary.completed}
              </Typography>
            </Paper>
          </ResponsiveCardGrid>

          <ProjectList projects={projects} isLoading={false} errorMessage="" />
        </Stack>
      )}

      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
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
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="overline"
              color="primary.main"
              sx={{ fontWeight: 900 }}
            >
              Yeni kayıt
            </Typography>

            <Typography variant="h5">Yeni proje oluştur</Typography>
          </Box>

          <IconButton
            type="button"
            aria-label="Proje formunu kapat"
            onClick={() => setIsCreateDialogOpen(false)}
            sx={{ flexShrink: 0 }}
          >
            <Typography
              component="span"
              aria-hidden="true"
              sx={{
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              ×
            </Typography>
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <ProjectCreateForm
            onProjectCreated={handleProjectCreated}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ProjectsPage;
