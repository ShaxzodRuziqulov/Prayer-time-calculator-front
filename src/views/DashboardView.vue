<template>
  <section class="mx-auto max-w-5xl space-y-5">
    <div class="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-white">Dashboard</h1>
          <p class="mt-1 text-sm text-slate-400">Qazo holati, tezkor amallar va tarix.</p>
        </div>
        <BaseButton :loading="loadingSummary" variant="secondary" @click="loadAll">Yangilash</BaseButton>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div class="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400">Qolgan</p>
          <p class="mt-2 text-2xl font-bold text-white">{{ totalQazaCount }}</p>
        </div>
        <div class="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400">Bajarilgan</p>
          <p class="mt-2 text-2xl font-bold text-emerald-400">{{ totalCompletedCount }}</p>
        </div>
        <div class="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4">
          <p class="text-xs uppercase tracking-wide text-slate-400">Jami</p>
          <p class="mt-2 text-2xl font-bold text-white">{{ totalPlannedCount }}</p>
        </div>
      </div>
    </div>

    <div class="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5">
      <h2 class="text-lg font-semibold text-white">Namoz turlari</h2>
      <div class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <PrayerTypeChip
          v-for="item in displaySummary"
          :key="item.prayerType"
          :label="item.prayerType"
          :count="item.remainingCount"
        />
      </div>
    </div>

    <div id="quick-actions" class="grid gap-4 lg:grid-cols-3">
      <div class="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5 lg:col-span-2">
        <h2 class="mb-4 text-lg font-semibold text-white">Tezkor amallar</h2>

        <div class="space-y-3">
          <div
            v-for="item in displaySummary"
            :key="`action-${item.prayerType}`"
            class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700/50 bg-slate-900/40 p-3"
          >
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-400">{{ item.prayerType }}</p>
              <p class="mt-1 text-lg font-semibold text-white">{{ item.remainingCount }}</p>
            </div>
            <div class="flex items-center gap-2">
              <BaseButton
                type="button"
                :loading="Boolean(actionLoading[item.prayerType])"
                :disabled="Boolean(actionLoading[item.prayerType])"
                @click="onQuickAdd(item.prayerType)"
              >
                Qo'shish
              </BaseButton>
              <BaseButton
                type="button"
                variant="secondary"
                :loading="Boolean(actionLoading[item.prayerType])"
                :disabled="item.remainingCount <= 0 || Boolean(actionLoading[item.prayerType])"
                @click="onQuickComplete(item.prayerType)"
              >
                Bajarildi
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <QazoEntryForm v-model="initForm" :errors="initErrors" @submit="onInitQaza" />
    </div>

    <div class="rounded-xl border border-slate-700/50 bg-slate-800/60 p-5">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold text-white">Tarix</h2>
        <select
          :value="historySize"
          class="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          @change="changeHistorySize(Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="size in historySizeOptions" :key="size" :value="size">{{ size }} / sahifa</option>
        </select>
      </div>

      <div class="overflow-x-auto rounded-lg border border-slate-700/50">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-900/50">
            <tr class="border-b border-slate-700">
              <th class="px-4 py-3 font-medium text-slate-400">Sana</th>
              <th class="px-4 py-3 font-medium text-slate-400">Namoz</th>
              <th class="px-4 py-3 font-medium text-slate-400">Soni</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="h in history"
              :key="`${h.prayerType}-${h.id ?? h.createdAt}`"
              class="border-b border-slate-700/50 transition-colors hover:bg-slate-700/20"
            >
              <td class="px-4 py-3 text-slate-300">{{ formatDateTime(h.date ?? h.createdAt) }}</td>
              <td class="px-4 py-3 font-medium text-white">{{ h.prayerType }}</td>
              <td class="px-4 py-3 text-slate-200">{{ h.count }}</td>
            </tr>
            <tr v-if="history.length === 0">
              <td colspan="3" class="px-4 py-8 text-center text-slate-500">Tarix topilmadi</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex items-center justify-between">
        <p class="text-sm text-slate-400">{{ historyTotalElements }} ta yozuv</p>
        <div class="flex items-center gap-2">
          <BaseButton
            type="button"
            variant="secondary"
            :disabled="historyPage <= 0 || loadingSummary"
            @click="changeHistoryPage(historyPage - 1)"
          >
            Oldingi
          </BaseButton>
          <BaseButton
            type="button"
            variant="secondary"
            :disabled="historyPage >= historyTotalPages - 1 || loadingSummary"
            @click="changeHistoryPage(historyPage + 1)"
          >
            Keyingi
          </BaseButton>
        </div>
      </div>
    </div>

    <BaseAlert v-if="message" :type="messageType">{{ message }}</BaseAlert>
    <BaseLoader v-if="loadingSummary" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import BaseAlert from "../components/common/BaseAlert.vue";
import BaseButton from "../components/common/BaseButton.vue";
import BaseLoader from "../components/common/BaseLoader.vue";
import PrayerTypeChip from "../components/common/PrayerTypeChip.vue";
import QazoEntryForm from "../components/common/QazoEntryForm.vue";
import { addQaza, completeQaza, getAllQaza, getQazaHistory, initQaza } from "../api/modules/qaza";
import type { PageResponse, PrayerType, QazaHistoryItem, QazaSummaryItem } from "../types";
import { formatDateTime } from "../utils/date";
import { dateRangeSchema } from "../utils/validation";

const prayerTypes: PrayerType[] = ["BOMDOD", "PESHIN", "ASR", "SHOM", "XUFTON", "VITR"];

type DashboardSummaryItem = QazaSummaryItem & {
  totalCount: number;
  completedCount: number;
  remainingCount: number;
};

const loadingSummary = ref(false);
const summary = ref<DashboardSummaryItem[]>([]);
const history = ref<QazaHistoryItem[]>([]);
const historyPage = ref(0);
const historySize = ref(10);
const historySizeOptions = [5, 10, 20, 50];
const historyTotalPages = ref(1);
const historyTotalElements = ref(0);
const message = ref("");
const messageType = ref<"success" | "error" | "info">("info");
const actionLoading = reactive<Partial<Record<PrayerType, boolean>>>({});

const initForm = reactive({
  fromDate: "",
  toDate: ""
});
const initErrors = reactive<Record<string, string>>({});

const displaySummary = computed<DashboardSummaryItem[]>(() => {
  const counter = new Map<PrayerType, DashboardSummaryItem>();
  summary.value.forEach((item) => counter.set(item.prayerType, item));
  return prayerTypes.map((p) => ({
    prayerType: p,
    count: counter.get(p)?.remainingCount ?? 0,
    totalCount: counter.get(p)?.totalCount ?? 0,
    completedCount: counter.get(p)?.completedCount ?? 0,
    remainingCount: counter.get(p)?.remainingCount ?? 0
  }));
});

const totalQazaCount = computed(() => displaySummary.value.reduce((acc, item) => acc + Number(item.remainingCount ?? 0), 0));
const totalCompletedCount = computed(() =>
  displaySummary.value.reduce((acc, item) => acc + Number(item.completedCount ?? 0), 0)
);
const totalPlannedCount = computed(() =>
  displaySummary.value.reduce((acc, item) => acc + Number(item.totalCount ?? item.remainingCount ?? 0), 0)
);

function normalizeSummary(payload: unknown): DashboardSummaryItem[] {
  const typeMap: Record<string, PrayerType> = {
    FJR: "BOMDOD",
    DHR: "PESHIN",
    ASR: "ASR",
    MGR: "SHOM",
    ISH: "XUFTON",
    BOMDOD: "BOMDOD",
    PESHIN: "PESHIN",
    SHOM: "SHOM",
    XUFTON: "XUFTON",
    VITR: "VITR"
  };

  const toPrayerType = (value: unknown): PrayerType | null => {
    const key = String(value ?? "").trim().toUpperCase();
    return typeMap[key] ?? null;
  };

  const toSummaryItem = (item: Record<string, unknown>, fallbackType?: PrayerType): DashboardSummaryItem | null => {
    const prayerType = fallbackType ?? toPrayerType(item.prayerType);
    if (!prayerType) return null;

    const totalCount = Number(item.totalCount ?? item.count ?? item.remainingCount ?? 0);
    const completedCount = Number(item.completedCount ?? 0);
    const remainingFallback = totalCount - completedCount;
    const remainingCount = Number(item.remainingCount ?? item.count ?? remainingFallback);

    return {
      prayerType,
      count: remainingCount,
      totalCount: Math.max(0, totalCount),
      completedCount: Math.max(0, completedCount),
      remainingCount: Math.max(0, remainingCount)
    };
  };

  if (Array.isArray(payload)) {
    return payload
      .map((item) => toSummaryItem(item as Record<string, unknown>))
      .filter((item): item is DashboardSummaryItem => Boolean(item));
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    return prayerTypes
      .map((p) => toSummaryItem(record[p] as Record<string, unknown>, p))
      .filter((item): item is DashboardSummaryItem => Boolean(item));
  }

  return [];
}

function normalizeHistoryPage(payload: unknown): PageResponse<QazaHistoryItem> {
  const raw = payload as Partial<PageResponse<QazaHistoryItem>>;
  const content = Array.isArray(raw?.content) ? raw.content : [];
  const totalPages = Number(raw?.totalPages ?? 1);
  const pageNumber = Number(raw?.number ?? 0);
  const size = Number(raw?.size ?? historySize.value);
  const totalElements = Number(raw?.totalElements ?? content.length);

  return {
    content,
    number: Number.isFinite(pageNumber) ? pageNumber : 0,
    size: Number.isFinite(size) ? size : historySize.value,
    totalElements: Number.isFinite(totalElements) ? totalElements : content.length,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
    first: Boolean(raw?.first ?? pageNumber <= 0),
    last: Boolean(raw?.last ?? pageNumber >= totalPages - 1)
  };
}

function showMessage(type: "success" | "error" | "info", text: string) {
  messageType.value = type;
  message.value = text;
}

async function loadSummaryOnly() {
  const response = await getAllQaza();
  summary.value = normalizeSummary(response.data);
}

async function loadHistoryOnly() {
  const response = await getQazaHistory({ page: historyPage.value, size: historySize.value });
  const pageData = normalizeHistoryPage(response.data);
  history.value = pageData.content;
  historyPage.value = pageData.number;
  historySize.value = pageData.size;
  historyTotalPages.value = pageData.totalPages;
  historyTotalElements.value = pageData.totalElements;
}

async function loadAll() {
  loadingSummary.value = true;
  try {
    await Promise.all([loadSummaryOnly(), loadHistoryOnly()]);
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    loadingSummary.value = false;
  }
}

async function changeHistoryPage(nextPage: number) {
  if (nextPage < 0 || nextPage >= historyTotalPages.value || loadingSummary.value) return;
  historyPage.value = nextPage;
  loadingSummary.value = true;
  try {
    await loadHistoryOnly();
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    loadingSummary.value = false;
  }
}

async function changeHistorySize(nextSize: number) {
  if (!historySizeOptions.includes(nextSize) || loadingSummary.value) return;
  historySize.value = nextSize;
  historyPage.value = 0;
  loadingSummary.value = true;
  try {
    await loadHistoryOnly();
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    loadingSummary.value = false;
  }
}

async function onQuickAdd(prayerType: PrayerType) {
  actionLoading[prayerType] = true;
  try {
    await addQaza(prayerType, 1);
    showMessage("success", `${prayerType}: +1 qo'shildi`);
    await loadSummaryOnly();
    await loadHistoryOnly();
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    actionLoading[prayerType] = false;
  }
}

async function onQuickComplete(prayerType: PrayerType) {
  actionLoading[prayerType] = true;
  try {
    await completeQaza({ prayerType, count: 1 });
    showMessage("success", `${prayerType}: 1 ta bajarildi`);
    await loadSummaryOnly();
    await loadHistoryOnly();
  } catch (error) {
    showMessage("error", (error as Error).message);
  } finally {
    actionLoading[prayerType] = false;
  }
}

async function onInitQaza() {
  Object.keys(initErrors).forEach((k) => (initErrors[k] = ""));
  const parsed = dateRangeSchema.safeParse(initForm);
  if (!parsed.success) {
    parsed.error.issues.forEach((issue) => {
      const field = String(issue.path[0] ?? "form");
      initErrors[field] = issue.message;
    });
    return;
  }
  try {
    await initQaza(parsed.data);
    showMessage("success", "Qazo init qilindi");
    await loadAll();
  } catch (error) {
    showMessage("error", (error as Error).message);
  }
}

onMounted(loadAll);
</script>

