self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_error) {
    payload = {};
  }

  const notification = payload.notification || payload.data || {};
  const title = notification.title || "Prayer Time";
  const options = {
    body: notification.body || "Yangi eslatma keldi",
    icon: "/favicon.svg",
    data: notification
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/reminders"));
});
