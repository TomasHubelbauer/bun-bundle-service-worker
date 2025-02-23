self.addEventListener('install', () => {
  // Do not wait for tab close and reopen to use an updated service worker file
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Make the requests of the connected tabs take to this worker without reload
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', async (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(new Response(`Hello from the service worker! ${new Date().toISOString()}`));
  }
});
