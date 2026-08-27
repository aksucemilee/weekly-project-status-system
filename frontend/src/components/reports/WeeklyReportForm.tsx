import {
  Alert,
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";
import type { FormEvent } from "react";

import {
  createWeeklyReport,
  updateWeeklyReport,
} from "../../services/weeklyReportService";
import type { Project } from "../../types/project";
import type {
  GeneralStatus,
  ScheduleStatus,
  WeeklyReport,
  WeeklyReportCreateRequest,
} from "../../types/weeklyReport";
import {
  generalStatusLabels,
  scheduleStatusLabels,
} from "./reportPresentation";

type WeeklyReportFormState = Omit<
  WeeklyReportCreateRequest,
  "targetProgress" | "actualProgress"
> & {
  targetProgress: string;
  actualProgress: string;
};

type WeeklyReportFieldErrors = Partial<
  Record<keyof WeeklyReportFormState, string>
>;

type WeeklyReportFormProps = {
  project: Project;
  /** Doluysa form duzenleme modunda acilir (On Analiz 7.4). */
  report?: WeeklyReport | null;
  onReportSaved: (report: WeeklyReport) => void;
  onCancel: () => void;
};

const initialReportForm: WeeklyReportFormState = {
  reportWeekStart: "",
  targetProgress: "",
  actualProgress: "",
  generalStatus: "PLANNED",
  scheduleStatus: "ON_TRACK",
  completedSummary: "",
  nextWeekPlan: "",
  blockers: "",
  generalNote: "",
};

const toFormState = (report: WeeklyReport): WeeklyReportFormState => ({
  reportWeekStart: report.reportWeekStart,
  targetProgress: String(report.targetProgress),
  actualProgress: String(report.actualProgress),
  generalStatus: report.generalStatus,
  scheduleStatus: report.scheduleStatus,
  completedSummary: report.completedSummary ?? "",
  nextWeekPlan: report.nextWeekPlan ?? "",
  blockers: report.blockers ?? "",
  generalNote: report.generalNote ?? "",
});

function WeeklyReportForm({
  project,
  report = null,
  onReportSaved,
  onCancel,
}: WeeklyReportFormProps) {
  const isEditMode = report !== null;

  const [reportForm, setReportForm] = useState<WeeklyReportFormState>(() =>
    report ? toFormState(report) : initialReportForm,
  );

  const [fieldErrors, setFieldErrors] = useState<WeeklyReportFieldErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const clearMessages = () => {
    setErrorMessage("");
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

    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      [field]: undefined,
    }));
  };

  const validateForm = () => {
    const nextErrors: WeeklyReportFieldErrors = {};

    if (!reportForm.reportWeekStart) {
      nextErrors.reportWeekStart = "Rapor haftası zorunludur.";
    }

    if (!reportForm.targetProgress.trim()) {
      nextErrors.targetProgress = "Hedeflenen ilerleme zorunludur.";
    } else {
      const targetProgress = Number(reportForm.targetProgress);

      if (
        !Number.isInteger(targetProgress) ||
        targetProgress < 0 ||
        targetProgress > 100
      ) {
        nextErrors.targetProgress = "0 ile 100 arasında tam sayı girilmelidir.";
      }
    }

    if (!reportForm.actualProgress.trim()) {
      nextErrors.actualProgress = "Gerçekleşen ilerleme zorunludur.";
    } else {
      const actualProgress = Number(reportForm.actualProgress);

      if (
        !Number.isInteger(actualProgress) ||
        actualProgress < 0 ||
        actualProgress > 100
      ) {
        nextErrors.actualProgress = "0 ile 100 arasında tam sayı girilmelidir.";
      }
    }

    if (!reportForm.completedSummary.trim()) {
      nextErrors.completedSummary = "Yapılanlar alanı zorunludur.";
    }

    if (!reportForm.nextWeekPlan.trim()) {
      nextErrors.nextWeekPlan = "Gelecek hafta yapılacaklar alanı zorunludur.";
    }

    setFieldErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const getApiErrorMessage = (error: unknown) => {
    const fallbackMessage = isEditMode
      ? "Haftalık rapor güncellenirken bir hata oluştu."
      : "Haftalık rapor oluşturulurken bir hata oluştu.";

    if (!axios.isAxiosError(error)) {
      return fallbackMessage;
    }

    if (error.response?.status === 409) {
      return "Bu proje için seçilen haftada zaten bir rapor bulunuyor.";
    }

    if (error.response?.status === 403) {
      return "Bu rapor üzerinde işlem yapma yetkiniz bulunmuyor.";
    }

    const responseData = error.response?.data as
      | { message?: string }
      | undefined;

    return responseData?.message ?? fallbackMessage;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();

    if (!validateForm()) {
      return;
    }

    const targetProgress = Number(reportForm.targetProgress);
    const actualProgress = Number(reportForm.actualProgress);

    const request: WeeklyReportCreateRequest = {
      reportWeekStart: reportForm.reportWeekStart,
      targetProgress,
      actualProgress,
      generalStatus: reportForm.generalStatus,
      scheduleStatus: reportForm.scheduleStatus,
      completedSummary: reportForm.completedSummary.trim(),
      nextWeekPlan: reportForm.nextWeekPlan.trim(),
      blockers: reportForm.blockers.trim(),
      generalNote: reportForm.generalNote.trim(),
    };

    setIsSubmitting(true);

    try {
      const savedReport = report
        ? await updateWeeklyReport(project.id, report.id, request)
        : await createWeeklyReport(project.id, request);

      onReportSaved(savedReport);

      if (!report) {
        setReportForm(initialReportForm);
      }

      setFieldErrors({});
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "action.hover",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mb: 0.25,
              fontWeight: 800,
            }}
          >
            Proje
          </Typography>

          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            {project.name}
          </Typography>
        </Box>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(6, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          <TextField
            label="Rapor haftası"
            type="date"
            value={reportForm.reportWeekStart}
            onChange={(event) =>
              updateFormField("reportWeekStart", event.target.value)
            }
            error={Boolean(fieldErrors.reportWeekStart)}
            helperText={
              fieldErrors.reportWeekStart ??
              "Seçilen tarihin bulunduğu haftaya kaydedilir."
            }
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            required
            fullWidth
            sx={{
              gridColumn: {
                md: "span 2",
              },
            }}
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
            sx={{
              gridColumn: {
                md: "span 2",
              },
            }}
          >
            {Object.entries(generalStatusLabels).map(([status, label]) => (
              <MenuItem key={status} value={status}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Hedeflenen ilerleme (%)"
            type="number"
            value={reportForm.targetProgress}
            onChange={(event) =>
              updateFormField("targetProgress", event.target.value)
            }
            error={Boolean(fieldErrors.targetProgress)}
            helperText={fieldErrors.targetProgress}
            slotProps={{
              htmlInput: {
                min: 0,
                max: 100,
                step: 1,
              },
            }}
            required
            fullWidth
            sx={{
              gridColumn: {
                md: "span 2",
              },
            }}
          />

          <TextField
            label="Gerçekleşen ilerleme (%)"
            type="number"
            value={reportForm.actualProgress}
            onChange={(event) =>
              updateFormField("actualProgress", event.target.value)
            }
            error={Boolean(fieldErrors.actualProgress)}
            helperText={fieldErrors.actualProgress}
            slotProps={{
              htmlInput: {
                min: 0,
                max: 100,
                step: 1,
              },
            }}
            required
            fullWidth
            sx={{
              gridColumn: {
                md: "span 2",
              },
            }}
          />

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
            sx={{
              gridColumn: {
                md: "span 2",
              },
            }}
          >
            {Object.entries(scheduleStatusLabels).map(([status, label]) => (
              <MenuItem key={status} value={status}>
                {label}
              </MenuItem>
            ))}
          </TextField>

          {/*
            Risk seviyesi artik form alani degildir: rapora bagli acik
            risk/engel kayitlarindan turetilir (bkz. RiskLevelResolver).
            Kullanici seviyeyi dogrudan secebilseydi kayitli risklerle
            celisebilirdi.
          */}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          <TextField
            label="Yapılanlar"
            value={reportForm.completedSummary}
            onChange={(event) =>
              updateFormField("completedSummary", event.target.value)
            }
            error={Boolean(fieldErrors.completedSummary)}
            helperText={fieldErrors.completedSummary}
            multiline
            minRows={2}
            required
            fullWidth
          />

          <TextField
            label="Gelecek hafta yapılacaklar"
            value={reportForm.nextWeekPlan}
            onChange={(event) =>
              updateFormField("nextWeekPlan", event.target.value)
            }
            error={Boolean(fieldErrors.nextWeekPlan)}
            helperText={fieldErrors.nextWeekPlan}
            multiline
            minRows={3}
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
            minRows={2}
            fullWidth
          />

          <TextField
            label="Genel not"
            value={reportForm.generalNote}
            onChange={(event) =>
              updateFormField("generalNote", event.target.value)
            }
            multiline
            minRows={2}
            fullWidth
          />
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
            variant="text"
            color="inherit"
            onClick={onCancel}
            disabled={isSubmitting}
            sx={{ color: "text.secondary" }}
          >
            İptal
          </Button>

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting
              ? "Kaydediliyor..."
              : isEditMode
                ? "Değişiklikleri kaydet"
                : "Rapor oluştur"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default WeeklyReportForm;
