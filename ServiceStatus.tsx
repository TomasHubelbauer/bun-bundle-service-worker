import React, { useEffect, useState } from 'react';

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
    <div id="ServiceStatus">
      Service <span className={status === 'online' ? 'text-green-500' : 'text-red-500'}>{status}</span>
    </div>
  );
}
