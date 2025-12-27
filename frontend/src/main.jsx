import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'; // <--- THIS IS THE MISSING LINE
import App from './App.jsx';
import './index.css';

// This is where 'createRoot' is used
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);