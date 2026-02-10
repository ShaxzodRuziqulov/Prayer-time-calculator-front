import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import { useAuthStore } from "./stores/auth";

async function bootstrap() {
  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  app.use(router);

  const authStore = useAuthStore();
  await authStore.initialize();
  await router.isReady();

  app.mount("#app");
}

bootstrap();
