
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Make sure we're rendering into the root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found - check if index.html has a div with id='root'");
} else {
  createRoot(rootElement).render(<App />);
}
