import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";

import { useColorMode } from "../theme/ColorModeProvider";
import { layoutTokens } from "../theme/layoutTokens";

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
  const theme = useTheme();
  const location = useLocation();
  const { mode, toggleColorMode } = useColorMode();

  const isMobileNavigation = useMediaQuery(theme.breakpoints.down("md"));

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  const isNavigationItemActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const renderThemeButton = () => (
    <Tooltip title={mode === "light" ? "Koyu temaya geç" : "Açık temaya geç"}>
      <IconButton
        type="button"
        onClick={toggleColorMode}
        aria-label={mode === "light" ? "Koyu temaya geç" : "Açık temaya geç"}
        sx={{
          width: 40,
          height: 40,
          border: "1px solid",
          borderColor: "divider",
          color: "text.primary",
          backgroundColor: "background.paper",

          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <Typography
          component="span"
          aria-hidden="true"
          sx={{
            fontSize: 20,
            lineHeight: 1,
          }}
        >
          {mode === "light" ? "☾" : "☀"}
        </Typography>
      </IconButton>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        minWidth: 0,
        backgroundColor: "background.default",
        transition: "background-color 180ms ease",
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          backgroundColor: alpha(
            theme.palette.background.paper,
            mode === "light" ? 0.88 : 0.82,
          ),
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Container
          maxWidth={layoutTokens.page.maxWidth}
          sx={{
            maxWidth: `${layoutTokens.page.contentMaxWidth}px`,
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 60,
                md: 64,
              },
              gap: {
                xs: 1,
                md: 2,
              },
            }}
          >
            <Box
              component={Link}
              to="/dashboard"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                minWidth: 0,
                flexShrink: 1,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 38,
                  height: 38,
                  flexShrink: 0,
                  borderRadius: 2.5,
                  color: "common.white",
                  background:
                    "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                  boxShadow: "0 8px 20px rgba(37, 99, 235, 0.26)",
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
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "text.primary",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  Haftalık Proje
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                  }}
                >
                  Durum Takip Sistemi
                </Typography>
              </Box>
            </Box>

            {!isMobileNavigation && (
              <Stack
                component="nav"
                spacing={0.5}
                sx={{
                  ml: "auto",
                  flexDirection: "row",
                  alignItems: "center",
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
                        minWidth: 78,
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
            )}

            <Stack
              spacing={1}
              sx={{
                ml: "auto",
                flexDirection: "row",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {renderThemeButton()}

              {isMobileNavigation && (
                <IconButton
                  type="button"
                  aria-label="Ana menüyü aç"
                  aria-expanded={isDrawerOpen}
                  onClick={() => setIsDrawerOpen(true)}
                  sx={{
                    width: 40,
                    height: 40,
                    border: "1px solid",
                    borderColor: "divider",
                    color: "text.primary",
                    backgroundColor: "background.paper",

                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <Typography
                    component="span"
                    aria-hidden="true"
                    sx={{
                      fontSize: 22,
                      lineHeight: 1,
                    }}
                  >
                    ☰
                  </Typography>
                </IconButton>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={isMobileNavigation && isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: {
              xs: "min(84vw, 300px)",
              sm: 300,
            },
            p: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 1.5,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
              Menü
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Uygulama bölümleri
            </Typography>
          </Box>

          <IconButton
            type="button"
            aria-label="Ana menüyü kapat"
            onClick={() => setIsDrawerOpen(false)}
          >
            <Typography
              component="span"
              aria-hidden="true"
              sx={{
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              ×
            </Typography>
          </IconButton>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <List disablePadding>
          {navigationItems.map((navigationItem) => {
            const isActive = isNavigationItemActive(navigationItem.path);

            return (
              <ListItemButton
                key={navigationItem.path}
                component={Link}
                to={navigationItem.path}
                selected={isActive}
                aria-current={isActive ? "page" : undefined}
                sx={{
                  mb: 0.75,
                  borderRadius: 2,

                  "&.Mui-selected": {
                    color: "primary.main",
                    backgroundColor: "action.selected",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: isActive ? 800 : 650,
                      }}
                    >
                      {navigationItem.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Container
        component="main"
        maxWidth={layoutTokens.page.maxWidth}
        sx={{
          minWidth: 0,
          maxWidth: `${layoutTokens.page.contentMaxWidth}px`,
          px: layoutTokens.page.paddingX,
          py: layoutTokens.page.paddingY,
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}

export default MainLayout;
