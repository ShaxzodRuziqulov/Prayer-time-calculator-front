<template>
  <div class="dashboard-focus rounded-2xl border border-sky-700/40 bg-gradient-to-r from-cyan-900/40 via-sky-900/40 to-blue-900/30 p-5 shadow-sm">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="dashboard-focus-eyebrow text-xs uppercase tracking-[0.2em] text-cyan-200/80">{{ eyebrow }}</p>
        <h2 class="dashboard-focus-value mt-2 text-4xl font-extrabold leading-none text-white sm:text-5xl">{{ total }}</h2>
        <p class="dashboard-focus-text mt-2 text-sm text-cyan-100/90">{{ description }}</p>
      </div>
      <div class="rounded-xl border border-cyan-300/30 bg-slate-900/40 px-4 py-3">
        <p class="dashboard-focus-text text-xs uppercase tracking-wide text-cyan-100/90">Bajarilgan</p>
        <p class="dashboard-focus-value mt-1 text-2xl font-bold text-white">{{ progressPercent }}%</p>
      </div>
    </div>
    <div class="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-700/70">
      <div
        class="h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 transition-all duration-500"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string;
  total: number;
  description: string;
  progressPercent: number;
}>();
</script>

