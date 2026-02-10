<template>
  <section class="page-shell">
    <div class="page-hero">
      <h1 class="page-title">Kirish</h1>
      <p class="page-subtitle">Tizimga kirish, ro'yxatdan o'tish yoki guest rejim.</p>
    </div>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="item in tabs"
        :key="item"
        class="rounded-lg px-3 py-2 text-sm font-semibold transition-all"
        :class="activeTab === item ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'"
        @click="activeTab = item"
      >
        {{ item }}
      </button>
    </div>

    <BaseAlert v-if="errorMessage" type="error">{{ errorMessage }}</BaseAlert>
    <BaseAlert v-if="successMessage" type="success">{{ successMessage }}</BaseAlert>

    <form v-if="activeTab === 'Login'" class="panel space-y-3" @submit.prevent="onLogin">
      <BaseInput v-model="loginForm.username" label="Foydalanuvchi nomi" :error="errors.username" />
      <BaseInput v-model="loginForm.password" type="password" label="Parol" :error="errors.password" />
      <BaseButton type="submit" :loading="authStore.loading">Kirish</BaseButton>
    </form>

    <form v-if="activeTab === 'Register'" class="panel space-y-3" @submit.prevent="onRegister">
      <BaseInput v-model="registerForm.username" label="Foydalanuvchi nomi" :error="errors.username" />
      <BaseInput v-model="registerForm.email" type="email" label="Email" :error="errors.email" />
      <BaseInput v-model="registerForm.password" type="password" label="Parol" :error="errors.password" />
      <BaseButton type="submit" :loading="authStore.loading">Ro'yxatdan o'tish</BaseButton>
    </form>

    <form v-if="activeTab === 'Guest'" class="panel space-y-3" @submit.prevent="onGuest">
      <BaseInput v-model="guestDeviceId" label="Qurilma ID (ixtiyoriy)" />
      <BaseButton type="submit" :loading="authStore.loading">Guest kirish</BaseButton>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import BaseButton from "../components/common/BaseButton.vue";
import BaseInput from "../components/common/BaseInput.vue";
import BaseAlert from "../components/common/BaseAlert.vue";
import { useAuthStore } from "../stores/auth";
import { loginSchema, registerSchema } from "../utils/validation";
import { z } from "zod";

type Tab = "Login" | "Register" | "Guest";

const authStore = useAuthStore();
const router = useRouter();

const tabs: Tab[] = ["Login", "Register", "Guest"];
const activeTab = ref<Tab>("Login");
const errorMessage = ref("");
const successMessage = ref("");
const guestDeviceId = ref("");
const errors = reactive<Record<string, string>>({});

const loginForm = reactive({
  username: "",
  password: ""
});

const registerForm = reactive({
  username: "",
  email: "",
  password: ""
});

function clearState() {
  errorMessage.value = "";
  successMessage.value = "";
  Object.keys(errors).forEach((k) => (errors[k] = ""));
}

function applyZodErrors(error: z.ZodError) {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
  error.issues.forEach((issue) => {
    const field = String(issue.path[0] ?? "form");
    errors[field] = issue.message;
  });
}

async function onLogin() {
  clearState();
  const parsed = loginSchema.safeParse(loginForm);
  if (!parsed.success) {
    applyZodErrors(parsed.error);
    return;
  }
  try {
    await authStore.login(parsed.data);
    successMessage.value = "Muvaffaqiyatli kirdingiz";
    await router.push("/dashboard");
    if (router.currentRoute.value.path === "/auth" && authStore.isAuthenticated) {
      window.location.href = "/dashboard";
    }
  } catch (error) {
    errorMessage.value = (error as Error).message;
  }
}

async function onRegister() {
  clearState();
  const parsed = registerSchema.safeParse(registerForm);
  if (!parsed.success) {
    applyZodErrors(parsed.error);
    return;
  }
  try {
    await authStore.register(parsed.data);
    successMessage.value = "Ro'yxatdan o'tish muvaffaqiyatli";
    await router.push("/dashboard");
    if (router.currentRoute.value.path === "/auth" && authStore.isAuthenticated) {
      window.location.href = "/dashboard";
    }
  } catch (error) {
    errorMessage.value = (error as Error).message;
  }
}

async function onGuest() {
  clearState();
  try {
    await authStore.loginGuest(guestDeviceId.value || undefined);
    successMessage.value = "Guest sifatida kirdingiz";
    await router.push("/dashboard");
    if (router.currentRoute.value.path === "/auth" && authStore.isAuthenticated) {
      window.location.href = "/dashboard";
    }
  } catch (error) {
    errorMessage.value = (error as Error).message;
  }
}
</script>

