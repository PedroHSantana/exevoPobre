importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// The app registers this worker with the Firebase config passed as query
// params (see registerPushServiceWorker in src/lib/push.js), since a plain
// public/ file isn't processed by Vite's env-var injection.
const params = new URLSearchParams(self.location.search);
firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Tibia Bazaar Finder', {
    body,
    icon: '/favicon.svg',
    data: { link: payload.data?.link || null },
  });
});

// Overriding onBackgroundMessage above replaces Firebase's own click
// handling, so we open the filtered bazaar link ourselves.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link;
  if (!link) return;
  event.waitUntil(clients.openWindow(link));
});
