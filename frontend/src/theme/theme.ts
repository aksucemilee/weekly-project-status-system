import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#2563EB",
      dark: "#1D4ED8",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#7C3AED",
    },

    background: {
      default: "#F5F7FB",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#172033",
      secondary: "#667085",
    },

    divider: "#E7EAF0",

    success: {
      main: "#16A34A",
    },

    warning: {
      main: "#D97706",
    },

    error: {
      main: "#DC2626",
    },
  },

  shape: {
    borderRadius: 14,
  },

  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    h1: {
      fontSize: "2rem",
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },

    h4: {
      fontWeight: 800,
      letterSpacing: "-0.03em",
    },

    h5: {
      fontWeight: 750,
      letterSpacing: "-0.02em",
    },

    h6: {
      fontWeight: 700,
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
          backgroundColor: "#F5F7FB",
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #E7EAF0",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
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

    MuiTextField: {
      defaultProps: {
        size: "small",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#FFFFFF",
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
  },
});

export default theme;