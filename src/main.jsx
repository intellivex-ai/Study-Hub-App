import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

window.addEventListener('error', (event) => {
  fetch('http://localhost:9999/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'error', message: event.error ? event.error.stack : event.message })
  }).catch(() => { });
});
window.addEventListener('unhandledrejection', (event) => {
  fetch('http://localhost:9999/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'unhandledrejection', message: event.reason ? event.reason.stack : event.reason })
  }).catch(() => { });
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
