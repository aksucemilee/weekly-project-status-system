import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import type { FormEvent } from "react";

import { createWeeklyReport } from "../../services/weeklyReportService";
import type { Project } from "../../types/project";
import type {
  GeneralStatus,
  RiskLevel,
  ScheduleStatus,
  WeeklyReport,
  WeeklyReportCreateRequest,
} from "../../types/weeklyReport";
import {
  generalStatusLabels,
  riskLevelLabels,
  scheduleStatusLabels,
} from "./reportPresentation";

type WeeklyReportFormState = Omit<
  WeeklyReportCreateRequest,
  "targetProgress" | "actualProgress"
> & {
  targetProgress: string;
  actualProgress: string;
};

type WeeklyReportFormProps = {
  projects: Project[];
  selectedProjectId: string;
  onProjectChange: (projectId: string) => void;
  onReportCreated: (report: WeeklyReport) => void;
};

const initialReportForm: WeeklyReportFormState = {
  reportWeekStart: "",
  targetProgress: "",
  actualProgress: "",
  generalStatus: "PLANNED",
  scheduleStatus: "ON_TRACK",
  riskLevel: "LOW",
  completedSummary: "",
  nextWeekPlan: "",
  blockers: "",
  generalNote: "",
};

function WeeklyReportForm({
  projects,
  selectedProjectId,
  onProjectChange,
  onReportCreated,
}: WeeklyReportFormProps) {
  const [reportForm, setReportForm] =
    useState<WeeklyReportFormState>(initialReportForm);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const updateFormField = <K extends keyof WeeklyReportFormState>(
    field: K,
    value: WeeklyReportFormState[K],
  ) => {
    clearMessages();

    setReportForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  };

  const handleSelectedProjectChange = (projectId: string) => {
    clearMessages();
    onProjectChange(projectId);
  };

  const getApiErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return "Haftalık rapor oluşturulurken bir hata oluştu.";
    }

    if (error.response?.status === 409) {
      return "Bu proje için seçilen haftada zaten bir rapor bulunuyor.";
    }

    const responseData = error.response?.data as
      | { message?: string }
      | undefined;

    return (
      responseData?.message ?? "Haftalık rapor oluşturulurken bir hata oluştu."
    );
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();

    if (!selectedProjectId) {
      setErrorMessage("Bir proje seçilmelidir.");
      return;
    }

    const targetProgress = Number(reportForm.targetProgress);
    const actualProgress = Number(reportForm.actualProgress);

    const progressValuesAreInvalid =
      !Number.isInteger(targetProgress) ||
      !Number.isInteger(actualProgress) ||
      targetProgress < 0 ||
      targetProgress > 100 ||
      actualProgress < 0 ||
      actualProgress > 100;

    if (progressValuesAreInvalid) {
      setErrorMessage(
        "Hedeflenen ve gerçekleşen ilerleme 0 ile 100 arasında tam sayı olmalıdır.",
      );
      return;
    }

    if (
      !reportForm.completedSummary.trim() ||
      !reportForm.nextWeekPlan.trim()
    ) {
      setErrorMessage(
        "Yapılanlar ve gelecek hafta yapılacaklar alanları zorunludur.",
      );
      return;
    }

    const request: WeeklyReportCreateRequest = {
      reportWeekStart: reportForm.reportWeekStart,
      targetProgress,
      actualProgress,
      generalStatus: reportForm.generalStatus,
      scheduleStatus: reportForm.scheduleStatus,
      riskLevel: reportForm.riskLevel,
      completedSummary: reportForm.completedSummary.trim(),
      nextWeekPlan: reportForm.nextWeekPlan.trim(),
      blockers: reportForm.blockers.trim(),
      generalNote: reportForm.generalNote.trim(),
    };

    setIsSubmitting(true);

    try {
      const createdReport = await createWeeklyReport(
        Number(selectedProjectId),
        request,
      );

      onReportCreated(createdReport);
      setReportForm(initialReportForm);
      setSuccessMessage("Haftalık rapor başarıyla oluşturuldu.");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
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
          Yeni Kayıt
        </Typography>

        <Typography variant="h5" component="h2">
          Yeni Haftalık Rapor
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            maxWidth: 760,
            lineHeight: 1.7,
          }}
        >
          Projenin haftalık ilerleme, durum, risk ve plan bilgilerini kaydedin.
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

      <Box
        component="form"
        onSubmit={handleSubmit}
        onInvalidCapture={clearMessages}
      >
        <Stack spacing={3}>
          <Box component="section">
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1.5,
                fontWeight: 800,
              }}
            >
              Temel bilgiler
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "minmax(0, 2fr) minmax(240px, 1fr)",
                },
                gap: 2,
              }}
            >
              <TextField
                select
                label="Proje"
                value={selectedProjectId}
                onChange={(event) =>
                  handleSelectedProjectChange(event.target.value)
                }
                required
                fullWidth
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Rapor haftası"
                type="date"
                value={reportForm.reportWeekStart}
                onChange={(event) =>
                  updateFormField("reportWeekStart", event.target.value)
                }
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                required
                fullWidth
              />
            </Box>
          </Box>

          <Box component="section">
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1.5,
                fontWeight: 800,
              }}
            >
              İlerleme ve durum
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <TextField
                label="Hedeflenen ilerleme (%)"
                type="number"
                value={reportForm.targetProgress}
                onChange={(event) =>
                  updateFormField("targetProgress", event.target.value)
                }
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 100,
                    step: 1,
                  },
                }}
                required
                fullWidth
              />

              <TextField
                label="Gerçekleşen ilerleme (%)"
                type="number"
                value={reportForm.actualProgress}
                onChange={(event) =>
                  updateFormField("actualProgress", event.target.value)
                }
                slotProps={{
                  htmlInput: {
                    min: 0,
                    max: 100,
                    step: 1,
                  },
                }}
                required
                fullWidth
              />

              <TextField
                select
                label="Genel durum"
                value={reportForm.generalStatus}
                onChange={(event) =>
                  updateFormField(
                    "generalStatus",
                    event.target.value as GeneralStatus,
                  )
                }
                fullWidth
              >
                {Object.entries(generalStatusLabels).map(([status, label]) => (
                  <MenuItem key={status} value={status}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Takvim durumu"
                value={reportForm.scheduleStatus}
                onChange={(event) =>
                  updateFormField(
                    "scheduleStatus",
                    event.target.value as ScheduleStatus,
                  )
                }
                fullWidth
              >
                {Object.entries(scheduleStatusLabels).map(([status, label]) => (
                  <MenuItem key={status} value={status}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Risk seviyesi"
                value={reportForm.riskLevel}
                onChange={(event) =>
                  updateFormField("riskLevel", event.target.value as RiskLevel)
                }
                fullWidth
              >
                {Object.entries(riskLevelLabels).map(([riskLevel, label]) => (
                  <MenuItem key={riskLevel} value={riskLevel}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          <Box component="section">
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1.5,
                fontWeight: 800,
              }}
            >
              Haftalık çalışma özeti
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <TextField
                label="Yapılanlar"
                value={reportForm.completedSummary}
                onChange={(event) =>
                  updateFormField("completedSummary", event.target.value)
                }
                multiline
                minRows={4}
                required
                fullWidth
              />

              <TextField
                label="Gelecek hafta yapılacaklar"
                value={reportForm.nextWeekPlan}
                onChange={(event) =>
                  updateFormField("nextWeekPlan", event.target.value)
                }
                multiline
                minRows={4}
                required
                fullWidth
              />

              <TextField
                label="Engeller"
                value={reportForm.blockers}
                onChange={(event) =>
                  updateFormField("blockers", event.target.value)
                }
                multiline
                minRows={3}
                fullWidth
              />

              <TextField
                label="Genel not"
                value={reportForm.generalNote}
                onChange={(event) =>
                  updateFormField("generalNote", event.target.value)
                }
                multiline
                minRows={3}
                fullWidth
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: {
                xs: "stretch",
                sm: "flex-start",
              },
            }}
          >
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                width: {
                  xs: "100%",
                  sm: "auto",
                },
              }}
            >
              {isSubmitting ? "Kaydediliyor..." : "Rapor Oluştur"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}

export default WeeklyReportForm;
