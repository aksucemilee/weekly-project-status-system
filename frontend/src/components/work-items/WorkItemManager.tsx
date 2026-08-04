import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createWorkItem,
  getWorkItemsByWeeklyReport,
  updateWorkItem,
} from "../../services/workItemService";
import type { WeeklyReport } from "../../types/weeklyReport";
import type {
  WorkItem,
  WorkItemCreateRequest,
  WorkItemStatus,
} from "../../types/workItem";

type WorkItemManagerProps = {
  report: WeeklyReport;
};

type WorkItemFormState = {
  title: string;
  description: string;
  responsible: string;
  status: WorkItemStatus;
  plannedDate: string;
  completedDate: string;
  note: string;
};

type WorkItemChipColor =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "error";

const initialWorkItemForm: WorkItemFormState = {
  title: "",
  description: "",
  responsible: "",
  status: "PLANNED",
  plannedDate: "",
  completedDate: "",
  note: "",
};

const workItemStatusLabels: Record<WorkItemStatus, string> = {
  PLANNED: "Planlandı",
  IN_PROGRESS: "Devam Ediyor",
  IN_TEST: "Testte",
  COMPLETED: "Tamamlandı",
  BLOCKED: "Bloke",
};

const getStatusColor = (status: WorkItemStatus): WorkItemChipColor => {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "BLOCKED":
      return "error";
    case "IN_TEST":
      return "warning";
    case "IN_PROGRESS":
      return "primary";
    default:
      return "default";
  }
};

function WorkItemManager({ report }: WorkItemManagerProps) {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [workItemForm, setWorkItemForm] =
    useState<WorkItemFormState>(initialWorkItemForm);

  const [editingWorkItemId, setEditingWorkItemId] = useState<number | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadWorkItems = async () => {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setEditingWorkItemId(null);
      setWorkItemForm(initialWorkItemForm);

      try {
        const workItemList = await getWorkItemsByWeeklyReport(report.id);

        if (isActive) {
          setWorkItems(workItemList);
        }
      } catch {
        if (isActive) {
          setErrorMessage("İş kalemleri yüklenirken bir hata oluştu.");
          setWorkItems([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadWorkItems();

    return () => {
      isActive = false;
    };
  }, [report.id]);

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const updateFormField = <K extends keyof WorkItemFormState>(
    field: K,
    value: WorkItemFormState[K],
  ) => {
    clearMessages();

    setWorkItemForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  };

  const getApiErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return "İş kalemi kaydedilirken bir hata oluştu.";
    }

    const responseData = error.response?.data as
      | { message?: string }
      | undefined;

    return responseData?.message ?? "İş kalemi kaydedilirken bir hata oluştu.";
  };

  const resetForm = () => {
    setWorkItemForm(initialWorkItemForm);
    setEditingWorkItemId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();

    if (!workItemForm.title.trim()) {
      setErrorMessage("İş kalemi başlığı zorunludur.");
      return;
    }

    const request: WorkItemCreateRequest = {
      title: workItemForm.title.trim(),
      description: workItemForm.description.trim(),
      responsible: workItemForm.responsible.trim(),
      status: workItemForm.status,
      plannedDate: workItemForm.plannedDate || null,
      completedDate: workItemForm.completedDate || null,
      note: workItemForm.note.trim(),
    };

    setIsSubmitting(true);

    try {
      if (editingWorkItemId !== null) {
        const updatedWorkItem = await updateWorkItem(
          report.id,
          editingWorkItemId,
          request,
        );

        setWorkItems((previousWorkItems) =>
          previousWorkItems.map((workItem) =>
            workItem.id === updatedWorkItem.id ? updatedWorkItem : workItem,
          ),
        );

        setSuccessMessage("İş kalemi başarıyla güncellendi.");
      } else {
        const createdWorkItem = await createWorkItem(report.id, request);

        setWorkItems((previousWorkItems) => [
          createdWorkItem,
          ...previousWorkItems,
        ]);

        setSuccessMessage("İş kalemi başarıyla oluşturuldu.");
      }

      resetForm();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (workItem: WorkItem) => {
    clearMessages();
    setEditingWorkItemId(workItem.id);

    setWorkItemForm({
      title: workItem.title,
      description: workItem.description ?? "",
      responsible: workItem.responsible ?? "",
      status: workItem.status,
      plannedDate: workItem.plannedDate ?? "",
      completedDate: workItem.completedDate ?? "",
      note: workItem.note ?? "",
    });
  };

  const handleCancelEdit = () => {
    clearMessages();
    resetForm();
  };

  return (
    <Paper
      component="section"
      sx={{
        p: {
          xs: 2.5,
          md: 3.5,
        },
      }}
    >
      <Stack spacing={0.75} sx={{ mb: 3 }}>
        <Typography
          variant="overline"
          color="primary.main"
          sx={{ fontWeight: 800 }}
        >
          Rapor Detayı
        </Typography>

        <Typography variant="h5" component="h2">
          İş Kalemleri Yönetimi
        </Typography>

        <Typography color="text.secondary">
          {report.projectName} projesinin {report.reportWeekStart} tarihli
          raporuna ait iş kalemleri
        </Typography>
      </Stack>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2.5 }}>
          {successMessage}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <Typography variant="h6">
            {editingWorkItemId !== null
              ? "İş Kalemini Düzenle"
              : "Yeni İş Kalemi"}
          </Typography>

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
              label="Başlık"
              value={workItemForm.title}
              onChange={(event) => updateFormField("title", event.target.value)}
              slotProps={{
                htmlInput: {
                  maxLength: 200,
                },
              }}
              required
              fullWidth
            />

            <TextField
              label="Sorumlu"
              value={workItemForm.responsible}
              onChange={(event) =>
                updateFormField("responsible", event.target.value)
              }
              slotProps={{
                htmlInput: {
                  maxLength: 150,
                },
              }}
              fullWidth
            />

            <TextField
              select
              label="Durum"
              value={workItemForm.status}
              onChange={(event) =>
                updateFormField("status", event.target.value as WorkItemStatus)
              }
              required
              fullWidth
            >
              {Object.entries(workItemStatusLabels).map(([status, label]) => (
                <MenuItem key={status} value={status}>
                  {label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Planlanan tarih"
              type="date"
              value={workItemForm.plannedDate}
              onChange={(event) =>
                updateFormField("plannedDate", event.target.value)
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              fullWidth
            />

            <TextField
              label="Tamamlanma tarihi"
              type="date"
              value={workItemForm.completedDate}
              onChange={(event) =>
                updateFormField("completedDate", event.target.value)
              }
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              fullWidth
            />
          </Box>

          <TextField
            label="Açıklama"
            value={workItemForm.description}
            onChange={(event) =>
              updateFormField("description", event.target.value)
            }
            slotProps={{
              htmlInput: {
                maxLength: 2000,
              },
            }}
            multiline
            minRows={3}
            fullWidth
          />

          <TextField
            label="Not"
            value={workItemForm.note}
            onChange={(event) => updateFormField("note", event.target.value)}
            slotProps={{
              htmlInput: {
                maxLength: 2000,
              },
            }}
            multiline
            minRows={2}
            fullWidth
          />

          <Stack
            spacing={1.5}
            useFlexGap
            sx={{
              flexDirection: {
                xs: "column",
                sm: "row",
              },
            }}
          >
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting
                ? "Kaydediliyor..."
                : editingWorkItemId !== null
                  ? "Değişiklikleri Kaydet"
                  : "İş Kalemi Oluştur"}
            </Button>

            {editingWorkItemId !== null && (
              <Button
                type="button"
                variant="outlined"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Düzenlemeyi İptal Et
              </Button>
            )}
          </Stack>
        </Stack>
      </Box>

      <Box component="section" sx={{ mt: 4 }}>
        <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
          İş Kalemi Listesi
        </Typography>

        {isLoading && (
          <Box
            sx={{
              minHeight: 160,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Stack spacing={1.5} sx={{ alignItems: "center" }}>
              <CircularProgress size={28} />

              <Typography color="text.secondary">
                İş kalemleri yükleniyor...
              </Typography>
            </Stack>
          </Box>
        )}

        {!isLoading && workItems.length === 0 && (
          <Alert severity="info">
            Bu haftalık rapora ait iş kalemi bulunmuyor.
          </Alert>
        )}

        {!isLoading && workItems.length > 0 && (
          <Stack spacing={2}>
            {workItems.map((workItem) => (
              <Paper
                key={workItem.id}
                variant="outlined"
                component="article"
                sx={{ p: 2.5 }}
              >
                <Stack spacing={2}>
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
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {workItem.title}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Sorumlu: {workItem.responsible || "Belirtilmedi"}
                      </Typography>
                    </Box>

                    <Chip
                      label={workItemStatusLabels[workItem.status]}
                      color={getStatusColor(workItem.status)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  {workItem.description && (
                    <Typography color="text.secondary">
                      {workItem.description}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Planlanan tarih: {workItem.plannedDate || "Belirtilmedi"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Tamamlanma tarihi:{" "}
                      {workItem.completedDate || "Belirtilmedi"}
                    </Typography>
                  </Box>

                  {workItem.note && (
                    <Typography variant="body2" color="text.secondary">
                      Not: {workItem.note}
                    </Typography>
                  )}

                  <Box>
                    <Button
                      type="button"
                      variant="outlined"
                      size="small"
                      onClick={() => handleEdit(workItem)}
                    >
                      Düzenle
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

export default WorkItemManager;
