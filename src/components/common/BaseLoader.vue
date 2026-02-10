<template>
  <div role="status" aria-live="polite" class="space-y-2">
    <div class="animate-pulse space-y-2">
      <div class="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700"></div>
      <div class="h-3 rounded bg-slate-200 dark:bg-slate-700"></div>
    </div>
    <span class="text-xs text-slate-500 dark:text-slate-400">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
  }>(),
  {
    label: "Yuklanmoqda..."
  }
);
</script>
