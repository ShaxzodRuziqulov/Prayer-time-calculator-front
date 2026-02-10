<template>
  <button type="button" class="w-full rounded-xl border border-slate-600 px-3 py-2 text-left text-sm" @click="$emit('toggle')">
    {{ label }}: <span class="font-semibold">{{ enabled ? "On" : "Off" }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  enabled: boolean;
}>();

defineEmits<{
  (e: "toggle"): void;
}>();
</script>

