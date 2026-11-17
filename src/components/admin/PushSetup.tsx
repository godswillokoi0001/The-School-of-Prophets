"use client";

import { useEffect } from "react";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushSetup() {
  useEffect(() => {
    const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!pub || !("serviceWorker" in navigator) || !("PushManager" in window)) return;

    async function setup() {
      try {
        const reg = await navigator.serviceWorker.register("/admin/swjs", {
          scope: "/admin/",
        });
        const existing = await reg.pushManager.getSubscription();
        const sub =
          existing ??
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(pub!),
          }));
        await fetch("/api/admin/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sub.toJSON()),
        });
        if (
          typeof Notification !== "undefined" &&
          Notification.permission === "default"
        ) {
          Notification.requestPermission();
        }
      } catch {
        // push is optional; failures are silent
      }
    }
    setup();
  }, []);
  return null;
}
