import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  createWorkItem,
  deleteWorkItem,
  getWorkItemsByWeeklyReport,
  updateWorkItem,
} from "../../services/workItemService";
import type { WeeklyReport } from "../../types/weeklyReport";
import type {
  WorkItem,
  WorkItemCreateRequest,
  WorkItemStatus,
} from "../../types/workItem";
import { useAuth } from "../../auth/authContext";
import { formatDisplayDate } from "../../utils/dateFormat";

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

type WorkItemFieldErrors = Partial<Record<keyof WorkItemFormState, string>>;

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
  const { hasPermission } = useAuth();

  const canManage = hasPermission("WORKITEM_MANAGE");

  const [workItems, setWorkItems] = useState<WorkItem[]>([]);

  const [workItemForm, setWorkItemForm] =
    useState<WorkItemFormState>(initialWorkItemForm);

  const [fieldErrors, setFieldErrors] = useState<WorkItemFieldErrors>({});

  const [editingWorkItemId, setEditingWorkItemId] = useState<number | null>(
    null,
  );

  const [deletingWorkItemId, setDeletingWorkItemId] = useState<number | null>(
    null,
  );

  const [workItemPendingDelete, setWorkItemPendingDelete] =
    useState<WorkItem | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadWorkItems = async () => {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setEditingWorkItemId(null);
      setWorkItemForm(initialWorkItemForm);
      setFieldErrors({});
      setIsFormOpen(false);
      setWorkItems([]);
      setDeletingWorkItemId(null);
      setWorkItemPendingDelete(null);

      try {
        const workItemList = await getWorkItemsByWeeklyReport(report.id);

        if (isActive) {
          setWorkItems(workItemList);
        }
      } catch {
        if (isActive) {
          setErrorMessage("İş kalemleri yüklenirken bir hata oluştu.");
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

    setWorkItemForm((previousForm) => {
      if (field === "status") {
        const nextStatus = value as WorkItemStatus;

        return {
          ...previousForm,
          status: nextStatus,
          completedDate:
            nextStatus === "COMPLETED" ? previousForm.completedDate : "",
        };
      }

      return {
        ...previousForm,
        [field]: value,
      };
    });

    setFieldErrors((previousErrors) => {
      const nextErrors: WorkItemFieldErrors = {
        ...previousErrors,
        [field]: undefined,
      };

      if (
        field === "status" ||
        field === "plannedDate" ||
        field === "completedDate"
      ) {
        nextErrors.completedDate = undefined;
        nextErrors.status = undefined;
      }

      return nextErrors;
    });
  };

  const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (!axios.isAxiosError(error)) {
      return fallbackMessage;
    }

    const responseData = error.response?.data as
      | { message?: string }
      | undefined;

    return responseData?.message ?? fallbackMessage;
  };

  const resetForm = () => {
    setWorkItemForm(initialWorkItemForm);
    setEditingWorkItemId(null);
    setFieldErrors({});
  };

  const scrollToForm = () => {
    window.setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleOpenCreateForm = () => {
    clearMessages();
    resetForm();
    setIsFormOpen(true);
    scrollToForm();
  };

  const validateForm = () => {
    const nextErrors: WorkItemFieldErrors = {};

    if (!workItemForm.title.trim()) {
      nextErrors.title = "İş kalemi başlığı zorunludur.";
    }

    if (workItemForm.status !== "COMPLETED" && workItemForm.completedDate) {
      nextErrors.status =
        "Tamamlanma tarihi girildiğinde durum Tamamlandı olmalıdır.";
      nextErrors.completedDate =
        "Tamamlanma tarihi yalnızca tamamlanan işler için girilebilir.";
    } else if (
      workItemForm.status === "COMPLETED" &&
      !workItemForm.completedDate
    ) {
      nextErrors.completedDate =
        "Durum Tamamlandı olduğunda tamamlanma tarihi zorunludur.";
    } else if (
      workItemForm.plannedDate &&
      workItemForm.completedDate &&
      workItemForm.completedDate < workItemForm.plannedDate
    ) {
      nextErrors.completedDate =
        "Tamamlanma tarihi planlanan tarihten önce olamaz.";
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();

    if (!validateForm()) {
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
      setIsFormOpen(false);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "İş kalemi kaydedilirken bir hata oluştu."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (workItem: WorkItem) => {
    clearMessages();
    setFieldErrors({});
    setEditingWorkItemId(workItem.id);
    setIsFormOpen(true);

    setWorkItemForm({
      title: workItem.title,
      description: workItem.description ?? "",
      responsible: workItem.responsible ?? "",
      status: workItem.status,
      plannedDate: workItem.plannedDate ?? "",
      completedDate:
        workItem.status === "COMPLETED" ? (workItem.completedDate ?? "") : "",
      note: workItem.note ?? "",
    });

    scrollToForm();
  };

  const handleCancelEdit = () => {
    clearMessages();
    resetForm();
    setIsFormOpen(false);
  };

  const handleOpenDeleteDialog = (workItem: WorkItem) => {
    clearMessages();
    setWorkItemPendingDelete(workItem);
  };

  const handleCloseDeleteDialog = () => {
    if (deletingWorkItemId !== null) {
      return;
    }

    setWorkItemPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!workItemPendingDelete) {
      return;
    }

    const workItem = workItemPendingDelete;

    clearMessages();
    setDeletingWorkItemId(workItem.id);

    try {
      await deleteWorkItem(report.id, workItem.id);

      setWorkItems((previousWorkItems) =>
        previousWorkItems.filter(
          (currentWorkItem) => currentWorkItem.id !== workItem.id,
        ),
      );

      if (editingWorkItemId === workItem.id) {
        resetForm();
        setIsFormOpen(false);
      }

      setSuccessMessage("İş kalemi başarıyla silindi.");
      setWorkItemPendingDelete(null);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(error, "İş kalemi silinirken bir hata oluştu."),
      );
    } finally {
      setDeletingWorkItemId(null);
    }
  };

  return (
    <>
      <Paper
        component="section"
        variant="outlined"
        sx={{
          p: {
            xs: 1.75,
            md: 2,
          },
        }}
      >
        <Stack
          sx={{
            mb: 2,
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Stack
            direction="row"
            sx={{
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h6" component="h3">
              İş kalemleri
            </Typography>

            {!isLoading && (
              <Chip
                label={`${workItems.length} kayıt`}
                size="small"
                variant="outlined"
              />
            )}
          </Stack>

          {canManage && (
            <Button
              type="button"
              variant={isFormOpen ? "outlined" : "contained"}
              onClick={isFormOpen ? handleCancelEdit : handleOpenCreateForm}
              aria-expanded={isFormOpen}
            >
              {isFormOpen ? "Formu kapat" : "Yeni iş kalemi"}
            </Button>
          )}
        </Stack>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Collapse in={isFormOpen} timeout="auto" unmountOnExit>
          <Box
            ref={formSectionRef}
            sx={{
              mb: 2,
              scrollMarginTop: 96,
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                p: {
                  xs: 1.75,
                  md: 2,
                },
                backgroundColor: "action.hover",
              }}
            >
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {editingWorkItemId !== null
                      ? "İş kalemini düzenle"
                      : "Yeni iş kalemi"}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(6, minmax(0, 1fr))",
                      },
                      gap: 1.5,
                    }}
                  >
                    <TextField
                      label="Başlık"
                      value={workItemForm.title}
                      onChange={(event) =>
                        updateFormField("title", event.target.value)
                      }
                      error={Boolean(fieldErrors.title)}
                      helperText={fieldErrors.title}
                      slotProps={{
                        htmlInput: {
                          maxLength: 200,
                        },
                      }}
                      required
                      fullWidth
                      sx={{
                        gridColumn: {
                          md: "span 3",
                        },
                      }}
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
                      sx={{
                        gridColumn: {
                          md: "span 3",
                        },
                      }}
                    />

                    <TextField
                      select
                      label="Durum"
                      value={workItemForm.status}
                      onChange={(event) =>
                        updateFormField(
                          "status",
                          event.target.value as WorkItemStatus,
                        )
                      }
                      error={Boolean(fieldErrors.status)}
                      helperText={fieldErrors.status}
                      required
                      fullWidth
                      sx={{
                        gridColumn: {
                          md: "span 2",
                        },
                      }}
                    >
                      {Object.entries(workItemStatusLabels).map(
                        ([status, label]) => (
                          <MenuItem key={status} value={status}>
                            {label}
                          </MenuItem>
                        ),
                      )}
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
                      sx={{
                        gridColumn: {
                          md: "span 2",
                        },
                      }}
                    />

                    <TextField
                      label="Tamamlanma tarihi"
                      type="date"
                      value={workItemForm.completedDate}
                      onChange={(event) =>
                        updateFormField("completedDate", event.target.value)
                      }
                      error={Boolean(fieldErrors.completedDate)}
                      helperText={
                        fieldErrors.completedDate ??
                        (workItemForm.status !== "COMPLETED"
                          ? "Durum Tamamlandı seçildiğinde açılır."
                          : undefined)
                      }
                      disabled={workItemForm.status !== "COMPLETED"}
                      required={workItemForm.status === "COMPLETED"}
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                        htmlInput: {
                          min: workItemForm.plannedDate || undefined,
                        },
                      }}
                      fullWidth
                      sx={{
                        gridColumn: {
                          md: "span 2",
                        },
                      }}
                    />

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
                      minRows={2}
                      fullWidth
                      sx={{
                        gridColumn: {
                          md: "1 / -1",
                        },
                      }}
                    />

                    <TextField
                      label="Not"
                      value={workItemForm.note}
                      onChange={(event) =>
                        updateFormField("note", event.target.value)
                      }
                      slotProps={{
                        htmlInput: {
                          maxLength: 2000,
                        },
                      }}
                      multiline
                      minRows={2}
                      fullWidth
                      sx={{
                        gridColumn: {
                          md: "1 / -1",
                        },
                      }}
                    />
                  </Box>

                  <Stack
                    useFlexGap
                    sx={{
                      flexDirection: {
                        xs: "column",
                        sm: "row",
                      },
                      gap: 1,
                    }}
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Kaydediliyor..."
                        : editingWorkItemId !== null
                          ? "Değişiklikleri kaydet"
                          : "İş kalemi oluştur"}
                    </Button>

                    {editingWorkItemId !== null && (
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={handleCancelEdit}
                        disabled={isSubmitting}
                      >
                        Düzenlemeyi iptal et
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Box>
            </Paper>
          </Box>
        </Collapse>

        {isLoading && (
          <Paper
            variant="outlined"
            sx={{
              minHeight: 130,
              display: "grid",
              placeItems: "center",
              p: 2,
            }}
          >
            <Stack spacing={1.5} sx={{ alignItems: "center" }}>
              <CircularProgress size={26} />

              <Typography variant="body2" color="text.secondary">
                İş kalemleri yükleniyor...
              </Typography>
            </Stack>
          </Paper>
        )}

        {!isLoading && workItems.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Bu haftalık rapora ait iş kalemi bulunmuyor.
            </Typography>
          </Paper>
        )}

        {!isLoading && workItems.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg:
                  workItems.length === 1
                    ? "minmax(0, 1fr)"
                    : "repeat(2, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            {workItems.map((workItem) => (
              <Paper
                key={workItem.id}
                variant="outlined"
                component="article"
                sx={{
                  minWidth: 0,
                  p: {
                    xs: 1.75,
                    md: 2,
                  },
                  borderColor:
                    workItem.status === "BLOCKED" ? "error.main" : "divider",
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      component="h4"
                      sx={{
                        fontWeight: 800,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {workItem.title}
                    </Typography>

                    <Chip
                      label={workItemStatusLabels[workItem.status]}
                      color={getStatusColor(workItem.status)}
                      size="small"
                      variant="outlined"
                      sx={{ flexShrink: 0 }}
                    />
                  </Stack>

                  {workItem.description?.trim() && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {workItem.description}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(3, minmax(0, 1fr))",
                      },
                      gap: 1.25,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Sorumlu
                      </Typography>

                      <Typography variant="body2">
                        {workItem.responsible?.trim() || "Belirtilmedi"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Planlanan tarih
                      </Typography>

                      <Typography variant="body2">
                        {formatDisplayDate(workItem.plannedDate)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Tamamlanma tarihi
                      </Typography>

                      <Typography variant="body2">
                        {formatDisplayDate(workItem.completedDate)}
                      </Typography>
                    </Box>
                  </Box>

                  {workItem.note?.trim() && (
                    <Box
                      sx={{
                        pt: 1.25,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Not
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.25,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {workItem.note}
                      </Typography>
                    </Box>
                  )}

                  <Stack
                    direction="row"
                    useFlexGap
                    sx={{
                      flexWrap: "wrap",
                      gap: 0.75,
                    }}
                  >
                    {canManage && (
                      <>
                        <Button
                          type="button"
                          variant="outlined"
                          size="small"
                          onClick={() => handleEdit(workItem)}
                        >
                          Düzenle
                        </Button>

                        <Button
                          type="button"
                          variant="outlined"
                          color="error"
                          size="small"
                          disabled={deletingWorkItemId !== null}
                          onClick={() => handleOpenDeleteDialog(workItem)}
                        >
                          Sil
                        </Button>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      <Dialog
        open={workItemPendingDelete !== null}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="work-item-delete-title"
        aria-describedby="work-item-delete-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="work-item-delete-title">
          İş kalemi silinsin mi?
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="work-item-delete-description">
            {workItemPendingDelete
              ? `"${workItemPendingDelete.title}" kaydı kalıcı olarak silinecektir.`
              : "Seçilen iş kalemi kalıcı olarak silinecektir."}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            type="button"
            onClick={handleCloseDeleteDialog}
            disabled={deletingWorkItemId !== null}
          >
            İptal
          </Button>

          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={() => void handleConfirmDelete()}
            disabled={deletingWorkItemId !== null}
          >
            {deletingWorkItemId !== null ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default WorkItemManager;
