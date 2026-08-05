import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ResponsiveCardGrid from "../common/ResponsiveCardGrid";
import type { Project } from "../../types/project";
import EmptyState from "../feedback/EmptyState";
import {
  formatProjectDate,
  projectStatusColors,
  projectStatusLabels,
} from "./projectPresentation";

type ProjectListProps = {
  projects: Project[];
  isLoading: boolean;
  errorMessage: string;
};

function ProjectList({ projects, isLoading, errorMessage }: ProjectListProps) {
  if (isLoading) {
    return (
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

          <Typography color="text.secondary">Projeler yükleniyor...</Typography>
        </Stack>
      </Paper>
    );
  }

  if (errorMessage) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{errorMessage}</Alert>
      </Paper>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        label="Proje bulunamadı"
        title="Henüz kayıtlı proje yok"
        description="İlk projeyi oluşturduğunuzda proje bilgileri bu alanda görüntülenecektir."
      />
    );
  }

  return (
    <Box component="section" aria-labelledby="project-list-title">
      <Box
        sx={{
          display: "flex",
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent: "space-between",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography id="project-list-title" variant="h5" component="h2">
            Proje listesi
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 0.25 }}>
            Sistemde kayıtlı projelerin güncel özeti
          </Typography>
        </Box>

        <Chip
          label={`${projects.length} proje`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <ResponsiveCardGrid variant="compact">
        {projects.map((project) => (
          <Paper
            key={project.id}
            component="article"
            sx={{
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
              minHeight: {
                xs: "auto",
                md: 265,
              },
              p: {
                xs: 2,
                md: 2.25,
              },
              transition:
                "transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease",

              "&:hover": {
                transform: "translateY(-3px)",
                borderColor: "primary.main",
                boxShadow: 4,
              },
            }}
          >
            <Stack spacing={2} sx={{ height: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 1.5,
                  minWidth: 0,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                      overflowWrap: "anywhere",
                    }}
                  >
                    {project.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.35,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {project.customerName}
                  </Typography>
                </Box>

                <Chip
                  label={projectStatusLabels[project.status]}
                  color={projectStatusColors[project.status]}
                  size="small"
                  variant="outlined"
                  sx={{ flexShrink: 0 }}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                  p: 1.75,
                  borderRadius: 2.5,
                  backgroundColor: "action.hover",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 0.25,
                    }}
                  >
                    Başlangıç
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatProjectDate(project.startDate)}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 0.25,
                    }}
                  >
                    Hedef bitiş
                  </Typography>

                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatProjectDate(project.targetEndDate)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 0.5,
                    fontWeight: 800,
                  }}
                >
                  Proje açıklaması
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.65,
                    overflowWrap: "anywhere",
                    display: "-webkit-box",
                    WebkitBoxOrient: "vertical",
                    WebkitLineClamp: 3,
                    overflow: "hidden",
                  }}
                >
                  {project.description || "Proje açıklaması girilmedi."}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </ResponsiveCardGrid>
    </Box>
  );
}

export default ProjectList;
