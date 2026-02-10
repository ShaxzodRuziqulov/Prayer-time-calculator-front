import { http } from "../http";
import type { DeviceSession } from "../../types";

export function getDeviceSessions() {
  return http.get<DeviceSession[]>("/api/sessions");
}

export function revokeDeviceSession(sessionId: number | string) {
  return http.delete(`/api/sessions/${sessionId}`);
}

export function revokeOtherDeviceSessions() {
  return http.delete("/api/sessions/others");
}
