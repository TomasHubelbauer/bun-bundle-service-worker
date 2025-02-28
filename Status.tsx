import React from 'react';

export default function Status({ status }: { status: 'online' | 'offline' }) {
  return (
    <span className={status === 'online' ? 'text-green-500' : 'text-red-500'}>
      <span className={`w-2 h-2 inline-block rounded mx-1 ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
      {status}
    </span>
  );
}
