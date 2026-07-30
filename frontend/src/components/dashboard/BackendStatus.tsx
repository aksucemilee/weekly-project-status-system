import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useCallback, useEffect, useState } from "react";

import apiClient from "../../api/apiClient";

type HealthResponse = {
  status: string;
  message: string;
};

function BackendStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchBackendStatus = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await apiClient.get<HealthResponse>("/health");
      setHealth(response.data);
    } catch {
      setHealth(null);
      setErrorMessage("Backend bağlantısı kurulamadı.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBackendStatus();
  }, [fetchBackendStatus]);

  if (isLoading) {
    return (
      <Paper
        sx={{
          minHeight: 240,
          p: 3,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Stack
          spacing={2}
          sx={{
            alignItems: "center",
          }}
        >
          <CircularProgress size={30} />

          <Typography color="text.secondary">
            Backend bağlantısı kontrol ediliyor...
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (errorMessage) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                void fetchBackendStatus();
              }}
            >
              Tekrar Dene
            </Button>
          }
        >
          {errorMessage}
        </Alert>
      </Paper>
    );
  }

  const isBackendRunning = health?.status === "UP";

  return (
    <Paper
      sx={{
        height: "100%",
        p: 3,
      }}
    >
      <Stack spacing={3}>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 800 }}
            >
              Sistem Durumu
            </Typography>

            <Typography variant="h5" component="h2" sx={{ mt: 0.5 }}>
              Backend Bağlantısı
            </Typography>
          </Box>

          <Chip
            label={
              isBackendRunning ? "Çalışıyor" : (health?.status ?? "Bilinmiyor")
            }
            color={isBackendRunning ? "success" : "warning"}
            size="small"
          />
        </Stack>

        <Box
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            border: "1px solid",
            borderRadius: 2.5,
            borderColor: isBackendRunning
              ? alpha(theme.palette.success.main, 0.22)
              : alpha(theme.palette.warning.main, 0.22),
            backgroundColor: isBackendRunning
              ? alpha(theme.palette.success.main, 0.06)
              : alpha(theme.palette.warning.main, 0.06),
          })}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: 12,
              height: 12,
              flexShrink: 0,
              borderRadius: "50%",
              backgroundColor: isBackendRunning
                ? "success.main"
                : "warning.main",
              boxShadow: isBackendRunning
                ? "0 0 0 6px rgba(22, 163, 74, 0.10)"
                : "0 0 0 6px rgba(217, 119, 6, 0.10)",
            }}
          />

          <Box>
            <Typography sx={{ fontWeight: 700 }}>
              {isBackendRunning
                ? "Backend API erişilebilir durumda"
                : "Backend durumu kontrol edilmeli"}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {health?.message ?? "Sağlık kontrolü sonucu alınamadı."}
            </Typography>
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Kontrol edilen endpoint
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              fontFamily: "monospace",
            }}
          >
            /api/health
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default BackendStatus;
