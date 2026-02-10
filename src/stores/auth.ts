import { computed, ref } from "vue";
import { defineStore } from "pinia";
import * as authApi from "../api/modules/auth";
import * as userApi from "../api/modules/user";
import type { AuthResponse, User } from "../types";

const AUTH_TOKEN_KEY = "prayer_token";
const AUTH_HEADER_KEY = "prayer_auth_header";
const GUEST_KEY = "prayer_is_guest";
const DEVICE_ID_KEY = "prayer_device_id";

export const useAuthStore = defineStore("auth", () => {
  const token = ref<string | null>(localStorage.getItem(AUTH_TOKEN_KEY));
  const authHeader = ref<string | null>(localStorage.getItem(AUTH_HEADER_KEY));
  const isGuest = ref(localStorage.getItem(GUEST_KEY) === "true");
  const deviceId = ref<string | null>(localStorage.getItem(DEVICE_ID_KEY));
  const me = ref<User | null>(null);
  const loading = ref(false);
  const initialized = ref(false);
  let initializePromise: Promise<void> | null = null;

  const isAuthenticated = computed(() => Boolean(token.value));

  function extractToken(payload: AuthResponse | undefined): string | null {
    if (!payload) {
      return null;
    }
    return payload.token ?? payload.accessToken ?? payload.jwt ?? null;
  }

  function extractAuthHeader(payload: AuthResponse | undefined, rawToken: string): string {
    const tokenType = payload?.tokenType?.trim();
    if (rawToken.includes(" ")) {
      return rawToken;
    }
    return `${tokenType || "Bearer"} ${rawToken}`;
  }

  function setSession(newToken: string, newAuthHeader: string, guestSession: boolean, nextDeviceId?: string) {
    token.value = newToken;
    authHeader.value = newAuthHeader;
    isGuest.value = guestSession;
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    localStorage.setItem(AUTH_HEADER_KEY, newAuthHeader);
    localStorage.setItem(GUEST_KEY, String(guestSession));
    if (nextDeviceId) {
      deviceId.value = nextDeviceId;
      localStorage.setItem(DEVICE_ID_KEY, nextDeviceId);
    }
  }

  function clearSession() {
    token.value = null;
    authHeader.value = null;
    isGuest.value = false;
    me.value = null;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_HEADER_KEY);
    localStorage.removeItem(GUEST_KEY);
    localStorage.removeItem(DEVICE_ID_KEY);
  }

  function resetAuthStateForFreshLogin() {
    token.value = null;
    authHeader.value = null;
    isGuest.value = false;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_HEADER_KEY);
    localStorage.removeItem(GUEST_KEY);
  }

  async function initialize() {
    if (initialized.value) {
      return;
    }
    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = (async () => {
      if (!token.value) {
        try {
          await loginGuest(deviceId.value ?? undefined);
        } catch {
          clearSession();
        } finally {
          initialized.value = true;
        }
        return;
      }

      if (isGuest.value) {
        me.value = null;
        initialized.value = true;
        return;
      }

      try {
        await fetchMe();
      } catch {
        if (!isGuest.value) {
          clearSession();
        }
      } finally {
        initialized.value = true;
      }
    })();

    try {
      await initializePromise;
    } finally {
      initializePromise = null;
    }
  }

  async function login(payload: authApi.LoginPayload) {
    loading.value = true;
    try {
      resetAuthStateForFreshLogin();
      const response = await authApi.login(payload, deviceId.value ?? undefined);
      const nextToken = extractToken(response.data);
      if (!nextToken) {
        throw new Error("Token qaytmadi");
      }
      const nextAuthHeader = extractAuthHeader(response.data, nextToken);
      setSession(nextToken, nextAuthHeader, false, response.data.deviceId ?? deviceId.value ?? undefined);
      try {
        await fetchMe();
      } catch {
        // Token already received; avoid breaking login flow on transient /me errors.
        me.value = null;
      }
    } finally {
      loading.value = false;
    }
  }

  async function register(payload: authApi.RegisterPayload) {
    loading.value = true;
    try {
      await authApi.register(payload);
      await login({ username: payload.username, password: payload.password });
    } finally {
      loading.value = false;
    }
  }

  async function loginGuest(nextDeviceId?: string) {
    loading.value = true;
    try {
      resetAuthStateForFreshLogin();
      const response = await authApi.guest(nextDeviceId ? { deviceId: nextDeviceId } : undefined);
      const nextToken = extractToken(response.data);
      if (!nextToken) {
        throw new Error("Guest token qaytmadi");
      }
      const nextAuthHeader = extractAuthHeader(response.data, nextToken);
      setSession(nextToken, nextAuthHeader, true, response.data.deviceId ?? nextDeviceId);
      me.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function convertGuest(payload: authApi.RegisterPayload) {
    loading.value = true;
    try {
      const response = await authApi.convertGuest(payload);
      if (typeof response.data !== "string") {
        const nextToken = extractToken(response.data as AuthResponse);
        if (nextToken) {
          const nextAuthHeader = extractAuthHeader(response.data as AuthResponse, nextToken);
          setSession(nextToken, nextAuthHeader, false);
        }
      } else {
        isGuest.value = false;
        localStorage.setItem(GUEST_KEY, "false");
      }
      try {
        await fetchMe();
      } catch {
        me.value = null;
      }
    } finally {
      loading.value = false;
    }
  }

  async function fetchMe() {
    const response = await userApi.getMe();
    me.value = response.data;
    if (response.data.roles?.some((role) => role.toUpperCase().includes("GUEST"))) {
      isGuest.value = true;
      localStorage.setItem(GUEST_KEY, "true");
    }
  }

  function logout() {
    clearSession();
  }

  return {
    token,
    authHeader,
    isGuest,
    deviceId,
    me,
    loading,
    initialized,
    isAuthenticated,
    initialize,
    login,
    register,
    loginGuest,
    convertGuest,
    fetchMe,
    logout
  };
});
