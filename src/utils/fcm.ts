import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
}

function readFirebaseConfig(): FirebaseWebConfig {
  return {
    apiKey: String(import.meta.env.VITE_FIREBASE_API_KEY ?? ""),
    authDomain: String(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? ""),
    projectId: String(import.meta.env.VITE_FIREBASE_PROJECT_ID ?? ""),
    storageBucket: String(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? ""),
    messagingSenderId: String(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? ""),
    appId: String(import.meta.env.VITE_FIREBASE_APP_ID ?? ""),
    vapidKey: String(import.meta.env.VITE_FIREBASE_VAPID_KEY ?? "")
  };
}

function ensureConfigured(config: FirebaseWebConfig) {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`FCM config yetarli emas: ${missing.join(", ")}`);
  }
}

function getFirebaseApp(config: FirebaseWebConfig): FirebaseApp {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId
  });
}

export async function getWebFcmToken(): Promise<string> {
  if (!("Notification" in window)) {
    throw new Error("Brauzer notification API ni qo'llamaydi");
  }
  if (!("serviceWorker" in navigator)) {
    throw new Error("Brauzer service worker ni qo'llamaydi");
  }

  const config = readFirebaseConfig();
  ensureConfigured(config);

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification ruxsati berilmadi");
  }

  const app = getFirebaseApp(config);
  const messaging = getMessaging(app);
  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const token = await getToken(messaging, {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration: registration
  });

  if (!token) {
    throw new Error("FCM token olib bo'lmadi");
  }

  return token;
}
