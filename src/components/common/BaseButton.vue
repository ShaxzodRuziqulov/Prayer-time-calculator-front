<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60"
    :class="variantClass"
  >
    <span v-if="loading">Yuklanmoqda...</span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Variant = "primary" | "danger" | "secondary";

const props = withDefaults(
  defineProps<{
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    variant?: Variant;
  }>(),
  {
    type: "button",
    disabled: false,
    loading: false,
    variant: "primary"
  }
);

const variantClass = computed(() => {
  switch (props.variant) {
    case "danger":
      return "keep-light-text rounded-lg border border-red-500/50 bg-red-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-red-600 focus:ring-2 focus:ring-red-500/50";
    case "secondary":
      return "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 focus:ring-2 focus:ring-slate-300/50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-slate-500/50";
    default:
      return "keep-light-text rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-sky-600 focus:ring-2 focus:ring-sky-500/50 dark:bg-sky-600 dark:hover:bg-sky-500 dark:focus:ring-sky-400/50";
  }
});
</script>
