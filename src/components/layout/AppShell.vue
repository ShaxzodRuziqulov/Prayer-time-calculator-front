<template>
  <div class="app-shell">
    <header class="app-header border-b border-slate-700/70 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div class="flex min-w-0 items-center gap-3">
          <RouterLink to="/dashboard" class="app-brand truncate text-lg font-bold">Qazo Tracker</RouterLink>
          <span class="hidden rounded-full border border-slate-600/70 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300 sm:inline-flex">
            {{ currentPageLabel }}
          </span>
        </div>
        <nav v-if="authStore.isAuthenticated" class="hidden flex-wrap items-center justify-end gap-2 text-sm md:flex">
          <button
            class="theme-toggle group relative rounded-lg p-2.5 transition-all duration-300"
            :class="isDark ? 'bg-slate-700 text-amber-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
            :title="isDark ? 'Kunduzgi rejim' : 'Kechki rejim'"
            :aria-label="isDark ? 'Kunduzgi rejim' : 'Kechki rejim'"
            @click="toggleTheme"
          >
            <svg
              v-if="!isDark"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              class="h-5 w-5 transform transition-transform duration-300 group-hover:rotate-45"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              class="h-5 w-5 transform transition-transform duration-300 group-hover:-rotate-12"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>
          <RouterLink class="app-nav-link" to="/dashboard">Dashboard</RouterLink>
          <RouterLink class="app-nav-link" to="/profile">Profile</RouterLink>
          <RouterLink class="app-nav-link" to="/settings/reminders">Reminders</RouterLink>
          <RouterLink class="app-nav-link" to="/goals">Goals</RouterLink>
          <RouterLink
            v-if="authStore.isGuest"
            class="rounded-md bg-sky-700 px-2 py-1 text-sky-100 hover:bg-sky-800"
            to="/auth"
          >
            Login
          </RouterLink>
          <RouterLink
            v-if="authStore.isGuest"
            class="rounded-md bg-amber-700 px-2 py-1 text-amber-100 hover:bg-amber-800"
            to="/convert-guest"
          >
            Convert Guest
          </RouterLink>
          <button
            v-if="!authStore.isGuest"
            class="rounded-md bg-slate-700 px-2 py-1 hover:bg-slate-600"
            @click="onLogout"
          >
            Logout
          </button>
        </nav>
        <button
          v-else
          class="theme-toggle group relative rounded-lg p-2.5 transition-all duration-300"
          :class="isDark ? 'bg-slate-700 text-amber-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
          :title="isDark ? 'Kunduzgi rejim' : 'Kechki rejim'"
          :aria-label="isDark ? 'Kunduzgi rejim' : 'Kechki rejim'"
          @click="toggleTheme"
        >
          <svg
            v-if="!isDark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            class="h-5 w-5 transform transition-transform duration-300 group-hover:rotate-45"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            class="h-5 w-5 transform transition-transform duration-300 group-hover:-rotate-12"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-6">
      <slot />
    </main>

    <nav v-if="authStore.isAuthenticated" class="bottom-tab-nav md:hidden">
      <BottomNavTab
        v-for="item in bottomTabs"
        :key="item.to"
        :to="item.to"
        :label="item.label"
        :icon="item.icon"
        :active="isTabActive(item.to)"
      />
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import BottomNavTab from "../common/BottomNavTab.vue";
import { useAuthStore } from "../../stores/auth";
import { useTheme } from "../../composables/useTheme";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { isDark, toggleTheme } = useTheme();
const bottomTabs = [
  {
    label: "Home",
    to: "/dashboard",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1h-5v-6h-6v6H4a1 1 0 01-1-1v-10.5z"/></svg>`
  },
  {
    label: "Add",
    to: "/dashboard#quick-actions",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 5v14M5 12h14"/></svg>`
  },
  {
    label: "Stats",
    to: "/goals",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 19h16M7 16V9m5 7V5m5 11v-6"/></svg>`
  },
  {
    label: "Settings",
    to: "/settings/reminders",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15.25a3.25 3.25 0 100-6.5 3.25 3.25 0 000 6.5z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19.4 15a1 1 0 00.2 1.1l.1.1a1 1 0 010 1.4l-1.2 1.2a1 1 0 01-1.4 0l-.1-.1a1 1 0 00-1.1-.2 1 1 0 00-.6.9V20a1 1 0 01-1 1h-1.8a1 1 0 01-1-1v-.2a1 1 0 00-.6-.9 1 1 0 00-1.1.2l-.1.1a1 1 0 01-1.4 0l-1.2-1.2a1 1 0 010-1.4l.1-.1a1 1 0 00.2-1.1 1 1 0 00-.9-.6H4a1 1 0 01-1-1v-1.8a1 1 0 011-1h.2a1 1 0 00.9-.6 1 1 0 00-.2-1.1l-.1-.1a1 1 0 010-1.4l1.2-1.2a1 1 0 011.4 0l.1.1a1 1 0 001.1.2 1 1 0 00.6-.9V4a1 1 0 011-1h1.8a1 1 0 011 1v.2a1 1 0 00.6.9 1 1 0 001.1-.2l.1-.1a1 1 0 011.4 0l1.2 1.2a1 1 0 010 1.4l-.1.1a1 1 0 00-.2 1.1 1 1 0 00.9.6H20a1 1 0 011 1V12a1 1 0 01-1 1h-.2a1 1 0 00-.9.6z"/></svg>`
  }
];
const currentPageLabel = computed(() => {
  const routeName = String(route.name ?? "");
  if (routeName === "dashboard") return "Dashboard";
  if (routeName === "profile") return "Profile";
  if (routeName === "reminders") return "Reminders";
  if (routeName === "goals") return "Goals";
  if (routeName === "auth") return "Auth";
  if (routeName === "convert-guest") return "Convert Guest";
  return route.path || "Unknown";
});
const isTabActive = (tabPath: string) => {
  const cleanTabPath = tabPath.split("#")[0];
  if (cleanTabPath === "/dashboard") {
    return route.path === "/dashboard";
  }
  return route.path.startsWith(cleanTabPath);
};

function onLogout() {
  authStore.logout();
  router.push("/auth");
}
</script>
