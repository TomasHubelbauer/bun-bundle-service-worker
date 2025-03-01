if (!('serviceWorker' in navigator)) {
  throw new Error('Service workers are not supported by this browser');
}

const registration = await navigator.serviceWorker.register('/worker');
if (!registration.active) {
  throw new Error('Service worker not activated');
}

await navigator.serviceWorker.ready;
