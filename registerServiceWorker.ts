if (!('serviceWorker' in navigator)) {
  throw new Error('Service workers are not supported by this browser');
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
}
catch (error)
{
  if (error.message !== 'NetworkError when attempting to fetch resource.') {
    throw error;
  }
}
