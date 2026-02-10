export type UserRole = string;

export interface User {
  id?: number;
  username: string;
  email: string;
  roles?: UserRole[];
  active?: boolean;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  jwt?: string;
  tokenType?: string;
  deviceId?: string;
}

export type PrayerType =
  | "FJR"
  | "DHR"
  | "ASR"
  | "MGR"
  | "ISH"
  | "BOMDOD"
  | "PESHIN"
  | "SHOM"
  | "XUFTON"
  | "VITR";

export interface QazaSummaryItem {
  prayerType: PrayerType;
  count: number;
  totalCount?: number;
  completedCount?: number;
  remainingCount?: number;
}

export interface QazaHistoryItem {
  id?: number;
  prayerType: PrayerType;
  count: number;
  date?: string;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface Reminder {
  id: number | string;
  reminderTime: string;
  days: string[];
  active: boolean;
}

export interface Goal {
  id: number | string;
  goalType: "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM" | string;
  targetCount: number;
  currentCount?: number;
  status?: "ACTIVE" | "COMPLETED" | string;
  progress?: number;
}

export interface DeviceSession {
  id?: number | string;
  deviceId?: string;
  deviceName?: string;
  browser?: string;
  os?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: string;
  lastSeenAt?: string;
  expiresAt?: string;
  current?: boolean;
}
