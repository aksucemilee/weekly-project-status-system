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

import { useAuth } from "../auth/authContext";
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

  const { hasPermission } = useAuth();

  const canManageProjects = hasPermission("PROJECT_MANAGE");

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // null => olusturma modu, dolu => o projenin duzenleme modu.
  const [projectBeingEdited, setProjectBeingEdited] = useState<Project | null>(
    null,
  );

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
      active: projects.filter((project) => project.status === "ACTIVE").length,
      closed: projects.filter((project) => project.status === "CLOSED").length,
    }),
    [projects],
  );

  const handleOpenCreateDialog = () => {
    setProjectBeingEdited(null);
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (project: Project) => {
    setProjectBeingEdited(project);
    setIsCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setProjectBeingEdited(null);
  };

  const handleProjectSaved = (savedProject: Project) => {
    const wasEditing = projectBeingEdited !== null;

    if (wasEditing) {
      setProjects((previousProjects) =>
        previousProjects.map((project) =>
          project.id === savedProject.id ? savedProject : project,
        ),
      );
    } else {
      setProjects((previousProjects) => [savedProject, ...previousProjects]);
    }

    setIsCreateDialogOpen(false);
    setProjectBeingEdited(null);

    showNotification(
      wasEditing
        ? "Proje başarıyla güncellendi."
        : "Proje başarıyla oluşturuldu.",
    );
  };

  return (
    <Box>
      <PageHeader
        title="Projeler"
        action={
          canManageProjects ? (
            <Button
              variant="contained"
              onClick={handleOpenCreateDialog}
              fullWidth={isSmallScreen}
            >
              + Yeni proje
            </Button>
          ) : null
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
                  xs: 1.5,
                  sm: 1.75,
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
                    xs: "1.5rem",
                    md: "1.75rem",
                  },
                }}
              >
                {projectSummary.total}
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: {
                  xs: 1.5,
                  sm: 1.75,
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
                Başlamadı
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 0.5,
                  fontSize: {
                    xs: "1.5rem",
                    md: "1.75rem",
                  },
                }}
              >
                {projectSummary.planned}
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: {
                  xs: 1.5,
                  sm: 1.75,
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
                Aktif
              </Typography>

              <Typography
                variant="h4"
                color="primary.main"
                sx={{
                  mt: 0.5,
                  fontSize: {
                    xs: "1.5rem",
                    md: "1.75rem",
                  },
                }}
              >
                {projectSummary.active}
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: {
                  xs: 1.5,
                  sm: 1.75,
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
                Kapandı
              </Typography>

              <Typography
                variant="h4"
                color="success.main"
                sx={{
                  mt: 0.5,
                  fontSize: {
                    xs: "1.5rem",
                    md: "1.75rem",
                  },
                }}
              >
                {projectSummary.closed}
              </Typography>
            </Paper>
          </ResponsiveCardGrid>

          <ProjectList
            projects={projects}
            onEditProject={
              canManageProjects ? handleOpenEditDialog : undefined
            }
          />
        </Stack>
      )}

      <Dialog
        open={isCreateDialogOpen}
        onClose={handleCloseDialog}
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
            {projectBeingEdited ? "Projeyi düzenle" : "Yeni proje"}
          </Typography>

          <IconButton
            type="button"
            aria-label="Proje formunu kapat"
            onClick={handleCloseDialog}
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
            // Duzenlenen proje degistiginde form durumu bastan kurulur.
            key={projectBeingEdited?.id ?? "create"}
            project={projectBeingEdited}
            onProjectSaved={handleProjectSaved}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ProjectsPage;
