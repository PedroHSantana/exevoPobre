// Handles the raw Web Push event ourselves instead of relying on
// firebase-messaging-compat's onBackgroundMessage, which Firebase only
// invokes when no tab has focus — meaning an open-but-unfocused tab got
// nothing but the plain OS toast, since service workers can't play audio.
// By always both showing the notification AND postMessage-ing every open
// tab (focused or not), the page's own beep/banner logic (see
// PushAlertBanner.jsx) can react consistently regardless of focus state.
// Take over immediately on install/activate instead of waiting for every
// tab using the previous service worker to close first.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || 'Tibia Bazaar Finder';
  const body = notification.body || '';
  const link = data.link || null;

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, {
        body,
        icon: '/favicon.svg',
        data: { link },
      }),
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
        clientList.forEach((client) => client.postMessage({ type: 'PUSH_RECEIVED', title, body, link }));
      }),
    ])
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link;
  if (!link) return;
  event.waitUntil(self.clients.openWindow(link));
});
