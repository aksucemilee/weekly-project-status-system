import { Alert, Snackbar } from "@mui/material";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";

import { NotificationContext } from "./NotificationContext";
import type { NotificationContextValue, NotificationSeverity } from "./NotificationContext";

type NotificationState = {
  key: number;
  isOpen: boolean;
  message: string;
  severity: NotificationSeverity;
};

type NotificationProviderProps = {
  children: ReactNode;
};

const initialNotificationState: NotificationState = {
  key: 0,
  isOpen: false,
  message: "",
  severity: "success",
};

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notification, setNotification] = useState<NotificationState>(
    initialNotificationState,
  );

  const closeNotification = () => {
    setNotification((currentNotification) => ({
      ...currentNotification,
      isOpen: false,
    }));
  };

  const contextValue = useMemo<NotificationContextValue>(
    () => ({
      showNotification: (message, severity = "success") => {
        setNotification({
          key: Date.now(),
          isOpen: true,
          message,
          severity,
        });
      },
    }),
    [],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      <Snackbar
        key={notification.key}
        open={notification.isOpen}
        autoHideDuration={3500}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={(_event, reason) => {
          if (reason !== "clickaway") {
            closeNotification();
          }
        }}
      >
        <Alert
          severity={notification.severity}
          variant="filled"
          onClose={closeNotification}
          sx={{
            width: "100%",
            minWidth: {
              xs: "auto",
              sm: 320,
            },
            alignItems: "center",
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
