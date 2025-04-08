import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Performance monitoring
if (import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true') {
  const performanceObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`[Performance] ${entry.name}: ${entry.duration}ms`);
    }
  });
  performanceObserver.observe({ entryTypes: ['measure', 'resource'] });
}

// Error tracking
if (import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true') {
  window.addEventListener('error', (event) => {
    console.error('[Error]', event.error);
    // Here you can add your error tracking service (e.g., Sentry, Firebase Crashlytics)
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
    // Here you can add your error tracking service
  });
}

// Render the app
const root = document.getElementById("root");
if (!root) {
  throw new Error('Root element not found');
}

createRoot(root).render(<App />);
