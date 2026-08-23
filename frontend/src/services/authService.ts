import apiClient from "../api/apiClient";
import type { CurrentUser, LoginRequest } from "../types/auth";

/**
 * Backend CSRF korumasi actiktir ve POST/PUT/DELETE istekleri
 * X-XSRF-TOKEN basligi bekler. Token, herhangi bir GET isteginde
 * XSRF-TOKEN cerezi olarak yaziliyor; bu nedenle giris denemesinden
 * once bir kez acik bir endpoint cagrilir.
 */
export async function bootstrapCsrfToken(): Promise<void> {
  await apiClient.get("/health");
}

export async function login(request: LoginRequest): Promise<CurrentUser> {
  await bootstrapCsrfToken();

  const response = await apiClient.post<CurrentUser>("/auth/login", request);

  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const response = await apiClient.get<CurrentUser>("/me");

  return response.data;
}
