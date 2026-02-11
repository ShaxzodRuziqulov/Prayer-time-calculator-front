<template>
  <section class="page-shell">
    <div class="page-hero">
      <h1 class="page-title">Eslatmalar</h1>
      <p class="page-subtitle">Kunlik eslatmalar va sozlamalarni boshqaring.</p>
    </div>

    <BaseAlert v-if="message" :type="messageType">{{ message }}</BaseAlert>

    <form class="panel grid gap-3 md:grid-cols-4" @submit.prevent="onCreate">
      <div class="md:col-span-1">
        <BaseInput v-model="form.reminderTime" type="time" label="Vaqt" />
      </div>
      <div class="md:col-span-2">
        <label class="field-label">Kunlar</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="d in allDays"
            :key="d"
            type="button"
            class="rounded-md px-2 py-1 text-xs transition-all"
            :class="form.days.includes(d) ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'"
            @click="toggleDay(d)"
          >
            {{ d }}
          </button>
        </div>
      </div>
      <div class="flex items-end">
        <BaseButton type="submit">Yaratish</BaseButton>
      </div>
    </form>

    <div class="panel">
      <h2 class="mb-3 text-lg font-semibold text-white">Eslatmalar ro'yxati</h2>
      <div v-if="reminders.length === 0" class="text-sm text-slate-500">Hozircha eslatma yo'q.</div>
      <ul v-else class="space-y-2">
        <li
          v-for="reminder in reminders"
          :key="reminder.id"
          class="flex items-center justify-between rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-2 text-sm"
        >
          <div>
            <p class="font-medium text-white">{{ reminder.reminderTime }}</p>
            <p class="text-slate-400">{{ reminder.days.join(", ") }}</p>
          </div>
          <BaseButton variant="danger" @click="onDelete(reminder.id)">O'chirish</BaseButton>
        </li>
      </ul>
    </div>

    <div class="panel">
      <div class="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-white">Brauzer bildirishnomalari</h2>
          <p class="text-sm text-slate-400">Eslatma vaqtida push xabar olish uchun bir marta yoqing.</p>
        </div>
        <BaseButton variant="secondary" :loading="endpointLoading" @click="loadEndpoints">Yangilash</BaseButton>
      </div>

      <div class="rounded-lg border border-slate-700/50 bg-slate-900/40 p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="text-sm text-slate-300">
              Holat:
              <span :class="pushEnabled ? 'text-emerald-300' : 'text-slate-400'">
                {{ pushEnabled ? "Yoqilgan" : "O'chirilgan" }}
              </span>
            </p>
            <p class="mt-1 text-xs text-slate-400">{{ pushStatusText }}</p>
          </div>
          <div class="flex gap-2">
            <BaseButton
              v-if="!pushEnabled"
              type="button"
              :loading="endpointTokenLoading || endpointLoading"
              @click="onEnablePush"
            >
              Bildirishnomani yoqish
            </BaseButton>
            <BaseButton
              v-else
              type="button"
              variant="danger"
              :loading="endpointLoading"
              @click="onDisablePush"
            >
              O'chirish
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-lg font-semibold text-white">Notification History</h2>
        <select
          :value="notificationHistorySize"
          class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          @change="changeNotificationHistorySize(Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="size in historySizeOptions" :key="size" :value="size">{{ size }} / sahifa</option>
        </select>
      </div>

      <div class="overflow-x-auto rounded-lg border border-slate-700/50">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-900/50">
            <tr class="border-b border-slate-700">
              <th class="px-4 py-3 font-medium text-slate-400">Vaqt</th>
              <th class="px-4 py-3 font-medium text-slate-400">Qurilma</th>
              <th class="px-4 py-3 font-medium text-slate-400">Status</th>
              <th class="px-4 py-3 font-medium text-slate-400">Xabar</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in notificationHistory"
              :key="String(item.id ?? `${item.endpointKey}-${item.createdAt}`)"
              class="border-b border-slate-700/50 transition-colors hover:bg-slate-700/20"
            >
              <td class="px-4 py-3 text-slate-300">{{ formatDateTime(item.sentAt ?? item.createdAt) }}</td>
              <td class="px-4 py-3 text-slate-200">{{ item.endpointKey || "-" }}</td>
              <td class="px-4 py-3">
                <span :class="resolveHistoryStatusClass(item)">
                  {{ resolveHistoryStatusLabel(item) }}
                </span>
              </td>
              <td class="px-4 py-3 text-slate-200">{{ item.title || item.body || item.error || "-" }}</td>
            </tr>
            <tr v-if="notificationHistory.length === 0">
              <td colspan="4" class="px-4 py-8 text-center text-slate-500">Tarix topilmadi</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center justify-between gap-2">
        <p class="text-sm text-slate-400">{{ notificationHistoryTotalElements }} ta yozuv</p>
        <div class="flex items-center gap-2">
          <BaseButton
            type="button"
            variant="secondary"
            :disabled="notificationHistoryPage <= 0 || notificationHistoryLoading"
            @click="changeNotificationHistoryPage(notificationHistoryPage - 1)"
          >
            Oldingi
          </BaseButton>
          <BaseButton
            type="button"
            variant="secondary"
            :disabled="notificationHistoryPage >= notificationHistoryTotalPages - 1 || notificationHistoryLoading"
            @click="changeNotificationHistoryPage(notificationHistoryPage + 1)"
          >
            Keyingi
          </BaseButton>
        </div>
      </div>
    </div>

    <div class="panel">
      <h2 class="mb-3 text-lg font-semibold text-white">Sozlamalar</h2>
      <div class="grid gap-3 sm:grid-cols-2">
        <div>
          <label class="field-label" for="language">Til</label>
          <select
            id="language"
            v-model="language"
            class="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
            @change="applyLanguage"
          >
            <option value="uz">Uzbek</option>
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
        <div class="space-y-2">
          <label class="field-label">Qulaylik</label>
          <ReminderToggleItem label="RTL rejim" :enabled="isRtl" @toggle="toggleRtl" />
          <ReminderToggleItem label="Yuqori kontrast" :enabled="highContrast" @toggle="toggleHighContrast" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  createNotificationEndpoint,
  deleteNotificationEndpoint,
  getNotificationEndpoints,
  getNotificationHistory
} from "../api/modules/notification";
import BaseAlert from "../components/common/BaseAlert.vue";
import BaseButton from "../components/common/BaseButton.vue";
import BaseInput from "../components/common/BaseInput.vue";
import ReminderToggleItem from "../components/common/ReminderToggleItem.vue";
import { createReminder, deleteReminder } from "../api/modules/reminder";
import type { NotificationEndpoint, NotificationHistoryItem, PageResponse, Reminder } from "../types";
import { formatDateTime } from "../utils/date";
import { getWebFcmToken } from "../utils/fcm";

const REMINDER_STORAGE_KEY = "prayer_reminders";
const FCM_TOKEN_STORAGE_KEY = "prayer_fcm_token";
const APP_LANGUAGE_KEY = "app_language";
const APP_RTL_KEY = "app_rtl";
const APP_CONTRAST_KEY = "app_high_contrast";
const allDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const message = ref("");
const messageType = ref<"success" | "error" | "info">("info");
const reminders = ref<Reminder[]>(JSON.parse(localStorage.getItem(REMINDER_STORAGE_KEY) ?? "[]") as Reminder[]);
const endpointLoading = ref(false);
const endpointTokenLoading = ref(false);
const notificationEndpoints = ref<NotificationEndpoint[]>([]);
const pushEnabled = ref(false);
const pushStatusText = ref("Brauzer bildirishnomalari hozircha yoqilmagan.");
const notificationHistory = ref<NotificationHistoryItem[]>([]);
const notificationHistoryLoading = ref(false);
const notificationHistoryPage = ref(0);
const notificationHistorySize = ref(10);
const notificationHistoryTotalPages = ref(1);
const notificationHistoryTotalElements = ref(0);
const historySizeOptions = [5, 10, 20, 50];
const language = ref(localStorage.getItem(APP_LANGUAGE_KEY) ?? "uz");
const isRtl = ref(localStorage.getItem(APP_RTL_KEY) === "true");
const highContrast = ref(localStorage.getItem(APP_CONTRAST_KEY) === "true");

const form = reactive({
  reminderTime: "05:30",
  days: ["MONDAY"] as string[],
  active: true
});

function persistReminders() {
  localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders.value));
}

function showMessage(type: "success" | "error" | "info", text: string) {
  messageType.value = type;
  message.value = text;
}

function toggleDay(day: string) {
  if (form.days.includes(day)) {
    form.days = form.days.filter((d) => d !== day);
    return;
  }
  form.days = [...form.days, day];
}

function detectTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function detectDeviceName() {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Chrome on Windows";
  if (ua.includes("Mac")) return "Chrome on Mac";
  if (ua.includes("Android")) return "Chrome on Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "Safari on iOS";
  return "Web Browser";
}

function normalizeEndpointList(payload: unknown): NotificationEndpoint[] {
  if (Array.isArray(payload)) return payload as NotificationEndpoint[];
  if (payload && typeof payload === "object") {
    const maybeContent = (payload as { content?: unknown }).content;
    if (Array.isArray(maybeContent)) return maybeContent as NotificationEndpoint[];
  }
  return [];
}

function normalizeNotificationHistoryPage(payload: unknown): PageResponse<NotificationHistoryItem> {
  const raw = payload as Partial<PageResponse<NotificationHistoryItem>>;
  const content = Array.isArray(raw?.content) ? raw.content : [];
  const totalPages = Number(raw?.totalPages ?? 1);
  const pageNumber = Number(raw?.number ?? 0);
  const size = Number(raw?.size ?? notificationHistorySize.value);
  const totalElements = Number(raw?.totalElements ?? content.length);

  return {
    content,
    number: Number.isFinite(pageNumber) ? pageNumber : 0,
    size: Number.isFinite(size) ? size : notificationHistorySize.value,
    totalElements: Number.isFinite(totalElements) ? totalElements : content.length,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    first: Boolean(raw?.first ?? pageNumber <= 0),
    last: Boolean(raw?.last ?? pageNumber >= totalPages - 1)
  };
}

function resolveHistoryStatusLabel(item: NotificationHistoryItem) {
  const status = String(item.status ?? "").toUpperCase();
  if (status) return status;
  if (item.delivered === true || item.sent === true) return "SENT";
  if (item.delivered === false || item.sent === false) return "FAILED";
  return "UNKNOWN";
}

function resolveHistoryStatusClass(item: NotificationHistoryItem) {
  const label = resolveHistoryStatusLabel(item);
  if (label === "SENT" || label === "DELIVERED" || label === "SUCCESS") {
    return "rounded px-2 py-1 text-xs font-semibold text-emerald-300";
  }
  if (label === "FAILED" || label === "ERROR") {
    return "rounded px-2 py-1 text-xs font-semibold text-rose-300";
  }
  return "rounded px-2 py-1 text-xs font-semibold text-slate-300";
}

async function onCreate() {
  try {
    const payload = {
      reminderTime: `${form.reminderTime}:00`,
      days: form.days,
      active: form.active,
      timeZone: detectTimeZone()
    };
    const response = await createReminder(payload);
    reminders.value.unshift({
      id: response.data?.id ?? Date.now(),
      reminderTime: payload.reminderTime,
      days: payload.days,
      active: payload.active,
      timeZone: payload.timeZone
    });
    persistReminders();
    showMessage("success", "Eslatma yaratildi");
  } catch (error) {
    showMessage("error", (error as Error).message);
  }
}

async function loadEndpoints() {
  endpointLoading.value = true;
  try {
    const response = await getNotificationEndpoints();
    notificationEndpoints.value = normalizeEndpointList(response.data);
    const savedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    const endpointBySavedToken = savedToken
      ? notificationEndpoints.value.find((item) => item.endpointKey === savedToken)
      : undefined;
    const currentEndpoint = endpointBySavedToken ?? notificationEndpoints.value[0];

    if (savedToken && !endpointBySavedToken) {
      localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    }

    pushEnabled.value = Boolean(currentEndpoint);
    pushStatusText.value = currentEndpoint
      ? `${currentEndpoint.deviceName || "Qurilma"} orqali push yoqilgan.`
      : "Brauzer bildirishnomalari hozircha yoqilmagan.";
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    endpointLoading.value = false;
  }
}

async function onEnablePush() {
  endpointTokenLoading.value = true;
  try {
    const endpointKey = await getWebFcmToken();
    const deviceName = detectDeviceName();
    await createNotificationEndpoint({
      channel: "WEB",
      endpointKey,
      deviceName
    });
    localStorage.setItem(FCM_TOKEN_STORAGE_KEY, endpointKey);
    await loadEndpoints();
    showMessage("success", "Bildirishnoma yoqildi. Eslatma vaqti kelganda push keladi.");
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    endpointTokenLoading.value = false;
  }
}

async function onDisablePush() {
  endpointLoading.value = true;
  try {
    const savedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
    const endpointBySavedToken = savedToken
      ? notificationEndpoints.value.find((item) => item.endpointKey === savedToken)
      : undefined;
    const endpointKey = endpointBySavedToken?.endpointKey || notificationEndpoints.value[0]?.endpointKey;

    if (!endpointKey) {
      pushEnabled.value = false;
      pushStatusText.value = "Faol endpoint topilmadi.";
      return;
    }

    await deleteNotificationEndpoint({
      channel: "WEB",
      endpointKey
    });
    localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
    await loadEndpoints();
    showMessage("success", "Brauzer bildirishnomalari o'chirildi.");
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    endpointLoading.value = false;
  }
}

async function loadNotificationHistory() {
  notificationHistoryLoading.value = true;
  try {
    const response = await getNotificationHistory({
      page: notificationHistoryPage.value,
      size: notificationHistorySize.value
    });
    const pageData = normalizeNotificationHistoryPage(response.data);
    notificationHistory.value = pageData.content;
    notificationHistoryPage.value = pageData.number;
    notificationHistorySize.value = pageData.size;
    notificationHistoryTotalPages.value = pageData.totalPages;
    notificationHistoryTotalElements.value = pageData.totalElements;
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    notificationHistoryLoading.value = false;
  }
}

async function changeNotificationHistoryPage(nextPage: number) {
  if (nextPage < 0 || nextPage >= notificationHistoryTotalPages.value || notificationHistoryLoading.value) return;
  notificationHistoryPage.value = nextPage;
  await loadNotificationHistory();
}

async function changeNotificationHistorySize(nextSize: number) {
  if (!historySizeOptions.includes(nextSize) || notificationHistoryLoading.value) return;
  notificationHistorySize.value = nextSize;
  notificationHistoryPage.value = 0;
  await loadNotificationHistory();
}

async function onDelete(id: string | number) {
  try {
    await deleteReminder(id);
    reminders.value = reminders.value.filter((item) => item.id !== id);
    persistReminders();
    showMessage("success", "Eslatma o'chirildi");
  } catch (error) {
    showMessage("error", (error as Error).message);
  }
}

function applyLanguage() {
  localStorage.setItem(APP_LANGUAGE_KEY, language.value);
  document.documentElement.lang = language.value;
}

function toggleRtl() {
  isRtl.value = !isRtl.value;
  localStorage.setItem(APP_RTL_KEY, String(isRtl.value));
  document.documentElement.dir = isRtl.value ? "rtl" : "ltr";
}

function toggleHighContrast() {
  highContrast.value = !highContrast.value;
  localStorage.setItem(APP_CONTRAST_KEY, String(highContrast.value));
  document.body.classList.toggle("high-contrast", highContrast.value);
}

onMounted(async () => {
  applyLanguage();
  document.documentElement.dir = isRtl.value ? "rtl" : "ltr";
  document.body.classList.toggle("high-contrast", highContrast.value);
  await Promise.all([loadEndpoints(), loadNotificationHistory()]);
});
</script>
