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

const demoButton = document.querySelector('#demoButton');
if (!demoButton) {
  throw new Error('Demo button not found');
}

demoButton.addEventListener('click', async () => {
  const response = await fetch('/api/test');
  const text = await response.text();
  demoButton.textContent = text;
});
