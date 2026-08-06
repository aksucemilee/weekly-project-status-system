import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type { Project } from "../../types/project";
import ResponsiveCardGrid from "../common/ResponsiveCardGrid";
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
        <Stack spacing={2} sx={{ alignItems: "center" }}>
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
      <Stack
        direction="row"
        sx={{
          mb: 1.5,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Typography id="project-list-title" variant="h6" component="h2">
          Proje listesi
        </Typography>

        <Chip
          label={`${projects.length} proje`}
          color="primary"
          size="small"
          variant="outlined"
        />
      </Stack>

      <ResponsiveCardGrid variant="compact">
        {projects.map((project) => (
          <Paper
            key={project.id}
            component="article"
            variant="outlined"
            sx={{
              display: "flex",
              minWidth: 0,
              p: {
                xs: 1.75,
                md: 2,
              },
              transition:
                "border-color 160ms ease, background-color 160ms ease",

              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            <Stack
              spacing={1.5}
              sx={{
                width: "100%",
                minWidth: 0,
              }}
            >
              <Stack
                direction="row"
                sx={{
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 1.5,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle1"
                    component="h3"
                    sx={{
                      fontWeight: 800,
                      lineHeight: 1.35,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {project.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
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
                  sx={{
                    flexShrink: 0,
                  }}
                />
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                }}
              >
                {formatProjectDate(project.startDate)}
                {"  →  "}
                {formatProjectDate(project.targetEndDate)}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  lineHeight: 1.6,
                  overflowWrap: "anywhere",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  overflow: "hidden",
                }}
              >
                {project.description?.trim() ||
                  "Bu proje için açıklama girilmemiş."}
              </Typography>
            </Stack>
          </Paper>
        ))}
      </ResponsiveCardGrid>
    </Box>
  );
}

export default ProjectList;
