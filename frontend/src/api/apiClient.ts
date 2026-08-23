import axios from "axios";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000,

  // Oturum cerezinin ve CSRF token cerezinin backend'e gonderilmesi
  // icin gereklidir; backend farkli bir origin'de calisiyor.
  withCredentials: true,

  // Backend CSRF token'i XSRF-TOKEN cerezine yaziyor, X-XSRF-TOKEN
  // basliginda bekliyor.
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

export default apiClient;