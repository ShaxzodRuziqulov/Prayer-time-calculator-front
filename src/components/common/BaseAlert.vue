<template>
  <div class="rounded-lg border px-4 py-3 text-sm" :class="styleClass">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    type?: "success" | "error" | "info";
  }>(),
  { type: "info" }
);

const styleClass = computed(() => {
  if (props.type === "success") {
    return "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-900/30 dark:text-emerald-200";
  }
  if (props.type === "error") {
    return "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-900/30 dark:text-rose-200";
  }
  return "border border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-900/30 dark:text-sky-200";
});
</script>
