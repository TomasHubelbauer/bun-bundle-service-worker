self.addEventListener('install', (event) => {
  // Do not wait for tab close and reopen to use the updated service worker file
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Make the requests of the connected tabs take to this worker without reload
  event.waitUntil(clients.claim());
});

self.addEventListener('message', async (event) => {
  console.log(`Processing service worker message:`, event.data);
  switch (event.data.type) {
    case 'list-cache-urls': {
      await reportCacheKeys();
      break;
    }
    case 'delete-cache-url': {
      const cache = await caches.open('bun-bundle-service-worker');
      await cache.delete(event.data.url);
      await reportCacheKeys();
      break;
    }
    default: {
      throw new Error(`Unknown message type: ${event.data.type}`);
    }
  }
});

async function reportCacheKeys() {
  const cache = await caches.open('bun-bundle-service-worker');
  const urls = [...await cache.keys()].map(key => key.url);
  const clients = await self.clients.matchAll();
  for (const client of clients) {
    client.postMessage({ type: 'cache-urls', urls });
  }

  console.log('Reporting cache keys to all clients');
}

const JS_BUNDLE_REGEX = /^\/_bun\/client\/index-\w{16}.js$/;
async function evictPriorJsBundles(path: string) {
  const cache = await caches.open('bun-bundle-service-worker');
  const keys = await cache.keys();

  for (const key of keys) {
    const keyUrl = new URL(key.url);
    const keyPath = keyUrl.href.slice(keyUrl.origin.length);
    if (keyPath === path || !JS_BUNDLE_REGEX.test(keyPath)) {
      continue;
    }

    console.log(`Deleting prior JS bundle chunk ${keyPath}`);
    await cache.delete(key);
  }
}

const CSS_BUNDLE_REGEX = /^\/_bun\/asset\/\w{16}.css$/;
async function evictPriorCssBundles(path: string) {
  const cache = await caches.open('bun-bundle-service-worker');
  const keys = await cache.keys();

  for (const key of keys) {
    const keyUrl = new URL(key.url);
    const keyPath = keyUrl.href.slice(keyUrl.origin.length);
    if (keyPath === path || !CSS_BUNDLE_REGEX.test(keyPath)) {
      continue;
    }

    console.log(`Deleting prior CSS bundle chunk ${keyPath}`);
    await cache.delete(key);
  }
}

// View the `console.log` calls here in about:debugging#/runtime/this-firefox by
// going to the Inspect window of the service worker with the URL printed in the
// developer tools Console of the web application
self.addEventListener('fetch', async (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    console.log(`Skipping call to separate host ${url.host}`);
    return;
  }

  const path = url.href.slice(url.origin.length);

  // Do not cache the worker page or script themselves
  if (path === '/worker' || path.startsWith('/_bun/client/worker-')) {
    console.log(`Ignoring call to worker bundle ${path}`);
    return;
  }

  // Do not handle the SSE status API call in the service worker
  if (path === '/api/status') {
    return;
  }

  console.log(`Proxying call to ${path}`);

  // Note that `fetch` must call `respondWith` synchronously so all asynchronous work goes into the callback
  event.respondWith((async () => {
    // Clear out prior JS bundle chunks upon encountering the current one
    if (JS_BUNDLE_REGEX.test(path)) {
      await evictPriorJsBundles(path);
    }

    // Clear out prior CSS bundle chunks upon encountering the current one
    if (/^\/chunk-\w{8}\.css$/.test(path)) {
      await evictPriorCssBundles(path);
    }
  
    const cache = await caches.open('bun-bundle-service-worker');
    const paths = [...await cache.keys()]
      .map((key) => new URL(key.url).href.slice(url.origin.length))
      .sort()
      ;
  
    console.log('Holding cached paths', ...paths);

    // Reported updated cache keys following the possible purges
    await reportCacheKeys();
  
    const isApiRequest = path.startsWith('/api/');
    try {
      const response = await fetch(event.request);

      if (isApiRequest) {
        // TODO: Refresh the IndexedDB data in case of a mutation so it matches
        // the live data the moment the web application goes offline
        console.log(`Handling online API call to ${path}`);
      }
      else {
        console.log(`Fetching fresh response to ${path}`);
        console.log(`Caching fresh response to ${path}`);
        cache.put(event.request, response.clone());
      }
  
      console.log(`Returning fresh response to ${path}`);
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
        console.log(`Handling offline API call to ${path}`);

        return new Response('Hello, world!', {
          headers: {
            'x-service-worker': 'true'
          },
        });
      } 
  
      console.log(`Obtaining cached response to ${path}`);
      const response = await cache.match(event.request);
      if (!response) {
        console.log(`Failing cache lookup of ${path}`);
        return;
      }
  
      console.log(`Returning stale response to ${path}`);
      return response;
    }
  })());
});
