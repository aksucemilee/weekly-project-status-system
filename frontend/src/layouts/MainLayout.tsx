import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link, Outlet, useLocation } from "react-router";

type NavigationItem = {
  label: string;
  path: string;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    label: "Projeler",
    path: "/projects",
  },
  {
    label: "Raporlar",
    path: "/reports",
  },
  {
    label: "Admin",
    path: "/admin",
  },
];

function MainLayout() {
  const location = useLocation();

  const isNavigationItemActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 64,
                md: 72,
              },
              gap: 2,
            }}
          >
            <Box
              component={Link}
              to="/dashboard"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 38,
                  height: 38,
                  borderRadius: 2.5,
                  color: "common.white",
                  background:
                    "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                  boxShadow: "0 8px 18px rgba(37, 99, 235, 0.25)",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  K
                </Typography>
              </Box>

              <Box
                sx={{
                  display: {
                    xs: "none",
                    sm: "block",
                  },
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "text.primary",
                    fontWeight: 800,
                    lineHeight: 1.2,
                  }}
                >
                  Haftalık Proje
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.2,
                  }}
                >
                  Durum Takip Sistemi
                </Typography>
              </Box>
            </Box>

            <Stack
              component="nav"
              direction="row"
              spacing={0.5}
              sx={{
                ml: "auto",
                py: 0.5,
                overflowX: "auto",
                scrollbarWidth: "none",

                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              {navigationItems.map((navigationItem) => {
                const isActive = isNavigationItemActive(navigationItem.path);

                return (
                  <Button
                    key={navigationItem.path}
                    component={Link}
                    to={navigationItem.path}
                    size="small"
                    aria-current={isActive ? "page" : undefined}
                    sx={{
                      flexShrink: 0,
                      color: isActive
                        ? "primary.contrastText"
                        : "text.secondary",
                      backgroundColor: isActive
                        ? "primary.main"
                        : "transparent",

                      "&:hover": {
                        color: isActive
                          ? "primary.contrastText"
                          : "text.primary",
                        backgroundColor: isActive
                          ? "primary.dark"
                          : "action.hover",
                      },
                    }}
                  >
                    {navigationItem.label}
                  </Button>
                );
              })}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container
        component="main"
        maxWidth="xl"
        sx={{
          px: {
            xs: 2,
            sm: 3,
            md: 4,
          },
          py: {
            xs: 3,
            md: 5,
          },
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}

export default MainLayout;
