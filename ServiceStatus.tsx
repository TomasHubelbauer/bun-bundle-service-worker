import React, { useEffect, useState } from 'react';
import './ServiceStatus.css';

export default function ServiceStatus() {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    const abortController = new AbortController();
    const eventSource = new EventSource('/status');

    eventSource.addEventListener('open', () => setStatus('online'), { signal: abortController.signal });
    eventSource.addEventListener('message', () => setStatus('online'), { signal: abortController.signal });
    eventSource.addEventListener('error', () => setStatus('offline'), { signal: abortController.signal });
    eventSource.addEventListener('close', () => setStatus('offline'), { signal: abortController.signal });

    return () => {
      eventSource.close();
      abortController.abort();
    }
  }, []);

  return (
    <div id="ServiceStatus">
      Service <span data-status={status}>{status}</span>
    </div>
  );
}
