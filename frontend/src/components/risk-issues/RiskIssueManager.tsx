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
  const [riskIssues, setRiskIssues] = useState<RiskIssue[]>([]);
  const [riskIssueForm, setRiskIssueForm] =
    useState<RiskIssueFormState>(initialRiskIssueForm);

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
      setErrorMessage("Risk veya engel başlığı zorunludur.");
      return;
    }

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
            xs: 2,
            md: 2.5,
          },
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: {
              xs: "stretch",
              sm: "flex-start",
            },
            justifyContent: "space-between",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 2,
            mb: 3,
          }}
        >
          <Stack spacing={0.75}>
            <Typography
              variant="overline"
              color="primary.main"
              sx={{ fontWeight: 800 }}
            >
              Rapor Detayı
            </Typography>

            <Typography variant="h5" component="h2">
              Risk ve Engel Yönetimi
            </Typography>

            <Typography color="text.secondary">
              {report.projectName} projesinin{" "}
              {formatDisplayDate(report.reportWeekStart)} tarihli raporuna ait
              risk, engel ve aksiyon bilgileri
            </Typography>
          </Stack>

          <Button
            type="button"
            variant={isFormOpen ? "outlined" : "contained"}
            onClick={isFormOpen ? handleCancelEdit : handleOpenCreateForm}
            aria-expanded={isFormOpen}
            sx={{ flexShrink: 0 }}
          >
            {isFormOpen ? "Formu Kapat" : "Yeni Risk veya Engel"}
          </Button>
        </Box>

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

        <Collapse in={isFormOpen} timeout="auto" unmountOnExit>
          <Box
            ref={formSectionRef}
            sx={{
              scrollMarginTop: 24,
            }}
          >
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <Typography variant="h6">
                  {editingRiskIssueId !== null
                    ? "Risk veya Engeli Düzenle"
                    : "Yeni Risk veya Engel"}
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
                    slotProps={{
                      htmlInput: {
                        maxLength: 200,
                      },
                    }}
                    required
                    fullWidth
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
                  />
                </Box>

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
                  minRows={3}
                  fullWidth
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
                  minRows={3}
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
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Kaydediliyor..."
                      : editingRiskIssueId !== null
                        ? "Değişiklikleri Kaydet"
                        : "Risk veya Engel Oluştur"}
                  </Button>

                  {editingRiskIssueId !== null && (
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
          </Box>
        </Collapse>

        <Box
          component="section"
          sx={{
            mt: isFormOpen ? 4 : 1,
          }}
        >
          <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
            Risk ve Engel Listesi
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
                  Risk ve engeller yükleniyor...
                </Typography>
              </Stack>
            </Box>
          )}

          {!isLoading && riskIssues.length === 0 && (
            <Alert severity="info">
              Bu haftalık rapora ait risk veya engel bulunmuyor.
            </Alert>
          )}

          {!isLoading && riskIssues.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  xl: "repeat(2, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              {riskIssues.map((riskIssue) => (
                <Paper
                  key={riskIssue.id}
                  variant="outlined"
                  component="article"
                  sx={{ p: 2 }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: {
                          xs: "flex-start",
                          md: "center",
                        },
                        justifyContent: "space-between",
                        flexDirection: {
                          xs: "column",
                          md: "row",
                        },
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 800 }}
                        >
                          {riskIssue.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Sorumlu: {riskIssue.responsible || "Belirtilmedi"}
                        </Typography>
                      </Box>

                      <Stack
                        spacing={1}
                        useFlexGap
                        sx={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={riskIssueTypeLabels[riskIssue.type]}
                          size="small"
                          variant="outlined"
                        />

                        <Chip
                          label={`Risk: ${
                            riskLevelLabels[riskIssue.riskLevel]
                          }`}
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
                    </Box>

                    {riskIssue.description && (
                      <Typography color="text.secondary">
                        {riskIssue.description}
                      </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary">
                      Hedef tarih: {formatDisplayDate(riskIssue.targetDate)}
                    </Typography>

                    {riskIssue.actionPlan && (
                      <Typography variant="body2" color="text.secondary">
                        Aksiyon planı: {riskIssue.actionPlan}
                      </Typography>
                    )}

                    <Stack
                      spacing={1}
                      useFlexGap
                      sx={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                      }}
                    >
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
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
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

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
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
