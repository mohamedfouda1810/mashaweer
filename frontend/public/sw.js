// ============================================================================
// Mashaweer - Service Worker for Web Push Notifications
// ============================================================================

// Listen for push events from the server
self.addEventListener('push', function (event) {
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch (e) {
        payload = {
            title: 'Mashaweer',
            body: event.data.text(),
            data: { url: '/' },
        };
    }

    const options = {
        body: payload.body || '',
        icon: payload.icon || '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            url: payload.data?.url || '/',
            dateOfArrival: Date.now(),
        },
        actions: [
            { action: 'open', title: 'Open' },
            { action: 'close', title: 'Dismiss' },
        ],
    };

    event.waitUntil(
        self.registration.showNotification(payload.title || 'Mashaweer', options)
    );
});

// Handle notification click — deep-link to the relevant page
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.action === 'close') return;

    const urlToOpen = event.notification.data?.url || '/';

    // Focus an existing Mashaweer tab or open a new one
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // Try to find an existing tab for this origin
            for (const client of clientList) {
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.navigate(urlToOpen);
                    return;
                }
            }
            // No existing tab — open a new one
            return clients.openWindow(urlToOpen);
        })
    );
});

// Activate immediately (skip waiting)
self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});
