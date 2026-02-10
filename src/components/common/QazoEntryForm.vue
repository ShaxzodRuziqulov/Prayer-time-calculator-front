<template>
  <form class="rounded-xl border border-slate-700 bg-slate-800 p-5 shadow-sm" @submit.prevent="$emit('submit')">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-lg font-semibold text-white">{{ title }}</h2>
      <span class="rounded-md bg-emerald-900/60 px-2 py-1 text-xs text-emerald-200">Range</span>
    </div>
    <BaseInput v-model="model.fromDate" type="date" label="From date" :error="errors.fromDate" />
    <div class="mt-3">
      <BaseInput v-model="model.toDate" type="date" label="To date" :error="errors.toDate" />
    </div>
    <div class="mt-4">
      <BaseButton type="submit">{{ submitText }}</BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import BaseButton from "./BaseButton.vue";
import BaseInput from "./BaseInput.vue";

const model = defineModel<{ fromDate: string; toDate: string }>({ required: true });

withDefaults(
  defineProps<{
    title?: string;
    submitText?: string;
    errors: Record<string, string>;
  }>(),
  {
    title: "Init by date",
    submitText: "Init"
  }
);

defineEmits<{
  (e: "submit"): void;
}>();
</script>

