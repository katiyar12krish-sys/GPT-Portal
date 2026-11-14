'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            // Service worker registered
            console.log('PWA ServiceWorker registered with scope: ', registration.scope);
          })
          .catch((err) => {
            // Registration failure is non-fatal (e.g. preview iframes or cross-origin)
            console.warn('PWA ServiceWorker registration skipped/failed:', err);
          });
      });
    }
  }, []);

  return null;
}
