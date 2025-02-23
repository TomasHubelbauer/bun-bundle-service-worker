if (!('serviceWorker' in navigator)) {
  throw new Error('Service workers are not supported by this browser');
}

const response = await fetch('/worker');
const text = await response.text();
const document = new DOMParser().parseFromString(text, 'text/html');
const url = document.scripts[0]?.src;
if (!url) {
  throw new Error('Worker script not found');
}

const registration = await navigator.serviceWorker.register(url);
