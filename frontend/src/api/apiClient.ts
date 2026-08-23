import axios from "axios";

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

const SAFE_METHODS = ["get", "head", "options"];

function readCsrfToken(): string | null {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CSRF_COOKIE_NAME}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

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
});

/**
 * Axios'un yerlesik xsrfCookieName/xsrfHeaderName destegi yalnizca
 * same-origin isteklerde calisir. Frontend :5173, backend :8080 uzerinde
 * oldugu icin istek cross-origin sayiliyor ve token basligi otomatik
 * eklenmiyordu; sonucta her POST/PUT/DELETE 403 donuyordu. Bu nedenle
 * token cerezden okunup basliga acikca yaziliyor.
 */
apiClient.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toLowerCase();

  if (!SAFE_METHODS.includes(method)) {
    const token = readCsrfToken();

    if (token) {
      config.headers.set(CSRF_HEADER_NAME, token);
    }
  }

  return config;
});

export default apiClient;
