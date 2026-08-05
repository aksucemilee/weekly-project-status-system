import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import "./index.css";
import App from "./App";
import { NotificationProvider } from "./components/feedback/NotificationProvider";
import { ColorModeProvider } from "./theme/ColorModeProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ColorModeProvider>
      <NotificationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificationProvider>
    </ColorModeProvider>
  </StrictMode>,
);
