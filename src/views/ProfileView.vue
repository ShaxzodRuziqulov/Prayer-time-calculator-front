<template>
  <section class="page-shell">
    <div class="page-hero">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-600 bg-slate-900/70 text-xl font-bold text-slate-100">
            {{ profileInitials }}
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-slate-400">Hisob</p>
            <h1 class="mt-1 text-3xl font-bold text-white">Profil</h1>
            <p class="mt-2 text-sm text-slate-300">Profil ma'lumotlari va xavfsizlik sozlamalari.</p>
          </div>
        </div>
        <div class="rounded-xl border border-slate-700/50 bg-slate-900/60 px-4 py-3">
          <p class="text-xs uppercase tracking-wide text-slate-400">Status</p>
          <p class="mt-1 text-sm font-semibold text-white">{{ accountStatusText }}</p>
        </div>
      </div>
    </div>

    <BaseAlert v-if="message" :type="messageType">{{ message }}</BaseAlert>
    <BaseLoader v-if="loadingMe" />

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="panel lg:col-span-2">
        <h2 class="text-lg font-semibold text-white">Hisob ma'lumotlari</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <p class="text-xs uppercase tracking-wide text-slate-400">Username</p>
            <p class="mt-1 text-sm font-semibold text-slate-100">{{ authStore.me?.username ?? "-" }}</p>
          </div>
          <div class="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
            <p class="text-xs uppercase tracking-wide text-slate-400">Email</p>
            <p class="mt-1 text-sm font-semibold text-slate-100">{{ authStore.me?.email ?? "-" }}</p>
          </div>
          <div class="rounded-lg border border-slate-700 bg-slate-900/60 p-3 sm:col-span-2">
            <p class="text-xs uppercase tracking-wide text-slate-400">Roles</p>
            <p class="mt-1 text-sm font-semibold text-slate-100">{{ (authStore.me?.roles ?? []).join(", ") || "-" }}</p>
          </div>
        </div>
      </div>

      <div class="panel">
        <h2 class="text-lg font-semibold text-white">Xavfsizlik</h2>
        <p class="mt-2 text-xs text-slate-400">Kuchli parol: kamida 8 belgi, eski paroldan farqli bo'lsin.</p>
        <div class="mt-4 space-y-2 text-sm text-slate-300">
          <p>Account turi: {{ authStore.isGuest ? "Guest" : "Registered" }}</p>
          <p v-if="authStore.isGuest" class="text-amber-300">Guest user uchun profil va parol yangilanmaydi.</p>
        </div>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <form class="panel" @submit.prevent="onUpdateProfile">
        <h2 class="text-lg font-semibold text-white">Profilni yangilash</h2>
        <p class="mt-1 text-xs text-slate-400">Faqat o'zgargan maydonlar saqlanadi.</p>
        <div class="mt-4 space-y-3">
          <BaseInput v-model="profileForm.username" label="Username" :error="profileErrors.username" />
          <BaseInput v-model="profileForm.email" type="email" label="Email" :error="profileErrors.email" />
        </div>
        <div class="mt-4">
          <BaseButton type="submit" :loading="updatingProfile" :disabled="!canSubmitProfile">Update</BaseButton>
        </div>
      </form>

      <form class="panel" @submit.prevent="onChangePassword">
        <h2 class="text-lg font-semibold text-white">Parolni o'zgartirish</h2>
        <p class="mt-1 text-xs text-slate-400">Parollar mos bo'lmasa yoki bir xil bo'lsa saqlanmaydi.</p>
        <div class="mt-4 space-y-3">
          <BaseInput
            v-model="passwordForm.oldPassword"
            type="password"
            label="Old password"
            :error="passwordErrors.oldPassword"
          />
          <BaseInput
            v-model="passwordForm.newPassword"
            type="password"
            label="New password"
            :error="passwordErrors.newPassword"
          />
        </div>
        <div class="mt-4">
          <BaseButton type="submit" :loading="changingPassword" :disabled="authStore.isGuest || changingPassword">
            Change password
          </BaseButton>
        </div>
      </form>
    </div>

    <div class="panel">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-lg font-semibold text-white">Device sessions</h2>
          <p class="text-xs text-slate-400">Akkount kirilgan qurilmalar ro'yxati.</p>
        </div>
        <div class="flex items-center gap-2">
          <BaseButton type="button" variant="secondary" :loading="loadingSessions" @click="loadSessions">Refresh</BaseButton>
          <BaseButton
            type="button"
            variant="danger"
            :loading="revokingOthers"
            :disabled="authStore.isGuest || revokingOthers || sessions.length <= 1"
            @click="onRevokeOthers"
          >
            Logout others
          </BaseButton>
        </div>
      </div>

      <div v-if="authStore.isGuest" class="rounded-lg border border-amber-500/40 bg-amber-900/20 p-3 text-sm text-amber-200">
        Guest session uchun device sessions boshqaruvi o'chirilgan.
      </div>

      <div v-else-if="sessions.length === 0" class="rounded-lg border border-slate-700 bg-slate-900/40 p-4 text-sm text-slate-400">
        Session topilmadi.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="session in sessions"
          :key="session.id != null ? String(session.id) : `device-${session.deviceId || 'unknown'}-${session.expiresAt || ''}`"
          class="rounded-lg border border-slate-700 bg-slate-900/50 p-4"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-1">
              <p class="text-sm font-semibold text-slate-100">
                {{ session.deviceName || session.deviceId || "Unknown device" }}
                <span v-if="isCurrentSession(session)" class="ml-2 rounded bg-emerald-600/25 px-2 py-0.5 text-xs text-emerald-200">
                  Current
                </span>
              </p>
              <p class="text-xs text-slate-400">Device ID: {{ session.deviceId || "-" }}</p>
              <p class="text-xs text-slate-400">Browser/OS: {{ session.browser || "-" }} / {{ session.os || "-" }}</p>
              <p class="text-xs text-slate-400">IP: {{ session.ipAddress || "-" }}</p>
              <p class="text-xs text-slate-400">Last seen: {{ formatDateTime(session.lastSeenAt || session.createdAt) }}</p>
            </div>
            <BaseButton
              type="button"
              variant="secondary"
              :loading="session.id != null ? Boolean(revokingById[String(session.id)]) : false"
              :disabled="session.id == null || isCurrentSession(session) || (session.id != null && Boolean(revokingById[String(session.id)]))"
              @click="session.id != null && onRevokeSession(session.id)"
            >
              Logout
            </BaseButton>
          </div>
          <p v-if="session.userAgent" class="mt-2 line-clamp-2 text-xs text-slate-500">{{ session.userAgent }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { z } from "zod";
import BaseAlert from "../components/common/BaseAlert.vue";
import BaseButton from "../components/common/BaseButton.vue";
import BaseInput from "../components/common/BaseInput.vue";
import BaseLoader from "../components/common/BaseLoader.vue";
import { useAuthStore } from "../stores/auth";
import { changePassword, updateMe } from "../api/modules/user";
import { getDeviceSessions, revokeDeviceSession, revokeOtherDeviceSessions } from "../api/modules/session";
import type { DeviceSession } from "../types";
import { formatDateTime } from "../utils/date";
import { passwordSchema } from "../utils/validation";

const authStore = useAuthStore();
const profileUpdateSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username kamida 3 ta belgi bo'lsin")
    .max(50, "Username 50 ta belgidan oshmasin"),
  email: z.string().trim().email("Email noto'g'ri")
});

const loadingMe = ref(false);
const updatingProfile = ref(false);
const changingPassword = ref(false);
const loadingSessions = ref(false);
const revokingOthers = ref(false);
const revokingById = reactive<Record<string, boolean>>({});
const message = ref("");
const messageType = ref<"success" | "error" | "info">("info");
const profileInitial = reactive({
  username: "",
  email: ""
});

const profileForm = reactive({
  username: "",
  email: ""
});

const passwordForm = reactive({
  oldPassword: "",
  newPassword: ""
});
const sessions = ref<DeviceSession[]>([]);

const profileErrors = reactive<Record<string, string>>({});
const passwordErrors = reactive<Record<string, string>>({});
const profileInitials = computed(() => {
  const raw = authStore.me?.username?.trim() || authStore.me?.email?.trim() || "U";
  return raw.slice(0, 2).toUpperCase();
});
const accountStatusText = computed(() => (authStore.isGuest ? "Guest session" : "Registered user"));
const canSubmitProfile = computed(() => {
  if (authStore.isGuest || loadingMe.value || updatingProfile.value) {
    return false;
  }
  const currentUsername = profileForm.username.trim();
  const currentEmail = profileForm.email.trim();
  return currentUsername !== profileInitial.username || currentEmail !== profileInitial.email;
});

function showMessage(type: "success" | "error" | "info", text: string) {
  messageType.value = type;
  message.value = text;
}

function normalizeSessions(payload: unknown): DeviceSession[] {
  const rawList = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { content?: unknown[] }).content)
      ? (payload as { content: unknown[] }).content
      : [];

  return rawList.reduce<DeviceSession[]>((acc, item) => {
    if (!item || typeof item !== "object") {
      return acc;
    }
    const record = item as Record<string, unknown>;
    const id = record.id ?? record.sessionId ?? record.deviceSessionId;
    acc.push({
      id: id == null ? undefined : String(id),
      deviceId: String(record.deviceId ?? record.clientId ?? ""),
      deviceName: String(record.deviceName ?? record.name ?? ""),
      browser: String(record.browser ?? ""),
      os: String(record.os ?? ""),
      userAgent: String(record.userAgent ?? ""),
      ipAddress: String(record.ipAddress ?? record.ip ?? ""),
      createdAt: String(record.createdAt ?? ""),
      lastSeenAt: String(record.lastSeenAt ?? record.updatedAt ?? ""),
      expiresAt: String(record.expiresAt ?? ""),
      current: Boolean(record.current ?? record.isCurrent ?? false)
    });
    return acc;
  }, []);
}

function isCurrentSession(session: DeviceSession): boolean {
  if (session.current) {
    return true;
  }
  const myDeviceId = authStore.deviceId?.trim();
  const sessionDeviceId = session.deviceId?.trim();
  return Boolean(myDeviceId && sessionDeviceId && myDeviceId === sessionDeviceId);
}

async function loadMe() {
  loadingMe.value = true;
  try {
    await authStore.fetchMe();
    const nextUsername = authStore.me?.username?.trim() ?? "";
    const nextEmail = authStore.me?.email?.trim() ?? "";
    profileInitial.username = nextUsername;
    profileInitial.email = nextEmail;
    profileForm.username = nextUsername;
    profileForm.email = nextEmail;
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    loadingMe.value = false;
  }
}

async function loadSessions() {
  if (authStore.isGuest) {
    sessions.value = [];
    return;
  }
  loadingSessions.value = true;
  try {
    const response = await getDeviceSessions();
    sessions.value = normalizeSessions(response.data).sort((a, b) => {
      if (isCurrentSession(a) && !isCurrentSession(b)) {
        return -1;
      }
      if (!isCurrentSession(a) && isCurrentSession(b)) {
        return 1;
      }
      const left = new Date(a.lastSeenAt || a.createdAt || "").getTime();
      const right = new Date(b.lastSeenAt || b.createdAt || "").getTime();
      return right - left;
    });
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    loadingSessions.value = false;
  }
}

async function onRevokeSession(id: string | number) {
  const key = String(id);
  revokingById[key] = true;
  try {
    await revokeDeviceSession(id);
    showMessage("success", "Session chiqarildi");
    await loadSessions();
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    revokingById[key] = false;
  }
}

async function onRevokeOthers() {
  if (authStore.isGuest) {
    return;
  }
  revokingOthers.value = true;
  try {
    await revokeOtherDeviceSessions();
    showMessage("success", "Boshqa qurilmalar chiqarildi");
    await loadSessions();
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    revokingOthers.value = false;
  }
}

async function onUpdateProfile() {
  Object.keys(profileErrors).forEach((k) => (profileErrors[k] = ""));
  if (authStore.isGuest) {
    showMessage("info", "Guest user profilini yangilab bo'lmaydi.");
    return;
  }
  if (!canSubmitProfile.value) {
    showMessage("info", "Saqlash uchun o'zgarish topilmadi.");
    return;
  }
  const payload = {
    username: profileForm.username.trim(),
    email: profileForm.email.trim()
  };
  const parsed = profileUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      const field = String(issue.path[0] ?? "form");
      profileErrors[field] = issue.message;
    });
    return;
  }
  try {
    updatingProfile.value = true;
    await updateMe(parsed.data);
    showMessage("success", "Profile updated");
    await loadMe();
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    updatingProfile.value = false;
  }
}

async function onChangePassword() {
  Object.keys(passwordErrors).forEach((k) => (passwordErrors[k] = ""));
  if (authStore.isGuest) {
    showMessage("info", "Guest user parolini o'zgartirib bo'lmaydi.");
    return;
  }
  const parsed = passwordSchema.safeParse(passwordForm);
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      const field = String(issue.path[0] ?? "form");
      passwordErrors[field] = issue.message;
    });
    return;
  }
  if (parsed.data.oldPassword === parsed.data.newPassword) {
    passwordErrors.newPassword = "Yangi parol eskisidan farqli bo'lsin";
    return;
  }
  try {
    changingPassword.value = true;
    await changePassword(parsed.data);
    passwordForm.oldPassword = "";
    passwordForm.newPassword = "";
    showMessage("success", "Password changed");
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    changingPassword.value = false;
  }
}

onMounted(async () => {
  await loadMe();
  await loadSessions();
});
</script>
