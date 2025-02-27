import React, { useEffect, useState } from 'react';
import './ServiceStatus.css';

export default function ServiceStatus() {
  const [status, setStatus] = useState<'online' | 'offline'>('offline');

  useEffect(() => {
    // Poll the service worker entry point (uncached) to see if it is live or stale
    // TODO: Look into replacing this with SSE (will help with the SSH tunnel too)
    const interval = setInterval(
      async () => {
        try {
          const response = await fetch('/worker', { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`Service worker entry point ${response.status} ${response.statusText}`);
          }

          setStatus('online');
        }
        catch (error) {
          if (error.message !== 'NetworkError when attempting to fetch resource.') {
            throw error;
          }

          setStatus('offline');
        }
      },
      1000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="ServiceStatus">
      Service <span data-status={status}>{status}</span>
    </div>
  );
}
