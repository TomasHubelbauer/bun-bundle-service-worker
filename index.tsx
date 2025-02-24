if (!('serviceWorker' in navigator)) {
  throw new Error('Service workers are not supported by this browser');
}

const response = await fetch('/worker');
const text = await response.text();
const doc = new DOMParser().parseFromString(text, 'text/html');
const url = doc.scripts[0]?.src;
if (!url) {
  throw new Error('Worker script not found');
}

const registration = await navigator.serviceWorker.register(url);
console.log(`Service worker ${url} ${registration.active?.state ?? 'failed'}`);

if (!registration.active) {
  throw new Error('Service worker not activated');
}

const statusSpan = document.querySelector('#statusSpan');
if (!statusSpan) {
  throw new Error('Status span not found');
}

window.addEventListener('offline', () => statusSpan.textContent = 'offline');
window.addEventListener('online', () => statusSpan.textContent = 'online');
statusSpan.textContent = navigator.onLine ? 'online' : 'offline';

const demoButton = document.querySelector<HTMLButtonElement>('#demoButton');
if (!demoButton) {
  throw new Error('Demo button not found');
}

demoButton.disabled = false;
demoButton.addEventListener('click', async () => {
  const response = await fetch('/api/test');
  const text = await response.text();
  demoButton.textContent = text;
});
