import { Alert, Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router";

import { useAuth } from "./authContext";
import type { PermissionCode } from "../types/auth";

type RequirePermissionProps = {
  permission?: PermissionCode;
};

/**
 * Route guard.
 *
 * Oturum yoksa /login'e yonlendirir. Oturum var ama gerekli yetki yoksa
 * yonlendirme yapmadan erisim reddi ekrani gosterir; boylece kullanici
 * neden giremedigini gorur.
 *
 * Bu yalnizca kullanici deneyimidir, guvenlik kontrolu degil: ayni
 * kurallar backend'de de uygulanir ve dogrudan API cagrisi 403 doner.
 */
function RequirePermission({ permission }: RequirePermissionProps) {
  const { user, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Stack spacing={2} sx={{ alignItems: "center" }}>
          <CircularProgress size={30} />

          <Typography color="text.secondary">
            Oturum bilgisi kontrol ediliyor...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (permission && !hasPermission(permission)) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="warning">
          Bu sayfayı görüntüleme yetkiniz bulunmuyor.
        </Alert>
      </Paper>
    );
  }

  return <Outlet />;
}

export default RequirePermission;
