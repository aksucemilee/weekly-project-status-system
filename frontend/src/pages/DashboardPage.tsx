import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import PageHeader from "../components/common/PageHeader";
import DashboardProjectTable from "../components/dashboard/DashboardProjectTable";
import DashboardSummaryCards from "../components/dashboard/DashboardSummaryCards";
import EmptyState from "../components/feedback/EmptyState";
import { getDashboardSummary } from "../services/dashboardService";
import { layoutTokens } from "../theme/layoutTokens";
import type { DashboardSummary } from "../types/dashboard";

function DashboardPage() {
  const [dashboardSummary, setDashboardSummary] =
    useState<DashboardSummary | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const summary = await getDashboardSummary();
      setDashboardSummary(summary);
    } catch {
      setDashboardSummary(null);
      setErrorMessage("Dashboard bilgileri yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <Box>
      <PageHeader
        title="CTO Dashboard"
        description="Projelerin son haftalık durumlarını, ilerleme oranlarını, risklerini ve aktif iş sayılarını tek ekrandan karşılaştırın."
      />

      {isLoading && (
        <Paper
          sx={{
            minHeight: 240,
            display: "grid",
            placeItems: "center",
            p: 3,
          }}
        >
          <Stack spacing={2} sx={{ alignItems: "center" }}>
            <CircularProgress size={32} />

            <Typography color="text.secondary">
              Dashboard bilgileri yükleniyor...
            </Typography>
          </Stack>
        </Paper>
      )}

      {!isLoading && errorMessage && (
        <Paper sx={{ p: 3 }}>
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => void loadDashboard()}
              >
                Tekrar dene
              </Button>
            }
          >
            {errorMessage}
          </Alert>
        </Paper>
      )}

      {!isLoading &&
        !errorMessage &&
        dashboardSummary &&
        dashboardSummary.projects.length === 0 && (
          <EmptyState
            label="Proje bulunamadı"
            title="Dashboard için görüntülenecek proje yok"
            description="Aktif bir proje oluşturulduğunda portföy özeti ve proje sağlık bilgileri bu alanda görüntülenecektir."
          />
        )}

      {!isLoading &&
        !errorMessage &&
        dashboardSummary &&
        dashboardSummary.projects.length > 0 && (
          <Stack
            sx={{
              gap: layoutTokens.spacing.section,
            }}
          >
            <DashboardSummaryCards summary={dashboardSummary} />

            <DashboardProjectTable projects={dashboardSummary.projects} />
          </Stack>
        )}
    </Box>
  );
}

export default DashboardPage;
