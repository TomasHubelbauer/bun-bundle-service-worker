import React, { useEffect, useState } from 'react';
import './NetworkStatus.css';

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
      Network <span data-status={status}>{status}</span>
    </div>
  );
}
