import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link, Outlet } from "react-router";

function MainLayout() {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
          >
            Haftalık Proje Durum Sistemi
          </Typography>

          <Button
            component={Link}
            to="/dashboard"
            color="inherit"
          >
            Dashboard
          </Button>

          <Button
            component={Link}
            to="/projects"
            color="inherit"
          >
            Projeler
          </Button>

          <Button
            component={Link}
            to="/reports"
            color="inherit"
          >
            Raporlar
          </Button>

          <Button
            component={Link}
            to="/admin"
            color="inherit"
          >
            Admin
          </Button>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        maxWidth="lg"
        sx={{ py: 4 }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}

export default MainLayout;