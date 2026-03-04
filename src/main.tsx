import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import SlabLoad from './SlabLoad';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <SlabLoad />
  </React.StrictMode>,
);