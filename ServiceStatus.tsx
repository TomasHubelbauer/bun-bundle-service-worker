import React, { useEffect, useState } from 'react';
import Status from './Status';

export default function ServiceStatus() {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    const abortController = new AbortController();
    const eventSource = new EventSource('/api/status');
    eventSource.addEventListener('open', () => setStatus('online'), { signal: abortController.signal });
    eventSource.addEventListener('message', () => setStatus('online'), { signal: abortController.signal });
    eventSource.addEventListener('error', () => setStatus('offline'), { signal: abortController.signal });
    eventSource.addEventListener('close', () => setStatus('offline'), { signal: abortController.signal });

    // Note that this `close` prevents console errors when refreshing the tab
    // and is different from the one in the cleanup function of the effect.
    window.addEventListener('beforeunload', () => eventSource.close());

    return () => {
      eventSource.close();
      abortController.abort();
    }
  }, []);

  return (
    <div className='text-slate-500'>
      Service <Status status={status} />
    </div>
  );
}
