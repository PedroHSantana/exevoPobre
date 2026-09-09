import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

export async function getMessagingIfSupported() {
  if (!(await isSupported())) return null;
  return getMessaging(firebaseApp);
}

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Firebase only auto-shows a system notification for pushes that arrive
// while the tab is in the background (via the service worker). When the
// tab is focused, `onMessage` fires instead but nothing is displayed
// unless we do it ourselves — without this, a push sent while the user is
// looking at the site does nothing visible at all.
export async function listenForForegroundMessages(onPayload) {
  if (Notification.permission !== 'granted') return;
  const messaging = await getMessagingIfSupported();
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    const { title, body } = payload.notification || {};
    const link = payload.data?.link || null;
    if (title) {
      const notification = new Notification(title, { body, icon: '/favicon.svg' });
      if (link) notification.onclick = () => window.location.assign(link);
    }
    onPayload?.({ title, body, link });
  });
}
