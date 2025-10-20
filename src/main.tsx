import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth/AuthProvider';
import { router } from './routes';
import './styles/global.css';

// Extend Window interface for development functions
declare global {
  interface Window {
    clearAppCache?: () => Promise<void>;
    getAppVersion?: () => string;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60_000
    }
  }
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/kupon/sw.js').catch((error) => {
      console.error('Service worker registration failed', error);
    });
  });

  // Add cache clearing function for development
  if (import.meta.env.DEV) {
    window.clearAppCache = async () => {
      try {
        // Clear all caches
        const cacheNames = await caches.keys();
        console.log('Found caches:', cacheNames);
        
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        
        // Unregister service worker
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map(registration => registration.unregister())
        );
        
        console.log('Cache cleared successfully');
        alert('Cache cleared! Please refresh the page.');
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    };
    
    // Add version info function
    window.getAppVersion = () => {
      console.log('App version: 0.0.3');
      return '0.0.3';
    };
    
    console.log('Cache functions available:');
    console.log('- window.clearAppCache() - Clear all caches');
    console.log('- window.getAppVersion() - Get current version');
  }
}
