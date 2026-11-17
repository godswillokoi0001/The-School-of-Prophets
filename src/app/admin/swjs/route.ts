const SW = `const CACHE = "tsop-admin-v1";
const SHELL = ["/admin", "/admin/inbox", "/admin/calendar"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL).catch(() => undefined)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.pathname.startsWith("/api/")) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(() => undefined);
        return res;
      })
      .catch(() =>
        caches.match(event.request).then((hit) => hit ?? caches.match("/admin")),
      ),
  );
});

self.addEventListener("push", (event) => {
  let data = { title: "The School of Prophets", body: "New activity in the dashboard", url: "/admin" };
  try {
    data = event.data ? event.data.json() : data;
  } catch (e) {
    // keep defaults
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/images/tsop-crest.webp",
      badge: "/images/tsop-crest.webp",
      data: { url: data.url ?? "/admin" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow(event.notification.data?.url ?? "/admin");
    }),
  );
});
`;

export async function GET() {
  return new Response(SW, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-cache",
      "Service-Worker-Allowed": "/admin",
    },
  });
}
