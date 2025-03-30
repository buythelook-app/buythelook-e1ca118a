import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import our capacitor-shim to set up global objects
import './capacitor-shim';

console.log('Main.tsx loaded at ' + new Date().toISOString());

// Initialize app for native platforms
const initApp = () => {
  console.log("Initializing app...");
  
  try {
    // Get the root element
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    
    // Create a new div to replace the loading screen
    const appContainer = document.createElement('div');
    appContainer.id = 'app-container';
    appContainer.style.minHeight = '100vh';
    appContainer.style.display = 'flex';
    appContainer.style.flexDirection = 'column';
    
    // Replace loading screen with our app container
    rootElement.innerHTML = '';
    rootElement.appendChild(appContainer);
    
    // Render app into our container
    console.log("Rendering React app...");
    createRoot(appContainer).render(<App />);
    
    // Mark app as initialized
    window.appInitialized = true;
    console.log("React app rendered successfully");
    
    // Hide splash screen if on native platform
    if (window.Capacitor?.isNativePlatform?.()) {
      setTimeout(() => {
        console.log("Hiding splash screen...");
        window.SplashScreen?.hide?.()
          .catch(e => console.error("Error hiding splash screen:", e));
      }, 500);
    }
  } catch (error: any) {
    console.error("Error initializing app:", error);
    
    // Show error in the loading screen
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.innerHTML += `
        <div style="color: red; margin-top: 20px; max-width: 80%;">
          Failed to initialize: ${error.message || 'Unknown error'}
        </div>
      `;
    }
  }
}

// Wait for DOM to be ready, then initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded, initializing app");
    // Small delay to ensure WebView is fully ready
    setTimeout(initApp, window.Capacitor?.isNativePlatform?.() ? 300 : 10);
  });
} else {
  console.log("Document already ready, initializing immediately");
  // Document already loaded, initialize with a small delay
  setTimeout(initApp, window.Capacitor?.isNativePlatform?.() ? 200 : 10);
}
