import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";

type HealthResponse = {
  status: string;
  message: string;
};

function BackendStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchBackendStatus = async () => {
      try {
        const response = await apiClient.get<HealthResponse>("/health");
        setHealth(response.data);
      } catch {
        setErrorMessage("Backend bağlantısı kurulamadı.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchBackendStatus();
  }, []);

  if (isLoading) {
    return <p>Backend bağlantısı kontrol ediliyor...</p>;
  }

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  return (
    <section>
      <h2>Backend Bağlantı Kontrolü</h2>
      <p>Durum: {health?.status}</p>
      <p>{health?.message}</p>
    </section>
  );
}

export default BackendStatus;