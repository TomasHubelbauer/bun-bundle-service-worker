# Bun bundle service worker

Run using `bun --hot index.ts`.

- `--hot` takes care of the BE hot reloading (changes to `index.ts` and imports)
- Bun's HMR takes care of the FE hot reloading (changes to React components)

## Backstory

As of 2.1, Bun now has a bundler built-in:
https://bun.sh/blog/bun-v1.2#bun-is-a-javascript-bundler

I wondered if it was possible to (ab)use it for service workers.

Introduction to service workers:
https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

Service workers have their own entry point which is historically a challenge for
bundlers and as a result teams would leave the service worker script with worse
DX than the rest of the code base.

With Bun's bundler the promise was that we could use it to bundle the worker
script to its own bundle with all of the processing them main bundle gets.

The challenge was figuring out how to make the worker bundle be distinct from
the main one so we could pass its URL as an entry point to the `register` method
on `navigator.serviceWorker`.

What I tried:

- Linking it as another `script` element in the entry point HTML file, which
  resulted in it becoming a part of the main bundle
- Changing the `script`'s `type` to `text/plain` to see if Bun transpiles it but
  doesn't include it in the main bundle, which it still did
- Using a `preload` `link` thinking it might transpile but not bundle, but Bun
  removed the `link` without including the script in the main bundle or anywhere
- Importing the worker script in `index.ts` but resulted in the script executing
- Importing `worker.ts` with `{ type: 'text' }` but that did not transpile it
- Exposing the `worker.html` import via `routes` but `HTMLBundle` is not a valid
  substitute for the `Response` object so this resulted in an error

As of Bun 1.2 I settled on having `worker.html` link `worker.ts` and dynamically
loading `worker.html` and parsing out the `worker.ts` bundle URL to use in the
`register` method and this worked.

As if Bun 1.2.3, hot module reloading was introduced (seemingly with no toggle)
and this started adding React and Bun scaffolding to the worker script, breaking
it, so I had to pivot to using `Bun.build` explicitly and exposing in `routes`,
which also works.

## Debugging service workers in Firefox

Viewing the `console.log` calls and attaching a debugger to the service worker
script can be done like so:

1. Go to `about:debugging#/runtime/this-firefox`
2. Find the service worker for the web app by looking for
   `http://localhost:3000//_bun/client/index-${hash}.js`
3. Click Inspect next to that entry and use the Console and Debuger tabs
4. Keep repeating this whenever the worker script (and thus hash) changes as the
   Inspect tab will keep disconnecting

## `Cache` management

I had to add logic to the service worker to evict old JS and CSS bundles because
the bundle name includes its hash and it was filling up the `Cache`.

## `postMessage` demonstration

This repository includes a demonstration of two-way communication between the
service worker and the tab being controlled by it.

## Offline testing

Kill the Bun script, do not use the Offline Network throttle in Firefox, the
service worker will not be hit when in the Firefox offline mode.

Also note that toggling Offline in the Network tab of the developer tools won't
raise the `offline` / `online` events of `document`.

## Offline HMR web socket

The bundle packs in a web socket establishement code for HMR support as of Bun
1.2.3 and when the bundle is running off the service worker cache and the server
is not running, the WS won't be able to connect, but it will keep retrying,
spamming the console.

I filed as issue for this:
https://github.com/oven-sh/bun/issues/17839

We can't solve this by responding to the `_bun/hmr` call in the service worker,
because we do not have a way to respond that wouldn't cause the web socket
establishment attempt to crash and retry.
We'd have to run a no-op web socket server in the service worker to achieve
silencing the errors.
