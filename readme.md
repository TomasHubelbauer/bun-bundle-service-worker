# Bun bundle service worker

Bun now has an HTML bundler and I wonder if it is possible and easy to set up a
bundle where there is an HTML entry point with its script bundle and another
bundle for a service worker giving the web app offline capabilities:

https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers

The service worker needs to live at a different route from the main bundle file
which might prove a challenge, we'll see.

But we should get free TypeScript even in the service worker file which is not
a common DX.

The challenge is figuring out how to make the worker bundle.
The worker file is referenced via a URL in the main bundle when calling the
`navigator.serviceWorker.register` method.

That's not a site Bun scans for bundling.

We can't link it as another `script` in the main HTML file, because it would
attempt to execute it.

`<script src="worker.ts" type="text/plain"></script>`

I thought we might get away with using a `script` tag after all, but setting its
`type` to `text/plain` or something like that, so that the browser does not
attempt to execute it, but Bun bundles all the `script` tags into one bundle.

Then I thought we might get away with using a `preload` `link` unless `link`
processing is limited to CSS in Bun:

https://bun.sh/docs/bundler/fullstack#how-this-works

`<link rel="preload" href="worker.ts" as="script" />`

Turns out the `preload` `link` was picked up by Bun, but the script did not
become a part of the bundle and the `link` was removed.

I also messed with `import worker from './worker.ts'` and
`import worker from './worker.ts' with { type: 'text' };` and exposing these
as a named `static` route, but this suffered with Bun attempting to execute
the script and Bun requiring the import to be `HTMLBundle | Response`
respectively, neither worked.

Next I tried adding another HTML entry point with a linked worker script so it
gets an addressable URL which I could then get by using `fetch` on the worker
HTML entry point and parsing out the `script` to get at its `src`.

This worked!
It is clunky, but it worked.

In the future I could try to improve it by using a `data:` URL for the worker
HTML file once Bun supports those:

https://github.com/oven-sh/bun/issues/6851

This will allowe me to avoid using `Bun.build` in the `fetch` handler and
bundling the service worker entry point dynamically which is great news for me:

https://bun.sh/docs/bundler

Next steps:

https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Tutorials/js13kGames/Offline_Service_workers
