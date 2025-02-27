import React from 'react';
import NetworkStatus from './NetworkStatus';
import ServiceStatus from './ServiceStatus';
import Demo from './Demo';
import './App.css';

export default function App() {
  return (
    <div>
      <NetworkStatus />
      <ServiceStatus />
      <Demo />
    </div>
  );
}
