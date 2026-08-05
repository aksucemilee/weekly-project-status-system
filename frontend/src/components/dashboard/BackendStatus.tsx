import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import apiClient from "../../api/apiClient";

type HealthResponse = {
  status: string;
  message: string;
};

function BackendStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchBackendStatus = async () => {
      setErrorMessage("");

      try {
        const response = await apiClient.get<HealthResponse>("/health");

        if (isActive) {
          setHealth(response.data);
        }
      } catch {
        if (isActive) {
          setErrorMessage("Backend bağlantısı kurulamadı.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void fetchBackendStatus();

    return () => {
      isActive = false;
    };
  }, []);

  if (isLoading) {
    return (
      <Paper
        sx={{
          minHeight: 260,
          display: "grid",
          placeItems: "center",
          p: 3,
        }}
      >
        <Stack spacing={1.5} sx={{ alignItems: "center" }}>
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
      <Paper
        sx={{
          minHeight: 260,
          p: 3,
        }}
      >
        <Typography
          variant="overline"
          color="error.main"
          sx={{ fontWeight: 900 }}
        >
          Sistem durumu
        </Typography>

        <Typography variant="h5" component="h2" sx={{ mt: 0.25, mb: 2 }}>
          Backend bağlantısı
        </Typography>

        <Alert severity="error">{errorMessage}</Alert>
      </Paper>
    );
  }

  const isHealthy = health?.status === "UP" || health?.status === "OK";

  return (
    <Paper
      component="section"
      sx={{
        minHeight: 260,
        p: {
          xs: 2.5,
          md: 3,
        },
      }}
    >
      <Stack spacing={2.5}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              color="success.main"
              sx={{ fontWeight: 900 }}
            >
              Sistem durumu
            </Typography>

            <Typography variant="h5" component="h2" sx={{ mt: 0.25 }}>
              Backend bağlantısı
            </Typography>
          </Box>

          <Chip
            label={
              isHealthy ? "Bağlantı aktif" : health?.status || "Bilinmiyor"
            }
            color={isHealthy ? "success" : "warning"}
            size="small"
            variant="outlined"
          />
        </Box>

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
              mb: 0.5,
              fontWeight: 800,
            }}
          >
            Servis mesajı
          </Typography>

          <Typography sx={{ lineHeight: 1.7 }}>
            {health?.message || "Backend servisi isteklere yanıt veriyor."}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Bu kontrol, frontend uygulamasının Spring Boot API'ye erişebildiğini
          gösterir.
        </Typography>
      </Stack>
    </Paper>
  );
}

export default BackendStatus;
