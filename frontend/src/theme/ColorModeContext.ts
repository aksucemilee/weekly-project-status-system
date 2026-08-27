import { createContext, useContext } from "react";
import type { PaletteMode } from "@mui/material";

export type ColorModeContextValue = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

export const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export const useColorMode = () => {
  const context = useContext(ColorModeContext);

  if (!context) {
    throw new Error("useColorMode, ColorModeProvider içinde kullanılmalıdır.");
  }

  return context;
};
