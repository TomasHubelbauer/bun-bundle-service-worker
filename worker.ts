self.addEventListener('install', (event) => {
  // Do not wait for tab close and reopen to use the updated service worker file
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Make the requests of the connected tabs take to this worker without reload
  event.waitUntil(clients.claim());
});

// View the `console.log` calls here in about:debugging#/runtime/this-firefox by
// going to the Inspect window of the service worker with the URL printed in the
// developer tools Console of the web application
self.addEventListener('fetch', async (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    console.log(`Ignoring request to different origin ${url.origin}`);
    return;
  }

  const path = url.href.slice(url.origin.length);
  console.log(`Proxying request to ${path}`);

  const cache = await caches.open('bun-bundle-service-worker');
  console.group('Cache opened, keys:');
  for (const key of await cache.keys()) {
    const url = new URL(key.url);
    console.log(url.href.slice(url.origin.length));
  }

  console.groupEnd();

  const isApiRequest = path.startsWith('/api/');

  // Note that this logic needs to be in an IIFE to avoid this error:
  // > InvalidStateError: "An attempt was made to use an object that is not, or is no longer, usable"
  // Be aware that this is probably spec-correct behavior but it is annoying
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);

      if (isApiRequest) {
        // TODO: Refresh the IndexedDB data in case of a mutation so it matches
        // the live data the moment the web application goes offline
        console.log(`Handling online request to ${path}`);
      }
      else {
        console.log(`Caching fresh response to ${path}`);
        cache.put(event.request, response.clone());
      }
  
      console.log(`Forwarding fresh response to ${path}`);
      return response;
    }
    catch (error) {
      if (error.message !== 'NetworkError when attempting to fetch resource.') {
        console.log(`Surfacing unexpected error for ${path}`);
        throw error;
      }

      // Handle API URLs differently - use IndexedDB to do offline CRUD operations
      if (isApiRequest) {
        // TODO: Use IndexedDB to serve reads and queue writes when offline
        console.log(`Handling offline request to ${path}`);

        // TODO: Figure out why this doesn't work in the browser
        return new Response(`Hello from the service worker! ${path}`);
      } 
  
      console.log(`Obtaining state response to ${path}`);
      const response = await cache.match(event.request);
      if (!response) {
        console.log(`Failing cache matching of ${path}`);
      }
  
      return response;
    }
  })());
});
