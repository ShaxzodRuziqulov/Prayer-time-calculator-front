import axios from "axios";
import { getApiErrorMessage } from "./error";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const AUTH_TOKEN_KEY = "prayer_token";
const AUTH_HEADER_KEY = "prayer_auth_header";
const GUEST_KEY = "prayer_is_guest";

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

http.interceptors.request.use((config) => {
  const requestUrl = String(config.url ?? "");
  const isPublicAuthEndpoint =
    requestUrl.includes("/api/auth/login") ||
    requestUrl.includes("/api/auth/register") ||
    requestUrl.includes("/api/auth/guest");
  const authHeader = localStorage.getItem(AUTH_HEADER_KEY);
  const token = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!isPublicAuthEndpoint) {
    if (authHeader) {
      config.headers.Authorization = authHeader;
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const requestUrl: string = error?.config?.url ?? "";
      const isAuthEndpoint = requestUrl.includes("/api/auth/");
      const isAuthPage = window.location.pathname === "/auth";

      // During login/register flow we can temporarily receive 401 from /users/me.
      // Do not clear fresh token while user is still on /auth page.
      if (!isAuthEndpoint && !isAuthPage) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_HEADER_KEY);
        localStorage.removeItem(GUEST_KEY);
        window.location.href = "/auth";
      }
    }
    return Promise.reject(new Error(getApiErrorMessage(error)));
  }
);
