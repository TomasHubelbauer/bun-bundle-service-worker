import React, { useCallback, useEffect, useState, MouseEvent } from 'react';
import Title from './Title';
import Button from './Button';

export default function Cache() {
  const [urls, setUrls] = useState<URL[]>([]);

  useEffect(() => {
    const abortController = new AbortController();
    navigator.serviceWorker.addEventListener('message', (event) => {
      switch (event.data.type) {
        case 'cache-urls': {
          setUrls(event.data.urls.map(key => new URL(key)).sort());
          break;
        }
        default: {
          throw new Error(`Unknown message type: ${event.data.type}`);
        }
      }
    }, { signal: abortController.signal });

    void async function () {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.active) {
        throw new Error('Service worker not registered.');
      }

      registration.active.postMessage({ type: 'list-cache-urls' });
    }();

    return () => {
      abortController.abort();
    };
  }, []);

  const handlePurgeButtonClick = useCallback(async (event: MouseEvent<HTMLButtonElement>) => {
    const url = event.currentTarget.dataset.url;
    if (!url) {
      throw new Error('Path not found.');
    }

    if (!confirm(`Are you sure you want to purge ${url}?`)) {
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) {
      throw new Error('Service worker not registered.');
    }

    registration.active.postMessage({ type: 'delete-cache-url', url });
  }, []);

  return (
    <>
      <Title text='Cache' />
      {!urls.length && (
        <div className='text-slate-500'>No cached paths.</div>
      )}
      <div className='flex flex-col gap-1'>
        {urls.map((url) => (
          <div key={url.href} className='flex justify-between hover:bg-slate-100'>
            <code>{url.pathname}</code>
            <Button text='Purge' onClick={handlePurgeButtonClick} danger data-url={url} />
          </div>
        ))}
      </div>
    </>
  );
}
