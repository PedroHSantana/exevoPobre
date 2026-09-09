export async function registerPushServiceWorker() {
  return navigator.serviceWorker.register('/firebase-messaging-sw.js');
}
