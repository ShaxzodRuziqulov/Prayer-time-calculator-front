import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) {
      return { el: to.hash, behavior: "smooth" };
    }
    return { top: 0 };
  },
  routes: [
    {
      path: "/",
      redirect: "/dashboard"
    },
    {
      path: "/auth",
      name: "auth",
      component: () => import("../views/AuthView.vue")
    },
    {
      path: "/convert-guest",
      name: "convert-guest",
      component: () => import("../views/ConvertGuestView.vue"),
      meta: { requiresAuth: true, onlyGuestUser: true }
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/settings/reminders",
      name: "reminders",
      component: () => import("../views/RemindersView.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/goals",
      name: "goals",
      component: () => import("../views/GoalsView.vue"),
      meta: { requiresAuth: true }
    }
  ]
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  if (!authStore.initialized) {
    await authStore.initialize();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: "/auth" };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { path: "/dashboard" };
  }

  if (to.meta.onlyGuestUser && !authStore.isGuest) {
    return { path: "/dashboard" };
  }

  return true;
});

export default router;
