<template>
  <section class="page-shell">
    <div class="page-hero">
      <h1 class="page-title">Maqsadlar</h1>
      <p class="page-subtitle">Qazo bo'yicha maqsad yarating va bosqichma-bosqich bajaring.</p>
    </div>

    <BaseAlert v-if="message" :type="messageType">{{ message }}</BaseAlert>

    <form class="panel grid gap-3 md:grid-cols-3" @submit.prevent="onCreate">
      <div>
        <label class="field-label" for="goalType">Maqsad turi</label>
        <select
          id="goalType"
          v-model="createForm.goalType"
          class="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 transition-all focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
        >
          <option value="">Tanlang</option>
          <option v-for="item in goalTypeOptions" :key="item" :value="item">{{ goalTypeLabel(item) }}</option>
        </select>
      </div>
      <BaseInput v-model="createForm.targetCount" label="Maqsad soni" type="number" />
      <div class="flex items-end">
        <BaseButton type="submit">Yaratish</BaseButton>
      </div>
    </form>

    <div class="panel">
      <h2 class="mb-3 text-lg font-semibold text-white">Maqsadlar ro'yxati</h2>
      <div v-if="goals.length === 0" class="text-sm text-slate-500">Hozircha maqsad yo'q</div>
      <ul v-else class="space-y-2">
        <li v-for="goal in goals" :key="goal.id" class="rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
          <div class="mb-2 flex items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <p class="font-medium text-white">{{ goalTypeLabel(goal.goalType) }}</p>
                <span
                  class="rounded-full px-2 py-0.5 text-xs font-semibold"
                  :class="statusClass(goal.status)"
                >
                  {{ goalStatusLabel(goal.status) }}
                </span>
              </div>
              <p class="text-sm text-slate-400">{{ goal.currentCount ?? 0 }} / {{ goal.targetCount }}</p>
              <p class="text-xs text-slate-500">Progress: {{ goalProgress(goal) }}%</p>
            </div>
            <div class="flex items-center gap-2">
              <BaseInput v-model="increments[String(goal.id)]" type="number" />
              <BaseButton
                :disabled="goal.status === 'COMPLETED' || goal.status === 'FAILED' || goal.status === 'CANCELLED'"
                @click="onIncrement(goal.id)"
              >
                Qo'shish
              </BaseButton>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import BaseAlert from "../components/common/BaseAlert.vue";
import BaseButton from "../components/common/BaseButton.vue";
import BaseInput from "../components/common/BaseInput.vue";
import { createGoal, incrementGoal } from "../api/modules/goal";
import type { Goal } from "../types";

const GOAL_STORAGE_KEY = "prayer_goals";
type GoalType = "DAILY" | "WEEKLY" | "MONTHLY" | "CUSTOM";
type GoalStatus = "ACTIVE" | "COMPLETED" | "FAILED" | "CANCELLED";
const goalTypeOptions: GoalType[] = ["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"];
const goalTypeLabels: Record<GoalType, string> = {
  DAILY: "Kunlik",
  WEEKLY: "Haftalik",
  MONTHLY: "Oylik",
  CUSTOM: "Maxsus"
};
const goalStatusLabels: Record<GoalStatus, string> = {
  ACTIVE: "Faol",
  COMPLETED: "Bajarildi",
  FAILED: "Bajarilmadi",
  CANCELLED: "Bekor qilindi"
};

const message = ref("");
const messageType = ref<"success" | "error" | "info">("info");
const goals = ref<Goal[]>(JSON.parse(localStorage.getItem(GOAL_STORAGE_KEY) ?? "[]") as Goal[]);
const increments = reactive<Record<string, string>>({});

const createForm = reactive({
  goalType: "",
  targetCount: "1"
});

function persistGoals() {
  localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goals.value));
}

function showMessage(type: "success" | "error" | "info", text: string) {
  messageType.value = type;
  message.value = text;
}

function normalizeGoal(raw: Goal): Goal {
  const currentCount = Number(raw.currentCount ?? 0);
  const targetCount = Number(raw.targetCount ?? 0);
  const fallbackProgress = targetCount > 0 ? (currentCount / targetCount) * 100 : 0;
  return {
    ...raw,
    currentCount,
    targetCount,
    status: raw.status ?? (currentCount >= targetCount && targetCount > 0 ? "COMPLETED" : "ACTIVE"),
    progress: Number.isFinite(Number(raw.progress)) ? Number(raw.progress) : fallbackProgress
  };
}

function goalTypeLabel(value: string): string {
  const key = String(value ?? "").toUpperCase() as GoalType;
  return goalTypeLabels[key] ?? value;
}

function goalStatusLabel(value?: string): string {
  const key = String(value ?? "ACTIVE").toUpperCase() as GoalStatus;
  return goalStatusLabels[key] ?? key;
}

function statusClass(status?: string): string {
  const key = String(status ?? "ACTIVE").toUpperCase() as GoalStatus;
  if (key === "COMPLETED") return "bg-emerald-900/50 text-emerald-300";
  if (key === "FAILED") return "bg-rose-900/50 text-rose-300";
  if (key === "CANCELLED") return "bg-amber-900/50 text-amber-300";
  return "bg-slate-700 text-slate-300";
}

function goalProgress(goal: Goal): number {
  const value = Number(goal.progress ?? 0);
  return Math.max(0, Math.min(100, Math.round(value)));
}

async function onCreate() {
  if (!createForm.goalType) {
    showMessage("info", "Maqsad turini tanlang");
    return;
  }
  const targetCount = Number(createForm.targetCount);
  if (!Number.isFinite(targetCount) || targetCount < 1) {
    showMessage("info", "Maqsad soni kamida 1 bo'lishi kerak");
    return;
  }

  try {
    const payload = {
      goalType: createForm.goalType,
      targetCount
    };
    const response = await createGoal(payload);
    const createdGoal = normalizeGoal(response.data);
    goals.value.unshift(createdGoal);
    increments[String(createdGoal.id)] = "1";
    persistGoals();
    createForm.goalType = "";
    createForm.targetCount = "1";
    showMessage("success", "Maqsad yaratildi");
  } catch (error) {
    showMessage("error", (error as Error).message);
  }
}

async function onIncrement(goalId: string | number) {
  const value = Number(increments[String(goalId)] || "1");
  if (!Number.isFinite(value) || value < 1) {
    showMessage("info", "Increment qiymati kamida 1 bo'lishi kerak");
    return;
  }
  try {
    const response = await incrementGoal(goalId, value);
    const updated = normalizeGoal(response.data);
    goals.value = goals.value.map((goal) => (goal.id === goalId ? updated : goal));
    persistGoals();
    showMessage("success", "Maqsad yangilandi");
  } catch (error) {
    showMessage("error", (error as Error).message);
  }
}

onMounted(() => {
  goals.value = goals.value.map(normalizeGoal);
  goals.value.forEach((goal) => {
    increments[String(goal.id)] = increments[String(goal.id)] ?? "1";
  });
  persistGoals();
});
</script>
