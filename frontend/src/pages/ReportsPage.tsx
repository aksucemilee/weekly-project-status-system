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

import { getProjects } from "../services/projectService";
import {
  createWeeklyReport,
  getWeeklyReportsByProject,
} from "../services/weeklyReportService";
import type { Project } from "../types/project";
import type {
  GeneralStatus,
  RiskLevel,
  ScheduleStatus,
  WeeklyReport,
  WeeklyReportCreateRequest,
} from "../types/weeklyReport";

type WeeklyReportFormState = Omit<
  WeeklyReportCreateRequest,
  "targetProgress" | "actualProgress"
> & {
  targetProgress: string;
  actualProgress: string;
};

const generalStatusLabels: Record<GeneralStatus, string> = {
  PLANNED: "Planlandı",
  IN_PROGRESS: "Devam Ediyor",
  IN_TEST: "Testte",
  COMPLETED: "Tamamlandı",
  DELAYED: "Gecikti",
  AT_RISK: "Riskli",
  BLOCKED: "Bloke",
};

const scheduleStatusLabels: Record<ScheduleStatus, string> = {
  ON_TRACK: "Takvime Uygun",
  DELAYED: "Gecikmiş",
};

const riskLevelLabels: Record<RiskLevel, string> = {
  LOW: "Düşük",
  MEDIUM: "Orta",
  HIGH: "Yüksek",
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

function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [reportForm, setReportForm] =
    useState<WeeklyReportFormState>(initialReportForm);

  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isReportsLoading, setIsReportsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [projectErrorMessage, setProjectErrorMessage] = useState("");
  const [reportListErrorMessage, setReportListErrorMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectList = await getProjects();

        setProjects(projectList);

        if (projectList.length > 0) {
          setSelectedProjectId(String(projectList[0].id));
        }
      } catch {
        setProjectErrorMessage("Projeler yüklenirken bir hata oluştu.");
      } finally {
        setIsProjectsLoading(false);
      }
    };

    void loadProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setReports([]);
      return;
    }

    const loadReports = async () => {
      setIsReportsLoading(true);
      setReportListErrorMessage("");
      setReports([]);

      try {
        const reportList = await getWeeklyReportsByProject(
          Number(selectedProjectId),
        );

        setReports(reportList);
      } catch {
        setReportListErrorMessage(
          "Haftalık raporlar yüklenirken bir hata oluştu.",
        );
      } finally {
        setIsReportsLoading(false);
      }
    };

    void loadReports();
  }, [selectedProjectId]);

  const updateFormField = <K extends keyof WeeklyReportFormState>(
    field: K,
    value: WeeklyReportFormState[K],
  ) => {
    setSuccessMessage("");
    setFormErrorMessage("");

    setReportForm((previousForm) => ({
      ...previousForm,
      [field]: value,
    }));
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    setFormErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setFormErrorMessage("");
    setSuccessMessage("");

    if (!selectedProjectId) {
      setFormErrorMessage("Bir proje seçmelisin.");
      return;
    }

    if (!reportForm.reportWeekStart) {
      setFormErrorMessage("Rapor haftası zorunludur.");
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
      setFormErrorMessage(
        "Hedeflenen ve gerçekleşen ilerleme 0 ile 100 arasında tam sayı olmalıdır.",
      );
      return;
    }

    if (
      !reportForm.completedSummary.trim() ||
      !reportForm.nextWeekPlan.trim()
    ) {
      setFormErrorMessage("Yapılanlar ve yapılacaklar alanları zorunludur.");
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

      setReports((previousReports) => [createdReport, ...previousReports]);

      setReportForm(initialReportForm);
      setSuccessMessage("Haftalık rapor başarıyla oluşturuldu.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setFormErrorMessage(
          "Bu proje için seçilen haftada zaten bir rapor bulunuyor.",
        );
      } else {
        setFormErrorMessage("Haftalık rapor oluşturulurken bir hata oluştu.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Haftalık Raporlar
      </Typography>

      {isProjectsLoading && (
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

      {!isProjectsLoading && projectErrorMessage && (
        <Alert severity="error">{projectErrorMessage}</Alert>
      )}

      {!isProjectsLoading && !projectErrorMessage && projects.length === 0 && (
        <Alert severity="info">
          Haftalık rapor oluşturabilmek için önce bir proje oluşturulmalıdır.
        </Alert>
      )}

      {!isProjectsLoading && !projectErrorMessage && projects.length > 0 && (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Yeni Haftalık Rapor
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
              onInvalidCapture={() => {
                setSuccessMessage("");
                setFormErrorMessage("");
              }}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <TextField
                select
                label="Proje"
                value={selectedProjectId}
                onChange={(event) => handleProjectChange(event.target.value)}
                required
                fullWidth
                sx={{
                  gridColumn: {
                    md: "span 2",
                  },
                }}
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
                sx={{
                  gridColumn: {
                    md: "1 / -1",
                  },
                }}
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
                sx={{
                  gridColumn: {
                    md: "1 / -1",
                  },
                }}
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
                sx={{
                  gridColumn: {
                    md: "1 / -1",
                  },
                }}
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
                sx={{
                  gridColumn: {
                    md: "1 / -1",
                  },
                }}
              />

              <Box
                sx={{
                  gridColumn: {
                    md: "1 / -1",
                  },
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Kaydediliyor..." : "Rapor Oluştur"}
                </Button>
              </Box>
            </Box>
          </Paper>

          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            Rapor Listesi
          </Typography>

          {isReportsLoading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 4,
              }}
            >
              <CircularProgress size={28} />
              <Typography>Haftalık raporlar yükleniyor...</Typography>
            </Box>
          )}

          {!isReportsLoading && reportListErrorMessage && (
            <Alert severity="error">{reportListErrorMessage}</Alert>
          )}

          {!isReportsLoading &&
            !reportListErrorMessage &&
            reports.length === 0 && (
              <Alert severity="info">
                Seçilen proje için henüz haftalık rapor bulunmuyor.
              </Alert>
            )}

          {!isReportsLoading &&
            !reportListErrorMessage &&
            reports.length > 0 && (
              <Stack spacing={2}>
                {reports.map((report) => (
                  <Paper key={report.id} sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="h6" component="h3">
                          {report.projectName}
                        </Typography>

                        <Typography color="text.secondary">
                          Hafta başlangıcı: {report.reportWeekStart}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        sx={{ flexWrap: "wrap" }}
                      >
                        <Chip
                          label={generalStatusLabels[report.generalStatus]}
                        />

                        <Chip
                          label={scheduleStatusLabels[report.scheduleStatus]}
                        />

                        <Chip
                          label={`Risk: ${riskLevelLabels[report.riskLevel]}`}
                        />
                      </Stack>
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
                      <Typography>
                        <strong>Hedeflenen:</strong> %{report.targetProgress}
                      </Typography>

                      <Typography>
                        <strong>Gerçekleşen:</strong> %{report.actualProgress}
                      </Typography>

                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          Yapılanlar
                        </Typography>
                        <Typography>
                          {report.completedSummary || "Bilgi girilmedi."}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          Yapılacaklar
                        </Typography>
                        <Typography>
                          {report.nextWeekPlan || "Bilgi girilmedi."}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          Engeller
                        </Typography>
                        <Typography>
                          {report.blockers || "Engel belirtilmedi."}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          Genel not
                        </Typography>
                        <Typography>
                          {report.generalNote || "Not girilmedi."}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            )}
        </>
      )}
    </Box>
  );
}

export default ReportsPage;
