"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
    useEffect(() => {
        // Register the service worker
        if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/service-worker.js')
                    .then((registration) => {
                        console.log('Service Worker registered:', registration);

                        // Check for updates every hour
                        setInterval(() => {
                            registration.update();
                        }, 60 * 60 * 1000);
                    })
                    .catch((error) => {
                        console.error('Service Worker registration failed:', error);
                    });
            });
        }
    }, []);

    return null; // This component doesn't render anything
}