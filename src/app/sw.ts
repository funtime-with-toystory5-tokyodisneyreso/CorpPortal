import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";
import { StaleWhileRevalidate, CacheFirst, ExpirationPlugin, type RuntimeCaching } from "serwist";

declare const self: WorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

// Next.js App Router specific caching for maximum snappiness
const customCache: RuntimeCaching[] = [
  {
    matcher: ({ request, url }) => {
      // Cache React Server Components (RSC) payloads and document navigations
      return (
        request.mode === 'navigate' ||
        url.searchParams.has('_rsc') ||
        request.headers.get('RSC') === '1'
      );
    },
    handler: new StaleWhileRevalidate({
      cacheName: 'app-pages-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    }),
  },
  {
    matcher: ({ request }) => request.destination === 'image',
    handler: new CacheFirst({
      cacheName: 'app-images-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    }),
  },
  ...defaultCache,
];

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: customCache,
});

(self as any).addEventListener('push', function (event: any) {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || '新しい通知';
    const options: any = {
      body: data.body || '新着メッセージがあります',
      icon: '/icon-192x192.jpg',
      badge: '/icon-192x192.jpg',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    };
    event.waitUntil((self as any).registration.showNotification(title, options));
  }
});

(self as any).addEventListener('notificationclick', function (event: any) {
  event.notification.close();
  const url = event.notification.data.url;
  
  if (url) {
    event.waitUntil(
      (self as any).clients.matchAll({ type: 'window' }).then((windowClients: any[]) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          // If so, just focus it.
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, then open the target URL in a new window/tab.
        if ((self as any).clients.openWindow) {
          return (self as any).clients.openWindow(url);
        }
      })
    );
  }
});
