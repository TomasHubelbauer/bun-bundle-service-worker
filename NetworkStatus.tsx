import React, { useEffect, useState } from 'react';

export default function NetworkStatus() {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    const abortController = new AbortController();
    window.addEventListener('offline', () => setStatus('offline'), { signal: abortController.signal });
    window.addEventListener('online', () => setStatus('online'), { signal: abortController.signal });
    setStatus(navigator.onLine ? 'online' : 'offline');
    return () => abortController.abort();
  }, []);

  return (
    <div id="NetworkStatus">
      Network <span className={status === 'online' ? 'text-green-500' : 'text-red-500'}>{status}</span>
    </div>
  );
}
