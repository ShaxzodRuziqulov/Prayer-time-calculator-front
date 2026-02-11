import { http } from "../http";
import type { Reminder } from "../../types";

export interface CreateReminderPayload {
  reminderTime: string;
  days: string[];
  active: boolean;
  timeZone: string;
}

export function createReminder(payload: CreateReminderPayload) {
  return http.post<Reminder>("/api/reminders", payload);
}

export function deleteReminder(id: string | number) {
  return http.delete(`/api/reminders/${id}`);
}

