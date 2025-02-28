import React, { useEffect, useState } from 'react';
import Status from './Status';

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
    <div className='text-slate-500'>
      Network <Status status={status} />
    </div>
  );
}
