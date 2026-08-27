import { createContext, useContext } from "react";

export type NotificationSeverity = "success" | "info" | "warning" | "error";

export type NotificationContextValue = {
  showNotification: (message: string, severity?: NotificationSeverity) => void;
};

export const NotificationContext = createContext<NotificationContextValue | null>(
  null
);

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification, NotificationProvider içinde kullanılmalıdır."
    );
  }

  return context;
};
