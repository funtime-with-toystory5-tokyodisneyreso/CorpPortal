import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "@serwist/precaching";
import { installSerwist } from "@serwist/sw";

declare const self: WorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

(self as any).addEventListener('push', function (event: any) {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || '新しい通知';
    const options: NotificationOptions = {
      body: data.body || '新着メッセージがあります',
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
