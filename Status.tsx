import React from 'react';

export default function Status({ status }: { status: 'online' | 'offline' }) {
  return (
    <span className={status === 'online' ? 'text-green-500' : 'text-red-500'}>
      {status}
      <span className={`w-2 h-2 inline-block rounded ml-1 ${status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
    </span>
  );
}
