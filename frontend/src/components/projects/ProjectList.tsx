import {
  Alert,
  Box,
  Chip,
  CircularProgress,
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
    <Paper component="section" sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          px: {
            xs: 2.5,
            md: 3,
          },
          py: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="h5" component="h2">
            Proje Listesi
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Sistemde kayıtlı projelerin güncel özeti
          </Typography>
        </Box>

        <Chip
          label={`${projects.length} proje`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <TableContainer
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: "rgba(15, 23, 42, 0.025)",
              }}
            >
              <TableCell>Proje</TableCell>
              <TableCell>Müşteri</TableCell>
              <TableCell>Başlangıç</TableCell>
              <TableCell>Hedef bitiş</TableCell>
              <TableCell>Durum</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {projects.map((project) => (
              <TableRow
                key={project.id}
                hover
                sx={{
                  "&:last-child td": {
                    borderBottom: 0,
                  },
                }}
              >
                <TableCell>
                  <Typography sx={{ fontWeight: 700 }}>
                    {project.name}
                  </Typography>

                  {project.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                        maxWidth: 360,
                      }}
                    >
                      {project.description}
                    </Typography>
                  )}
                </TableCell>

                <TableCell>{project.customerName}</TableCell>

                <TableCell>{formatProjectDate(project.startDate)}</TableCell>

                <TableCell>
                  {formatProjectDate(project.targetEndDate)}
                </TableCell>

                <TableCell>
                  <Chip
                    label={projectStatusLabels[project.status]}
                    color={projectStatusColors[project.status]}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
        {projects.map((project) => (
          <Box
            key={project.id}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2.5,
              backgroundColor: "background.paper",
            }}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {project.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {project.customerName}
                  </Typography>
                </Box>

                <Chip
                  label={projectStatusLabels[project.status]}
                  color={projectStatusColors[project.status]}
                  size="small"
                  variant="outlined"
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Başlangıç
                  </Typography>

                  <Typography variant="body2">
                    {formatProjectDate(project.startDate)}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Hedef bitiş
                  </Typography>

                  <Typography variant="body2">
                    {formatProjectDate(project.targetEndDate)}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

export default ProjectList;
