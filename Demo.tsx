import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Title from './Title';
import Button from './Button';
import trimUrl from './trimUrl';

type Item = {
  id: number;
  name: string;
};

type Call = {
  id: number;
  stamp: string;
  source: 'service-worker' | 'web-server';
  url: URL;
} & Pick<Response, 'ok' | 'status' | 'statusText'>;

const methodColors = {
  POST: 'text-green-500',
  PUT: 'text-blue-500',
  DELETE: 'text-red-500',
};

export default function Demo() {
  const [items, setItems] = useState<Item[]>([]);
  const [queue, setQueue] = useState<{ index: number; method: string; url: URL; data: string; }[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  
  const trackCall = useCallback(async (response: Response) => {
    const stamp = new Date().toISOString().slice(0, 'yyyy-mm-dd-hh-mm-ss'.length).replace('T', ' ');
    const { url, ok, status, statusText } = response;
    const source = response.headers.get('x-service-worker') ? 'service-worker' as const : 'web-server' as const;
    setCalls(calls => [{ id: calls.length, stamp, source, url: new URL(url), ok, status, statusText }, ...calls]);
    await fetchQueue();
  }, []);

  const fetchQueue = useCallback(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) {
      throw new Error('Service worker not registered.');
    }

    registration.active.postMessage({ type: 'view-queue' });
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    navigator.serviceWorker.addEventListener('message', (event) => {
      switch (event.data.type) {
        case 'queue': {
          setQueue(event.data.queue.map(item => ({ ...item, url: new URL(item.url) })).reverse());
          break;
        }
      }
    }, { signal: abortController.signal });

    void async function () {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.active) {
        throw new Error('Service worker not registered.');
      }

      registration.active.postMessage({ type: 'view-queue' });
    }();

    return () => {
      abortController.abort();
    };
  }, []);

  const fetchItems = useCallback(async () => {
    const response = await fetch('/api/items');
    setItems(await response.json());
    await trackCall(response);
  }, [trackCall]);

  useEffect(() => {
    fetchItems()
  }, []);

  const handleAddButtonClick = useCallback(async () => {
    const name = prompt('New item name:');
    if (!name) {
      return;
    }

    const response = await fetch('/api/items', { method: 'POST', body: JSON.stringify({ name }) });
    await trackCall(response);
    await fetchItems();
  }, []);

  const handleRenameButtonClick = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    const id = Number(event.currentTarget.dataset.id);
    if (!id) {
      throw new Error('ID not found.');
    }

    const item = items.find(item => item.id === id);
    if (!item) {
      throw new Error('Item not found.');
    }

    const name = prompt('New item name:', item.name);
    if (!name) {
      return;
    }

    const response = await fetch(`/api/items/${id}`, { method: 'PUT', body: JSON.stringify({ name }) });
    await trackCall(response);
    await fetchItems();
  }, [items]);

  const handleDeleteButtonClick = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    const id = Number(event.currentTarget.dataset.id);
    if (!id) {
      throw new Error('ID not found.');
    }

    const item = items.find(item => item.id === id);
    if (!item) {
      throw new Error('Item not found.');
    }

    if (!confirm(`Are you sure you want to purge ${item.name}?`)) {
      return;
    }

    const response = await fetch(`/api/items/${id}`, { method: 'DELETE' });
    await trackCall(response);
    await fetchItems();
  }, [items]);

  const handleClearDatabaseButtonClick = useCallback(async () => {
    if (!confirm('Are you sure you want to purge the database?')) {
      return;
    }

    const response = await fetch('/api/items', { method: 'DELETE' });
    await trackCall(response);
    await fetchItems();
  }, []);

  const handleClearCacheButtonClick = useCallback(() => {
    setCalls([]);
  }, []);

  const idDigits = useMemo(() => ~~Math.log10(Math.max(...items.map(item => item.id))) + 1, [items]);
  const indexDigits = useMemo(() => ~~Math.log10(Math.max(...queue.map(item => item.index))) + 1, [queue]);

  return (
    <>
      <Title text='Data' />
      <div className='flex gap-1'>
        <Button text='Add' onClick={handleAddButtonClick} />
      </div>
      {items.length
        ? (
          <div>
            <div className='flex flex-col gap-1 mb-1'>
              {items.map(item => (
                <div key={item.id} className='flex gap-1 hover:bg-slate-100'>
                  <code className='text-slate-500'>
                    {item.id.toString().padStart(idDigits, '0')}
                  </code>
                  <span className='mr-auto'>
                    {item.name}
                  </span>
                  <Button text='Rename' onClick={handleRenameButtonClick} data-id={item.id} />
                  <Button text='Delete' onClick={handleDeleteButtonClick} danger data-id={item.id} />
                </div>
              ))}
            </div>
            <Button text='Clear' onClick={handleClearDatabaseButtonClick} danger />
          </div>
        )
        : (
          <div className='text-slate-500'>
            The database is empty.
          </div>
        )
      }
      <Title text='Queue' />
      {queue.length
        ? (
          <div className='flex flex-col gap-1'>
            {queue.map(item => (
              <div key={item.index} className='flex gap-1 hover:bg-slate-100'>
                <code className='text-slate-500'>
                  {item.index.toString().padStart(indexDigits, '0')}
                </code>
                <code className={methodColors[item.method]}>
                  {item.method}
                </code>
                <code>
                  {trimUrl(item.url)}
                </code>
                <code>
                  {item.data}
                </code>
              </div>
            ))}
          </div>
        )
        : (
          <div className='text-slate-500'>
            The queue of actions to synchronize with the database is empty.
          </div>
        )
      }
      <Title text='Calls' />
      {calls.length
        ? (
          <div>
            <div className='flex flex-col gap-1 mb-1'>
              {calls.map(call => (
                <div key={call.id} className='flex gap-1 hover:bg-slate-100'>
                  <time dateTime={call.stamp} className='text-slate-500 tabular-nums'>{call.stamp}:</time>
                  <code className={call.ok ? 'text-green-500' : 'text-red-500'}>
                    {call.status} {call.statusText}
                  </code>
                  <code>
                    {trimUrl(call.url)}
                  </code>
                  <span className='ml-auto text-slate-500'>({call.source})</span>
                </div>
              ))}
            </div>
            <Button text='Clear' onClick={handleClearCacheButtonClick} danger />
          </div>
        )
        : (
          <div className='text-slate-500'>
            Hit the button with the service online and offline to see the difference.
          </div>
        )
      }
    </>
  );
}
