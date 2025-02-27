import React from 'react';
import NetworkStatus from './NetworkStatus';
import ServiceStatus from './ServiceStatus';
import Demo from './Demo';
import Cache from './Cache';
import './App.css';

export default function App() {
  return (
    <div className='my-2 w-[80ch] mx-auto flex flex-col gap-[1ch]'>
      <div className='flex items-center gap-[1ch]'>
        <span className='text-xl'>👷</span>
        <span className='font-bold'>{document.title}</span>
      </div>
      <div className='flex gap-[1ch] text-slate-500'>
        <NetworkStatus />
        ·
        <ServiceStatus />
      </div>
      <Demo />
      <Cache />
    </div>
  );
}
