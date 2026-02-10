<template>
  <section class="page-shell">
    <div class="page-hero">
      <h1 class="page-title">Guest Hisobini O'tkazish</h1>
      <p class="page-subtitle">Guest akkauntni oddiy akkauntga aylantiring.</p>
    </div>

    <BaseAlert type="info">Joriy guest token bilan hisobingiz ro'yxatdan o'tgan holatga o'tkaziladi.</BaseAlert>
    <BaseAlert v-if="errorMessage" type="error">{{ errorMessage }}</BaseAlert>
    <BaseAlert v-if="successMessage" type="success">{{ successMessage }}</BaseAlert>

    <form class="panel space-y-3" @submit.prevent="onSubmit">
      <BaseInput v-model="form.username" label="Foydalanuvchi nomi" :error="errors.username" />
      <BaseInput v-model="form.email" type="email" label="Email" :error="errors.email" />
      <BaseInput v-model="form.password" type="password" label="Parol" :error="errors.password" />
      <BaseButton type="submit" :loading="authStore.loading">O'tkazish</BaseButton>
    </form>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { z } from "zod";
import BaseInput from "../components/common/BaseInput.vue";
import BaseButton from "../components/common/BaseButton.vue";
import BaseAlert from "../components/common/BaseAlert.vue";
import { useAuthStore } from "../stores/auth";
import { registerSchema } from "../utils/validation";

const router = useRouter();
const authStore = useAuthStore();
const errorMessage = ref("");
const successMessage = ref("");
const errors = reactive<Record<string, string>>({});

const form = reactive({
  username: "",
  email: "",
  password: ""
});

function applyZodErrors(error: z.ZodError) {
  Object.keys(errors).forEach((k) => (errors[k] = ""));
  error.issues.forEach((issue) => {
    const field = String(issue.path[0] ?? "form");
    errors[field] = issue.message;
  });
}

async function onSubmit() {
  errorMessage.value = "";
  successMessage.value = "";
  const parsed = registerSchema.safeParse(form);
  if (!parsed.success) {
    applyZodErrors(parsed.error);
    return;
  }

  try {
    await authStore.convertGuest(parsed.data);
    successMessage.value = "Guest akkaunt muvaffaqiyatli o'tkazildi";
    await router.push("/dashboard");
  } catch (error) {
    errorMessage.value = (error as Error).message;
  }
}
</script>

