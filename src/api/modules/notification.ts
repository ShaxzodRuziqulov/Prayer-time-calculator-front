import { http } from "../http";
import type { NotificationEndpoint, NotificationHistoryItem, PageResponse } from "../../types";

export type NotificationChannel = "WEB";

export interface CreateNotificationEndpointPayload {
  channel: NotificationChannel;
  endpointKey: string;
  deviceName: string;
}

export interface DeleteNotificationEndpointPayload {
  channel: NotificationChannel;
  endpointKey: string;
}

export interface NotificationHistoryQueryParams {
  page?: number;
  size?: number;
}

export function createNotificationEndpoint(payload: CreateNotificationEndpointPayload) {
  return http.post<NotificationEndpoint>("/api/notifications/endpoints", payload);
}

export function getNotificationEndpoints() {
  return http.get<NotificationEndpoint[]>("/api/notifications/endpoints");
}

export function deleteNotificationEndpoint(payload: DeleteNotificationEndpointPayload) {
  return http.delete("/api/notifications/endpoints", { data: payload });
}

export function getNotificationHistory(params?: NotificationHistoryQueryParams) {
  return http.get<PageResponse<NotificationHistoryItem>>("/api/notifications/history", { params });
}
