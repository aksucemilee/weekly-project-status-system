import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router";

import { useAuth } from "../auth/authContext";
import { getLandingPath } from "../types/auth";

function LoginPage() {
  const { user, isLoading, signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Oturum acikken giris ekranina gelinirse rolun baslangic ekranina
  // yonlendirilir.
  if (!isLoading && user) {
    return <Navigate to={getLandingPath(user)} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const signedInUser = await signIn(email.trim(), password);

      navigate(getLandingPath(signedInUser), { replace: true });
    } catch {
      // Backend hangi alanin yanlis oldugunu bilerek acikliyor degil;
      // arayuz de ayni sekilde genel bir mesaj gosterir.
      setErrorMessage("E-posta veya parola hatalı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: {
          xs: 2,
          sm: 3,
        },
        backgroundColor: "background.default",
      }}
    >
      <Paper
        component="section"
        sx={{
          width: "100%",
          maxWidth: 460,
          p: {
            xs: 2.5,
            sm: 4,
          },
        }}
      >
        <Stack component="form" spacing={3} onSubmit={handleSubmit}>
          <Box>
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 46,
                height: 46,
                mb: 2,
                borderRadius: 3,
                color: "common.white",
                background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              }}
            >
              <Typography component="span" sx={{ fontWeight: 900 }}>
                K
              </Typography>
            </Box>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                mb: 0.75,
                fontSize: {
                  xs: "1.75rem",
                  sm: "2rem",
                },
              }}
            >
              Giriş yap
            </Typography>

            <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
              Haftalık proje durum takip sistemine erişmek için e-posta
              adresinizi ve parolanızı girin.
            </Typography>
          </Box>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label="E-posta"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={isSubmitting}
            required
            fullWidth
          />

          <TextField
            label="Parola"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={isSubmitting}
            required
            fullWidth
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting || !email || !password}
            fullWidth
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Giriş Yap"
            )}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default LoginPage;
