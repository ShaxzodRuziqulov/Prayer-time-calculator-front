<template>
  <div class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5" :class="chipClass.container">
    <span class="text-xs font-medium" :class="chipClass.text">{{ label }}</span>
    <span class="text-sm font-bold" :class="chipClass.textBold">{{ count }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  label: string;
  count: number;
}>();

const prayerColorMap: Record<string, { container: string; text: string; textBold: string }> = {
  BOMDOD: {
    container: "border-violet-200 bg-violet-50 dark:border-violet-500/30 dark:bg-violet-900/30",
    text: "text-violet-700 dark:text-violet-300",
    textBold: "text-violet-900 dark:text-violet-100"
  },
  PESHIN: {
    container: "border-blue-200 bg-blue-50 dark:border-blue-500/30 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    textBold: "text-blue-900 dark:text-blue-100"
  },
  ASR: {
    container: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-300",
    textBold: "text-emerald-900 dark:text-emerald-100"
  },
  SHOM: {
    container: "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
    textBold: "text-amber-900 dark:text-amber-100"
  },
  XUFTON: {
    container: "border-indigo-200 bg-indigo-50 dark:border-indigo-500/30 dark:bg-indigo-900/30",
    text: "text-indigo-700 dark:text-indigo-300",
    textBold: "text-indigo-900 dark:text-indigo-100"
  },
  VITR: {
    container: "border-pink-200 bg-pink-50 dark:border-pink-500/30 dark:bg-pink-900/30",
    text: "text-pink-700 dark:text-pink-300",
    textBold: "text-pink-900 dark:text-pink-100"
  }
};

const chipClass = computed(() => {
  return (
    prayerColorMap[props.label] ?? {
      container: "border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800",
      text: "text-slate-700 dark:text-slate-300",
      textBold: "text-slate-900 dark:text-white"
    }
  );
});
</script>
