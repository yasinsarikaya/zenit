// In-App / lokale Benachrichtigungen (Stufe 1).
// Funktioniert, solange Zenit installiert bzw. im Browser geöffnet ist.
// Echte Push-Nachrichten bei komplett geschlossener App = Stufe 2 (siehe README).

export function notifStatus() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission; // "default" | "granted" | "denied"
}

export async function ensurePermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export async function notify(title, body) {
  try {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg && reg.showNotification) {
      reg.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
      });
    } else {
      new Notification(title, { body });
    }
  } catch (e) {
    console.error("notify failed", e);
  }
}
