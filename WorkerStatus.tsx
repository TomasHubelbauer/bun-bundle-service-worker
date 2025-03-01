import React, { useEffect, useState } from 'react';
import Status from './Status';

export default function WorkerStatus() {
  const [status, setStatus] = useState<ServiceWorkerState | 'error'>('error');

  useEffect(() => {
    const abortController = new AbortController();
    
    void async function () {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration || !registration.active) {
        throw new Error('Service worker not registered.');
      }

      const active = registration.active;
      active.addEventListener('statechange', () => setStatus(active.state), { signal: abortController.signal });
      active.addEventListener('error', () => setStatus('error'), { signal: abortController.signal });
      setStatus(active.state);
    }();
  
    return () => abortController.abort();
  }, []);

  return (
    <div className='text-slate-500'>
      Worker <Status text={status} colorName={status === 'activated' ? 'green' : 'red'} />
    </div>
  );
}
