import { http } from "../http";
import type { AuthResponse } from "../../types";

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface GuestPayload {
  deviceId?: string;
}

export function register(payload: RegisterPayload) {
  return http.post<string>("/api/auth/register", payload);
}

export function login(payload: LoginPayload, deviceId?: string) {
  return http.post<AuthResponse>("/api/auth/login", payload, {
    headers: deviceId ? { "X-Device-Id": deviceId } : undefined
  });
}

export function guest(payload?: GuestPayload) {
  return http.post<AuthResponse>("/api/auth/guest", payload ?? {});
}

export function convertGuest(payload: RegisterPayload) {
  return http.post<string>("/api/auth/convert-guest", payload);
}
