<template>
  <div class="rounded-2xl border border-slate-700 bg-slate-800/80 p-4">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">{{ title }}</h2>
      <span class="text-xs text-slate-400">Distribution</span>
    </div>
    <div class="space-y-2">
      <div v-for="item in items" :key="item.label" class="rounded-xl border border-slate-700 bg-slate-900/50 p-2.5">
        <div class="mb-1 flex items-center justify-between text-xs">
          <span class="uppercase tracking-wider text-slate-400">{{ item.label }}</span>
          <span class="font-semibold text-slate-200">{{ item.value }}</span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-slate-700">
          <div class="h-full rounded-full bg-gradient-to-r" :class="gradientFor(item.label)" :style="{ width: `${toPercent(item.value)}%` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type StatsItem = {
  label: string;
  value: number;
};

const props = defineProps<{
  title: string;
  items: StatsItem[];
}>();

const maxValue = computed(() => Math.max(1, ...props.items.map((item) => item.value)));

function toPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round((value / maxValue.value) * 100)));
}

function gradientFor(label: string): string {
  const map: Record<string, string> = {
    BOMDOD: "from-violet-400 to-purple-500",
    PESHIN: "from-blue-400 to-cyan-500",
    ASR: "from-emerald-400 to-teal-500",
    SHOM: "from-amber-400 to-orange-500",
    XUFTON: "from-indigo-400 to-blue-500",
    VITR: "from-pink-400 to-rose-500"
  };
  return map[label] ?? "from-sky-400 to-emerald-400";
}
</script>
