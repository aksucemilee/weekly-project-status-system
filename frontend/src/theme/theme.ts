import { alpha, createTheme } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";

const createAppTheme = (mode: PaletteMode) => {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,

      primary: {
        main: isLight ? "#2563EB" : "#60A5FA",
        dark: isLight ? "#1D4ED8" : "#3B82F6",
        light: isLight ? "#DBEAFE" : "#1E3A8A",
        contrastText: "#FFFFFF",
      },

      secondary: {
        main: isLight ? "#7C3AED" : "#A78BFA",
      },

      background: {
        default: isLight ? "#F4F6FA" : "#0B1120",
        paper: isLight ? "#FFFFFF" : "#111827",
      },

      text: {
        primary: isLight ? "#172033" : "#F3F4F6",
        secondary: isLight ? "#667085" : "#9CA3AF",
      },

      divider: isLight ? "rgba(15, 23, 42, 0.10)" : "rgba(255, 255, 255, 0.10)",

      success: {
        main: isLight ? "#16A34A" : "#4ADE80",
      },

      warning: {
        main: isLight ? "#D97706" : "#FBBF24",
      },

      error: {
        main: isLight ? "#DC2626" : "#F87171",
      },

      info: {
        main: isLight ? "#0284C7" : "#38BDF8",
      },
    },

    shape: {
      borderRadius: 14,
    },

    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

      h1: {
        fontSize: "1.75rem",
        fontWeight: 800,
        lineHeight: 1.25,
        letterSpacing: "-0.025em",
      },

      h4: {
        fontSize: "1.5rem",
        fontWeight: 800,
        lineHeight: 1.3,
        letterSpacing: "-0.025em",
      },

      h5: {
        fontSize: "1.25rem",
        fontWeight: 750,
        lineHeight: 1.35,
        letterSpacing: "-0.015em",
      },

      h6: {
        fontSize: "1.05rem",
        fontWeight: 700,
        lineHeight: 1.4,
      },

      button: {
        textTransform: "none",
        fontWeight: 700,
      },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            minHeight: "100vh",
            backgroundColor: isLight ? "#F4F6FA" : "#0B1120",
            transition: "background-color 180ms ease, color 180ms ease",
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: `1px solid ${
              isLight ? "rgba(15, 23, 42, 0.10)" : "rgba(255, 255, 255, 0.10)"
            }`,
            boxShadow: isLight
              ? "0 10px 28px rgba(15, 23, 42, 0.06)"
              : "0 12px 34px rgba(0, 0, 0, 0.24)",
          },
        },
      },

      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },

        styleOverrides: {
          root: {
            minHeight: 40,
            paddingLeft: 16,
            paddingRight: 16,
            borderRadius: 10,
          },
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },

      MuiTextField: {
        defaultProps: {
          size: "small",
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            backgroundColor: isLight ? "#FFFFFF" : alpha("#FFFFFF", 0.035),
          },
        },
      },

      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 700,
          },
        },
      },

      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            boxShadow: isLight
              ? "0 24px 70px rgba(15, 23, 42, 0.20)"
              : "0 24px 70px rgba(0, 0, 0, 0.48)",
          },
        },
      },

      MuiTabs: {
        styleOverrides: {
          root: {
            minHeight: 44,
          },
          indicator: {
            height: 3,
            borderRadius: 999,
          },
        },
      },

      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 44,
            textTransform: "none",
            fontWeight: 700,
          },
        },
      },
    },
  });
};

export { createAppTheme };
export default createAppTheme;
