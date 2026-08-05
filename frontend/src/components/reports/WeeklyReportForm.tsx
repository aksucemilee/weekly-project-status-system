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
  project: Project;
  onReportCreated: (report: WeeklyReport) => void;
  onCancel: () => void;
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
  project,
  onReportCreated,
  onCancel,
}: WeeklyReportFormProps) {
  const [reportForm, setReportForm] =
    useState<WeeklyReportFormState>(initialReportForm);

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
      const createdReport = await createWeeklyReport(project.id, request);

      onReportCreated(createdReport);
      setReportForm(initialReportForm);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      onInvalidCapture={clearMessages}
    >
      <Stack spacing={2.5}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2.5,
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
            Rapor oluşturulan proje
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
            },
            gap: 2,
          }}
        >
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
            label="Yapılanlar"
            value={reportForm.completedSummary}
            onChange={(event) =>
              updateFormField("completedSummary", event.target.value)
            }
            multiline
            minRows={3}
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
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            İptal
          </Button>

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Rapor Oluştur"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default WeeklyReportForm;
