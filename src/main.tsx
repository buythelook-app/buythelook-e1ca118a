import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Hide development environment messages
const hidePreviewMessages = () => {
  const hideElementsWithText = (text: string) => {
    const elements = Array.from(document.querySelectorAll('*')).filter(
      el => el.textContent?.includes(text) && el !== document.body && el !== document.documentElement
    );
    elements.forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.display = 'none';
      }
    });
  };

  // Hide elements containing preview messages
  hideElementsWithText('Starting live preview');
  hideElementsWithText('starting live preview');
  
  // Also hide any floating development divs
  const floatingDivs = Array.from(document.querySelectorAll('body > div:not(#root)'));
  floatingDivs.forEach(div => {
    if (div instanceof HTMLElement && div.textContent?.toLowerCase().includes('preview')) {
      div.style.display = 'none';
    }
  });
};

// Run immediately and set up observers
hidePreviewMessages();

// Set up mutation observer to catch dynamically added elements
const observer = new MutationObserver(() => {
  hidePreviewMessages();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Make sure we're rendering into the root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found - check if index.html has a div with id='root'");
} else {
  createRoot(rootElement).render(<App />);
}
