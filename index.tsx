if (!('serviceWorker' in navigator)) {
  throw new Error('Service workers are not supported by this browser');
}

const networkStatusSpan = document.querySelector('#networkStatusSpan');
if (!networkStatusSpan) {
  throw new Error('#networkStatusSpan not found');
}

window.addEventListener('offline', () => networkStatusSpan.textContent = 'offline');
window.addEventListener('online', () => networkStatusSpan.textContent = 'online');
networkStatusSpan.textContent = navigator.onLine ? 'online' : 'offline';

const serviceStatusSpan = document.querySelector('#serviceStatusSpan');
if (!serviceStatusSpan) {
  throw new Error('#serviceStatusSpan not found');
}

try {
  const response = await fetch('/worker');
  if (!response.ok) {
    throw new Error(`Service worker entry point ${response.status} ${response.statusText}`);
  }

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

  serviceStatusSpan.textContent = 'online';
}
catch (error)
{
  if (error.message !== 'NetworkError when attempting to fetch resource.') {
    throw error;
  }

  serviceStatusSpan.textContent = 'offline';
}

// Poll the service worker entry point (uncached) to see if it is live or stale
// TODO: Look into replacing this with SSE (will help with the SSH tunnel too)
setInterval(
  async () => {
    try {
      const response = await fetch('/worker', { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Service worker entry point ${response.status} ${response.statusText}`);
      }

      serviceStatusSpan.textContent = 'online';
    }
    catch (error) {
      if (error.message !== 'NetworkError when attempting to fetch resource.') {
        throw error;
      }

      serviceStatusSpan.textContent = 'offline';
    }
  },
  1000
);

const demoButton = document.querySelector<HTMLButtonElement>('#demoButton');
if (!demoButton) {
  throw new Error('#demoButton not found');
}

const demoUl = document.querySelector<HTMLUListElement>('#demoUl');
if (!demoUl) {
  throw new Error('#demoUl not found');
}

demoButton.disabled = false;
demoButton.addEventListener('click', async () => {
  const li = document.createElement('li');
  const stamp = new Date().toISOString().slice(0, 'yyyy-mm-dd-hh-mm-ss'.length).replace('T', ' ');
  try {
    const response = await fetch('/api/test');
    const text = await response.text();
    const source = response.headers.get('x-service-worker') ? 'service worker' : 'web server';
    li.textContent = `${stamp}: ${text} (${source})`;
  }
  catch (error) {
    li.textContent = `${stamp}: ${error}`;
  }

  demoUl.prepend(li);
});
