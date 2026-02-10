import { computed, onMounted, ref, watch } from "vue";

export type Theme = "light" | "dark";

const THEME_KEY = "qazo-tracker-theme";
const theme = ref<Theme>("light");

function applyTheme(nextTheme: Theme) {
  theme.value = nextTheme;
  document.documentElement.classList.toggle("dark", nextTheme === "dark");
  document.body.classList.remove("theme-light", "theme-dark");
  document.body.classList.add(nextTheme === "dark" ? "theme-dark" : "theme-light");
  localStorage.setItem(THEME_KEY, nextTheme);
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  if (saved === "light" || saved === "dark") {
    applyTheme(saved);
    return;
  }
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function toggleTheme() {
  applyTheme(theme.value === "light" ? "dark" : "light");
}

export function useTheme() {
  onMounted(() => {
    loadTheme();
  });

  watch(theme, (value) => applyTheme(value));

  return {
    theme,
    isDark: computed(() => theme.value === "dark"),
    applyTheme,
    toggleTheme
  };
}

