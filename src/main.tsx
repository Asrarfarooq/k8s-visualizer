import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ClusterProvider } from './context/ClusterContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClusterProvider>
      <App />
    </ClusterProvider>
  </React.StrictMode>,
);
