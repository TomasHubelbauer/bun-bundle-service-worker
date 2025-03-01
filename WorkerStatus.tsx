import React, { useEffect, useState } from 'react';

export default function WorkerStatus() {
  const [status, setStatus] = useState<ServiceWorkerState | 'error'>();

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
      Worker{' '}
      <span className={status === 'activated' ? 'text-green-500' : 'text-red-500'}>
        {status}
        <span className={`w-2 h-2 inline-block rounded ml-1 ${status === 'activated' ? 'bg-green-500' : 'bg-red-500'}`} />
      </span>
    </div>
  );
}
