import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // The App component is now the main entry point
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();