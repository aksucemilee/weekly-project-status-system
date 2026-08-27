import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import type { PaletteMode } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import createAppTheme from "./theme";
import { ColorModeContext } from "./ColorModeContext";
import type { ColorModeContextValue } from "./ColorModeContext";

type ColorModeProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = "weekly-project-status-color-mode";

const getInitialMode = (): PaletteMode => {
  const storedMode = window.localStorage.getItem(STORAGE_KEY);

  if (storedMode === "light" || storedMode === "dark") {
    return storedMode;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export function ColorModeProvider({ children }: ColorModeProviderProps) {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const contextValue = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((currentMode) => (currentMode === "light" ? "dark" : "light"));
      },
    }),
    [mode],
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
