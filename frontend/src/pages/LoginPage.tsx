import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

function LoginPage() {
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
        <Stack spacing={3}>
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
              adresinizi girin.
            </Typography>
          </Box>

          <TextField
            label="E-posta"
            type="email"
            autoComplete="email"
            fullWidth
          />

          <Button type="button" variant="contained" size="large" fullWidth>
            Giriş Yap
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

export default LoginPage;
