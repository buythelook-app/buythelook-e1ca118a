
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Capacitor } from '@capacitor/core'

// Initialize app for native platforms
const initApp = () => {
  // Make sure we're rendering into the root element
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found - check if index.html has a div with id='root'");
  } else {
    createRoot(rootElement).render(<App />);
    console.log("App initialized successfully");
  }
}

// Check if running on a native platform
if (Capacitor.isNativePlatform()) {
  console.log("Running on native platform, initializing app...");
  
  // Add a small delay to ensure the WebView is fully loaded
  setTimeout(initApp, 100);
} else {
  // Web platform
  console.log("Running on web platform");
  initApp();
}
