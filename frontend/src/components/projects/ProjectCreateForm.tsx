import axios from "axios";
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

type ProjectFieldErrors = {
  name?: string;
  customerName?: string;
  startDate?: string;
  targetEndDate?: string;
};

type BackendErrorResponse = {
  message?: string;
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

  const [fieldErrors, setFieldErrors] = useState<ProjectFieldErrors>({});
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

    setFieldErrors((previousErrors) => {
      const nextErrors = {
        ...previousErrors,
        [field]: undefined,
      };

      if (field === "startDate") {
        nextErrors.targetEndDate = undefined;
      }

      return nextErrors;
    });
  };

  const validateForm = () => {
    const nextErrors: ProjectFieldErrors = {};

    if (!projectForm.name.trim()) {
      nextErrors.name = "Proje adı zorunludur.";
    }

    if (!projectForm.customerName.trim()) {
      nextErrors.customerName = "Müşteri adı zorunludur.";
    }

    if (!projectForm.startDate) {
      nextErrors.startDate = "Başlangıç tarihi zorunludur.";
    }

    if (!projectForm.targetEndDate) {
      nextErrors.targetEndDate = "Hedef bitiş tarihi zorunludur.";
    } else if (
      projectForm.startDate &&
      projectForm.startDate > projectForm.targetEndDate
    ) {
      nextErrors.targetEndDate =
        "Hedef bitiş tarihi başlangıç tarihinden önce olamaz.";
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const getBackendErrorMessage = (error: unknown) => {
    if (axios.isAxiosError<BackendErrorResponse>(error)) {
      const backendMessage = error.response?.data?.message;

      if (typeof backendMessage === "string" && backendMessage.trim()) {
        return backendMessage;
      }
    }

    return "Proje oluşturulurken bir hata oluştu.";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearErrorMessage();

    if (!validateForm()) {
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
      setFieldErrors({});
    } catch (error: unknown) {
      setErrorMessage(getBackendErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
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
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name}
            required
            fullWidth
          />

          <TextField
            label="Müşteri"
            value={projectForm.customerName}
            onChange={(event) =>
              updateFormField("customerName", event.target.value)
            }
            error={Boolean(fieldErrors.customerName)}
            helperText={fieldErrors.customerName}
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
            error={Boolean(fieldErrors.startDate)}
            helperText={fieldErrors.startDate}
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
            error={Boolean(fieldErrors.targetEndDate)}
            helperText={fieldErrors.targetEndDate}
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
