import { Alert, Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { useState } from "react";
import type { FormEvent } from "react";

import { createProject } from "../../services/projectService";
import type {
  Project,
  ProjectCreateRequest,
  ProjectStatus,
} from "../../types/project";
import { projectStatusLabels } from "./projectPresentation";

type ProjectCreateFormProps = {
  onProjectCreated: (project: Project) => void;
  onCancel: () => void;
};

const initialProjectForm: ProjectCreateRequest = {
  name: "",
  customerName: "",
  description: "",
  startDate: "",
  targetEndDate: "",
  status: "PLANNED",
};

function ProjectCreateForm({
  onProjectCreated,
  onCancel,
}: ProjectCreateFormProps) {
  const [projectForm, setProjectForm] =
    useState<ProjectCreateRequest>(initialProjectForm);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const clearErrorMessage = () => {
    setErrorMessage("");
  };

  const updateFormField = <K extends keyof ProjectCreateRequest>(
    field: K,
    value: ProjectCreateRequest[K],
  ) => {
    clearErrorMessage();

    setProjectForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearErrorMessage();

    if (
      !projectForm.name.trim() ||
      !projectForm.customerName.trim() ||
      !projectForm.startDate ||
      !projectForm.targetEndDate
    ) {
      setErrorMessage("Proje adı, müşteri ve tarih alanları zorunludur.");
      return;
    }

    if (projectForm.startDate > projectForm.targetEndDate) {
      setErrorMessage("Hedef bitiş tarihi başlangıç tarihinden önce olamaz.");
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

      onProjectCreated(createdProject);
      setProjectForm(initialProjectForm);
    } catch {
      setErrorMessage("Proje oluşturulurken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      onInvalidCapture={clearErrorMessage}
    >
      <Stack spacing={2.5}>
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

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
          <TextField
            label="Proje adı"
            value={projectForm.name}
            onChange={(event) => updateFormField("name", event.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Müşteri"
            value={projectForm.customerName}
            onChange={(event) =>
              updateFormField("customerName", event.target.value)
            }
            required
            fullWidth
          />

          <TextField
            label="Açıklama"
            value={projectForm.description}
            onChange={(event) =>
              updateFormField("description", event.target.value)
            }
            multiline
            minRows={3}
            fullWidth
            sx={{
              gridColumn: {
                md: "1 / -1",
              },
            }}
          />

          <TextField
            label="Başlangıç tarihi"
            type="date"
            value={projectForm.startDate}
            onChange={(event) =>
              updateFormField("startDate", event.target.value)
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
              updateFormField("targetEndDate", event.target.value)
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              htmlInput: {
                min: projectForm.startDate || undefined,
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
              updateFormField("status", event.target.value as ProjectStatus)
            }
            fullWidth
          >
            {Object.entries(projectStatusLabels).map(([status, label]) => (
              <MenuItem key={status} value={status}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Stack
          spacing={1.25}
          sx={{
            flexDirection: {
              xs: "column-reverse",
              sm: "row",
            },
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            İptal
          </Button>

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Proje Oluştur"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default ProjectCreateForm;
