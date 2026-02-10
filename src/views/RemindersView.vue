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
import BaseAlert from "../components/common/BaseAlert.vue";
import BaseButton from "../components/common/BaseButton.vue";
import BaseInput from "../components/common/BaseInput.vue";
import ReminderToggleItem from "../components/common/ReminderToggleItem.vue";
import { createReminder, deleteReminder } from "../api/modules/reminder";
import type { Reminder } from "../types";

const REMINDER_STORAGE_KEY = "prayer_reminders";
const APP_LANGUAGE_KEY = "app_language";
const APP_RTL_KEY = "app_rtl";
const APP_CONTRAST_KEY = "app_high_contrast";
const allDays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const message = ref("");
const messageType = ref<"success" | "error" | "info">("info");
const reminders = ref<Reminder[]>(JSON.parse(localStorage.getItem(REMINDER_STORAGE_KEY) ?? "[]") as Reminder[]);
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

async function onCreate() {
  try {
    const payload = {
      reminderTime: `${form.reminderTime}:00`,
      days: form.days,
      active: form.active
    };
    const response = await createReminder(payload);
    reminders.value.unshift({
      id: response.data?.id ?? Date.now(),
      reminderTime: payload.reminderTime,
      days: payload.days,
      active: payload.active
    });
    persistReminders();
    showMessage("success", "Eslatma yaratildi");
  } catch (error) {
    showMessage("error", (error as Error).message);
  }
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

onMounted(() => {
  applyLanguage();
  document.documentElement.dir = isRtl.value ? "rtl" : "ltr";
  document.body.classList.toggle("high-contrast", highContrast.value);
});
</script>

