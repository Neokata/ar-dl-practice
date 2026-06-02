'use client';

import { useEffect, useState } from 'react';

export default function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Register service worker
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      setRegistration(reg);

      // Check for updates on load
      reg.update();

      // Listen for new service workers
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available!
              setUpdateAvailable(true);
            }
          });
        }
      });

      // Also check if there's already a waiting worker
      if (reg.waiting) {
        setUpdateAvailable(true);
      }
    }).catch((err) => {
      console.log('SW registration failed:', err);
    });

    // Listen for controller change (when new SW takes over)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      // Tell the waiting service worker to activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    } else {
      // Fallback: just reload
      window.location.reload();
    }
  };

  if (!updateAvailable) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
      style={{
        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
        boxShadow: '0 -4px 20px rgba(139,92,246,0.4)',
      }}
    >
      <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔄</span>
          <div>
            <div className="font-bold text-white text-sm">Update Available!</div>
            <div className="text-white/80 text-xs">A new version of AR DL Practice is ready.</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUpdateAvailable(false)}
            className="text-white/70 text-xs px-3 py-1.5 rounded-lg hover:text-white"
          >
            Later
          </button>
          <button
            onClick={handleUpdate}
            className="bg-white/20 text-white font-bold text-sm px-4 py-1.5 rounded-lg hover:bg-white/30 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}