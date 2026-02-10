import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Application failed to mount:", error);
    rootElement.innerHTML = '<div style="color: white; padding: 20px;">System Error: Failed to load Window Manager.</div>';
  }
} else {
  console.error("Could not find root element to mount to");
}