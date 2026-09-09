import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

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

// Firebase's own onMessage() only fires when the tab is focused — an open
// but unfocused tab gets nothing from it (Firebase silently hands off to
// the service worker instead, which can show a plain OS toast but can't
// play audio). Our service worker (see public/firebase-messaging-sw.js)
// postMessages every open tab on every push, focused or not, so this is
// the one listener that reliably covers all "tab is open somewhere" cases.
export function listenForServiceWorkerPushMessages(onPayload) {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type !== 'PUSH_RECEIVED') return;
    onPayload?.({ title: event.data.title, body: event.data.body, link: event.data.link });
  });
}
