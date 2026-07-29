import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
} from "@mui/material";

import "./index.css";
import App from "./App";

const theme = createTheme({
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);