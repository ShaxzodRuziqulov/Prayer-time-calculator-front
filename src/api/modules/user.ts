import { http } from "../http";
import type { User } from "../../types";

export interface UpdateMePayload {
  username?: string;
  email?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export function getMe() {
  return http.get<User>("/api/users/me");
}

export function updateMe(payload: UpdateMePayload) {
  return http.put<User>("/api/users/me", payload);
}

export function changePassword(payload: ChangePasswordPayload) {
  return http.put("/api/users/me/password", payload);
}

