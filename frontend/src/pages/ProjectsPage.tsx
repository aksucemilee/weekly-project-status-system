import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createProject,
  getProjects,
} from "../services/projectService";
import type {
  Project,
  ProjectCreateRequest,
  ProjectStatus,
} from "../types/project";

const projectStatusLabels: Record<ProjectStatus, string> = {
  PLANNED: "Planlandı",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED: "Tamamlandı",
  BLOCKED: "Bloke",
};

const initialProjectForm: ProjectCreateRequest = {
  name: "",
  customerName: "",
  description: "",
  startDate: "",
  targetEndDate: "",
  status: "PLANNED",
};

function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectForm, setProjectForm] =
    useState<ProjectCreateRequest>(initialProjectForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectList = await getProjects();
        setProjects(projectList);
      } catch {
        setLoadErrorMessage(
          "Projeler yüklenirken bir hata oluştu.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjects();
  }, []);

  const updateFormField = <
    K extends keyof ProjectCreateRequest,
  >(
    field: K,
    value: ProjectCreateRequest[K],
  ) => {
    setProjectForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormErrorMessage("");
    setSuccessMessage("");

    if (
      !projectForm.name.trim() ||
      !projectForm.customerName.trim() ||
      !projectForm.startDate ||
      !projectForm.targetEndDate
    ) {
      setFormErrorMessage(
        "Proje adı, müşteri ve tarih alanları zorunludur.",
      );
      return;
    }

    if (
      projectForm.startDate >
      projectForm.targetEndDate
    ) {
      setFormErrorMessage(
        "Hedef bitiş tarihi başlangıç tarihinden önce olamaz.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const createdProject = await createProject({
        ...projectForm,
        name: projectForm.name.trim(),
        customerName: projectForm.customerName.trim(),
        description: projectForm.description.trim(),
      });

      setProjects((previousProjects) => [
        ...previousProjects,
        createdProject,
      ]);

      setProjectForm(initialProjectForm);
      setSuccessMessage("Proje başarıyla oluşturuldu.");
    } catch {
      setFormErrorMessage(
        "Proje oluşturulurken bir hata oluştu.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
      >
        Projeler
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ mb: 2 }}
        >
          Yeni Proje Oluştur
        </Typography>

        {formErrorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formErrorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <TextField
            label="Proje adı"
            value={projectForm.name}
            onChange={(event) =>
              updateFormField("name", event.target.value)
            }
            required
            fullWidth
          />

          <TextField
            label="Müşteri"
            value={projectForm.customerName}
            onChange={(event) =>
              updateFormField(
                "customerName",
                event.target.value,
              )
            }
            required
            fullWidth
          />

          <TextField
            label="Açıklama"
            value={projectForm.description}
            onChange={(event) =>
              updateFormField(
                "description",
                event.target.value,
              )
            }
            multiline
            minRows={3}
            fullWidth
            sx={{ gridColumn: { md: "1 / -1" } }}
          />

          <TextField
            label="Başlangıç tarihi"
            type="date"
            value={projectForm.startDate}
            onChange={(event) =>
              updateFormField(
                "startDate",
                event.target.value,
              )
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            required
            fullWidth
          />

          <TextField
            label="Hedef bitiş tarihi"
            type="date"
            value={projectForm.targetEndDate}
            onChange={(event) =>
              updateFormField(
                "targetEndDate",
                event.target.value,
              )
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            required
            fullWidth
          />

          <TextField
            select
            label="Proje durumu"
            value={projectForm.status}
            onChange={(event) =>
              updateFormField(
                "status",
                event.target.value as ProjectStatus,
              )
            }
            fullWidth
          >
            {Object.entries(projectStatusLabels).map(
              ([status, label]) => (
                <MenuItem key={status} value={status}>
                  {label}
                </MenuItem>
              ),
            )}
          </TextField>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Kaydediliyor..."
                : "Proje Oluştur"}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Typography
        variant="h6"
        component="h2"
        sx={{ mb: 2 }}
      >
        Proje Listesi
      </Typography>

      {isLoading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            py: 4,
          }}
        >
          <CircularProgress size={28} />
          <Typography>Projeler yükleniyor...</Typography>
        </Box>
      )}

      {!isLoading && loadErrorMessage && (
        <Alert severity="error">
          {loadErrorMessage}
        </Alert>
      )}

      {!isLoading &&
        !loadErrorMessage &&
        projects.length === 0 && (
          <Alert severity="info">
            Henüz kayıtlı proje bulunmuyor.
          </Alert>
        )}

      {!isLoading &&
        !loadErrorMessage &&
        projects.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Proje adı</TableCell>
                  <TableCell>Müşteri</TableCell>
                  <TableCell>Başlangıç tarihi</TableCell>
                  <TableCell>Hedef bitiş tarihi</TableCell>
                  <TableCell>Durum</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.name}</TableCell>

                    <TableCell>
                      {project.customerName}
                    </TableCell>

                    <TableCell>
                      {project.startDate}
                    </TableCell>

                    <TableCell>
                      {project.targetEndDate}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={
                          projectStatusLabels[
                            project.status
                          ]
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
    </Box>
  );
}

export default ProjectsPage;