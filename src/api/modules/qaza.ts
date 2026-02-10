import { http } from "../http";
import type { PageResponse, PrayerType, QazaHistoryItem, QazaSummaryItem } from "../../types";

export interface InitQazaPayload {
  fromDate: string;
  toDate: string;
}

export interface CompleteQazaPayload {
  prayerType: PrayerType;
  count: number;
}

export interface HistoryQueryParams {
  page?: number;
  size?: number;
}

export function addQaza(prayerType: PrayerType, count: number) {
  return http.post(`/api/qaza/add?prayerType=${prayerType}&count=${count}`);
}

export function initQaza(payload: InitQazaPayload) {
  return http.post("/api/qaza/init", payload);
}

export function getQaza(prayerType: PrayerType) {
  return http.get<QazaSummaryItem>(`/api/qaza/get?prayerType=${prayerType}`);
}

export function getAllQaza() {
  return http.get<QazaSummaryItem[]>("/api/qaza/get-all");
}

export function completeQaza(payload: CompleteQazaPayload) {
  return http.post("/api/qaza/complete", payload);
}

export function getQazaHistory(params?: HistoryQueryParams) {
  return http.get<PageResponse<QazaHistoryItem>>("/api/qaza/history", { params });
}
