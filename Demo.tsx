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

export default function Demo() {
  const [items, setItems] = useState<Item[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  
  const trackCall = useCallback((response: Response) => {
    const stamp = new Date().toISOString().slice(0, 'yyyy-mm-dd-hh-mm-ss'.length).replace('T', ' ');
    const { url, ok, status, statusText } = response;
    const source = response.headers.get('x-service-worker') ? 'service-worker' as const : 'web-server' as const;
    setCalls(calls => [{ id: calls.length, stamp, source, url: new URL(url), ok, status, statusText }, ...calls]);
  }, []);

  const fetchItems = useCallback(async () => {
    const response = await fetch('/api/items');
    setItems(await response.json());
    trackCall(response);
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
    trackCall(response);
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
    trackCall(response);
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
    trackCall(response);
    await fetchItems();
  }, [items]);

  const handleClearDatabaseButtonClick = useCallback(async () => {
    if (!confirm('Are you sure you want to purge the database?')) {
      return;
    }

    const response = await fetch('/api/items', { method: 'DELETE' });
    trackCall(response);
    await fetchItems();
  }, []);

  const handleClearCacheButtonClick = useCallback(() => {
    setCalls([]);
  }, []);

  const idDigits = useMemo(() => ~~Math.log10(Math.max(...items.map(item => item.id))) + 1, [items]);

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
