<template>
  <RouterLink class="bottom-tab-item" :class="{ 'is-active': active }" :to="to">
    <span class="bottom-tab-icon" v-html="icon" />
    <span class="bottom-tab-label">{{ label }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

defineProps<{
  to: string;
  label: string;
  icon: string;
  active?: boolean;
}>();
</script>

