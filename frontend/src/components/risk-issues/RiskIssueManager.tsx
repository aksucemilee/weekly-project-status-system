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
  createRiskIssue,
  deleteRiskIssue,
  getRiskIssuesByWeeklyReport,
  updateRiskIssue,
} from "../../services/riskIssueService";
import type {
  RiskIssue,
  RiskIssueCreateRequest,
  RiskIssueStatus,
  RiskIssueType,
} from "../../types/riskIssue";
import type { RiskLevel, WeeklyReport } from "../../types/weeklyReport";
import { useAuth } from "../../auth/authContext";
import { formatDisplayDate } from "../../utils/dateFormat";

type RiskIssueManagerProps = {
  report: WeeklyReport;
};

type RiskIssueFormState = {
  type: RiskIssueType;
  title: string;
  description: string;
  riskLevel: RiskLevel;
  actionPlan: string;
  responsible: string;
  targetDate: string;
  status: RiskIssueStatus;
};

type RiskIssueFieldErrors = Partial<Record<keyof RiskIssueFormState, string>>;

type ChipColor = "default" | "primary" | "success" | "warning" | "error";

const initialRiskIssueForm: RiskIssueFormState = {
  type: "RISK",
  title: "",
  description: "",
  riskLevel: "LOW",
  actionPlan: "",
  responsible: "",
  targetDate: "",
  status: "OPEN",
};

const riskIssueTypeLabels: Record<RiskIssueType, string> = {
  RISK: "Risk",
  BLOCKER: "Engel",
};

const riskIssueStatusLabels: Record<RiskIssueStatus, string> = {
  OPEN: "Açık",
  ACTION_IN_PROGRESS: "Aksiyon Devam Ediyor",
  RESOLVED: "Çözüldü",
};

const riskLevelLabels: Record<RiskLevel, string> = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
};

const riskIssueStatusColors: Record<RiskIssueStatus, ChipColor> = {
  OPEN: "warning",
  ACTION_IN_PROGRESS: "primary",
  RESOLVED: "success",
};

const riskLevelColors: Record<RiskLevel, ChipColor> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "error",
};

function RiskIssueManager({ report }: RiskIssueManagerProps) {
  const { hasPermission } = useAuth();

  const canManage = hasPermission("RISK_MANAGE");

  const [riskIssues, setRiskIssues] = useState<RiskIssue[]>([]);

  const [riskIssueForm, setRiskIssueForm] =
    useState<RiskIssueFormState>(initialRiskIssueForm);

  const [fieldErrors, setFieldErrors] = useState<RiskIssueFieldErrors>({});

  const [editingRiskIssueId, setEditingRiskIssueId] = useState<number | null>(
    null,
  );

  const [deletingRiskIssueId, setDeletingRiskIssueId] = useState<number | null>(
    null,
  );

  const [riskIssuePendingDelete, setRiskIssuePendingDelete] =
    useState<RiskIssue | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadRiskIssues = async () => {
      setIsLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setEditingRiskIssueId(null);
      setRiskIssueForm(initialRiskIssueForm);
      setFieldErrors({});
      setRiskIssues([]);
      setIsFormOpen(false);
      setRiskIssuePendingDelete(null);
      setDeletingRiskIssueId(null);

      try {
        const riskIssueList = await getRiskIssuesByWeeklyReport(report.id);

        if (isActive) {
          setRiskIssues(riskIssueList);
        }
      } catch {
        if (isActive) {
          setErrorMessage("Risk ve engeller yüklenirken bir hata oluştu.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadRiskIssues();

    return () => {
      isActive = false;
    };
  }, [report.id]);

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const updateFormField = <K extends keyof RiskIssueFormState>(
    field: K,
    value: RiskIssueFormState[K],
  ) => {
    clearMessages();

    setRiskIssueForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));

    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      [field]: undefined,
    }));
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
    setRiskIssueForm(initialRiskIssueForm);
    setEditingRiskIssueId(null);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();

    if (!riskIssueForm.title.trim()) {
      setFieldErrors({
        title: "Risk veya engel başlığı zorunludur.",
      });

      return;
    }

    setFieldErrors({});

    const request: RiskIssueCreateRequest = {
      type: riskIssueForm.type,
      title: riskIssueForm.title.trim(),
      description: riskIssueForm.description.trim(),
      riskLevel: riskIssueForm.riskLevel,
      actionPlan: riskIssueForm.actionPlan.trim(),
      responsible: riskIssueForm.responsible.trim(),
      targetDate: riskIssueForm.targetDate || null,
      status: riskIssueForm.status,
    };

    setIsSubmitting(true);

    try {
      if (editingRiskIssueId !== null) {
        const updatedRiskIssue = await updateRiskIssue(
          report.id,
          editingRiskIssueId,
          request,
        );

        setRiskIssues((previousRiskIssues) =>
          previousRiskIssues.map((riskIssue) =>
            riskIssue.id === updatedRiskIssue.id ? updatedRiskIssue : riskIssue,
          ),
        );

        setSuccessMessage("Risk veya engel başarıyla güncellendi.");
      } else {
        const createdRiskIssue = await createRiskIssue(report.id, request);

        setRiskIssues((previousRiskIssues) => [
          createdRiskIssue,
          ...previousRiskIssues,
        ]);

        setSuccessMessage("Risk veya engel başarıyla oluşturuldu.");
      }

      resetForm();
      setIsFormOpen(false);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Risk veya engel kaydedilirken bir hata oluştu.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (riskIssue: RiskIssue) => {
    clearMessages();
    setFieldErrors({});
    setEditingRiskIssueId(riskIssue.id);
    setIsFormOpen(true);

    setRiskIssueForm({
      type: riskIssue.type,
      title: riskIssue.title,
      description: riskIssue.description ?? "",
      riskLevel: riskIssue.riskLevel,
      actionPlan: riskIssue.actionPlan ?? "",
      responsible: riskIssue.responsible ?? "",
      targetDate: riskIssue.targetDate ?? "",
      status: riskIssue.status,
    });

    scrollToForm();
  };

  const handleCancelEdit = () => {
    clearMessages();
    resetForm();
    setIsFormOpen(false);
  };

  const handleOpenDeleteDialog = (riskIssue: RiskIssue) => {
    clearMessages();
    setRiskIssuePendingDelete(riskIssue);
  };

  const handleCloseDeleteDialog = () => {
    if (deletingRiskIssueId !== null) {
      return;
    }

    setRiskIssuePendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!riskIssuePendingDelete) {
      return;
    }

    const riskIssue = riskIssuePendingDelete;

    clearMessages();
    setDeletingRiskIssueId(riskIssue.id);

    try {
      await deleteRiskIssue(report.id, riskIssue.id);

      setRiskIssues((previousRiskIssues) =>
        previousRiskIssues.filter(
          (currentRiskIssue) => currentRiskIssue.id !== riskIssue.id,
        ),
      );

      if (editingRiskIssueId === riskIssue.id) {
        resetForm();
        setIsFormOpen(false);
      }

      setSuccessMessage("Risk veya engel başarıyla silindi.");
      setRiskIssuePendingDelete(null);
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "Risk veya engel silinirken bir hata oluştu.",
        ),
      );
    } finally {
      setDeletingRiskIssueId(null);
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
              Risk ve engeller
            </Typography>

            {!isLoading && (
              <Chip
                label={`${riskIssues.length} kayıt`}
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
              {isFormOpen ? "Formu kapat" : "Yeni risk veya engel"}
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
                    {editingRiskIssueId !== null
                      ? "Risk veya engeli düzenle"
                      : "Yeni risk veya engel"}
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
                      select
                      label="Tür"
                      value={riskIssueForm.type}
                      onChange={(event) =>
                        updateFormField(
                          "type",
                          event.target.value as RiskIssueType,
                        )
                      }
                      required
                      fullWidth
                      sx={{
                        gridColumn: {
                          md: "span 2",
                        },
                      }}
                    >
                      {Object.entries(riskIssueTypeLabels).map(
                        ([type, label]) => (
                          <MenuItem key={type} value={type}>
                            {label}
                          </MenuItem>
                        ),
                      )}
                    </TextField>

                    <TextField
                      label="Başlık"
                      value={riskIssueForm.title}
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
                          md: "span 4",
                        },
                      }}
                    />

                    <TextField
                      select
                      label="Risk seviyesi"
                      value={riskIssueForm.riskLevel}
                      onChange={(event) =>
                        updateFormField(
                          "riskLevel",
                          event.target.value as RiskLevel,
                        )
                      }
                      required
                      fullWidth
                      sx={{
                        gridColumn: {
                          md: "span 3",
                        },
                      }}
                    >
                      {Object.entries(riskLevelLabels).map(
                        ([riskLevel, label]) => (
                          <MenuItem key={riskLevel} value={riskLevel}>
                            {label}
                          </MenuItem>
                        ),
                      )}
                    </TextField>

                    <TextField
                      select
                      label="Durum"
                      value={riskIssueForm.status}
                      onChange={(event) =>
                        updateFormField(
                          "status",
                          event.target.value as RiskIssueStatus,
                        )
                      }
                      required
                      fullWidth
                      sx={{
                        gridColumn: {
                          md: "span 3",
                        },
                      }}
                    >
                      {Object.entries(riskIssueStatusLabels).map(
                        ([status, label]) => (
                          <MenuItem key={status} value={status}>
                            {label}
                          </MenuItem>
                        ),
                      )}
                    </TextField>

                    <TextField
                      label="Sorumlu"
                      value={riskIssueForm.responsible}
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
                      label="Hedef tarih"
                      type="date"
                      value={riskIssueForm.targetDate}
                      onChange={(event) =>
                        updateFormField("targetDate", event.target.value)
                      }
                      slotProps={{
                        inputLabel: {
                          shrink: true,
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
                      label="Açıklama"
                      value={riskIssueForm.description}
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
                      label="Aksiyon planı"
                      value={riskIssueForm.actionPlan}
                      onChange={(event) =>
                        updateFormField("actionPlan", event.target.value)
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
                        : editingRiskIssueId !== null
                          ? "Değişiklikleri kaydet"
                          : "Risk veya engel oluştur"}
                    </Button>

                    {editingRiskIssueId !== null && (
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
                Risk ve engeller yükleniyor...
              </Typography>
            </Stack>
          </Paper>
        )}

        {!isLoading && riskIssues.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Bu haftalık rapora ait risk veya engel bulunmuyor.
            </Typography>
          </Paper>
        )}

        {!isLoading && riskIssues.length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                lg:
                  riskIssues.length === 1
                    ? "minmax(0, 1fr)"
                    : "repeat(2, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            {riskIssues.map((riskIssue) => (
              <Paper
                key={riskIssue.id}
                variant="outlined"
                component="article"
                sx={{
                  minWidth: 0,
                  p: {
                    xs: 1.75,
                    md: 2,
                  },
                  borderColor:
                    riskIssue.type === "BLOCKER" &&
                    riskIssue.status !== "RESOLVED"
                      ? "error.main"
                      : "divider",
                }}
              >
                <Stack spacing={1.25}>
                  <Stack
                    sx={{
                      flexDirection: {
                        xs: "column",
                        sm: "row",
                      },
                      alignItems: {
                        xs: "flex-start",
                        sm: "center",
                      },
                      justifyContent: "space-between",
                      gap: 1.25,
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
                      {riskIssue.title}
                    </Typography>

                    <Stack
                      direction="row"
                      useFlexGap
                      sx={{
                        flexWrap: "wrap",
                        gap: 0.5,
                      }}
                    >
                      <Chip
                        label={riskIssueTypeLabels[riskIssue.type]}
                        size="small"
                        variant="outlined"
                      />

                      <Chip
                        label={`Seviye: ${riskLevelLabels[riskIssue.riskLevel]}`}
                        color={riskLevelColors[riskIssue.riskLevel]}
                        size="small"
                        variant="outlined"
                      />

                      <Chip
                        label={riskIssueStatusLabels[riskIssue.status]}
                        color={riskIssueStatusColors[riskIssue.status]}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>

                  {riskIssue.description?.trim() && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.6,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {riskIssue.description}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                      },
                      gap: 1.25,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Sorumlu
                      </Typography>

                      <Typography variant="body2">
                        {riskIssue.responsible?.trim() || "Belirtilmedi"}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Hedef tarih
                      </Typography>

                      <Typography variant="body2">
                        {formatDisplayDate(riskIssue.targetDate)}
                      </Typography>
                    </Box>
                  </Box>

                  {riskIssue.actionPlan?.trim() && (
                    <Box
                      sx={{
                        pt: 1.25,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Aksiyon planı
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.25,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {riskIssue.actionPlan}
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
                          onClick={() => handleEdit(riskIssue)}
                        >
                          Düzenle
                        </Button>

                        <Button
                          type="button"
                          variant="outlined"
                          color="error"
                          size="small"
                          disabled={deletingRiskIssueId !== null}
                          onClick={() => handleOpenDeleteDialog(riskIssue)}
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
        open={riskIssuePendingDelete !== null}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="risk-issue-delete-title"
        aria-describedby="risk-issue-delete-description"
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle id="risk-issue-delete-title">
          Risk veya engel silinsin mi?
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="risk-issue-delete-description">
            {riskIssuePendingDelete
              ? `"${riskIssuePendingDelete.title}" kaydı kalıcı olarak silinecektir.`
              : "Seçilen kayıt kalıcı olarak silinecektir."}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            type="button"
            onClick={handleCloseDeleteDialog}
            disabled={deletingRiskIssueId !== null}
          >
            İptal
          </Button>

          <Button
            type="button"
            variant="contained"
            color="error"
            onClick={() => void handleConfirmDelete()}
            disabled={deletingRiskIssueId !== null}
          >
            {deletingRiskIssueId !== null ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default RiskIssueManager;
