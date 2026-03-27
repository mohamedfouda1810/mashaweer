/**
 * Web Push Notifications — Frontend Subscription Utility
 *
 * Handles:
 * 1. Registering the service worker
 * 2. Requesting notification permission
 * 3. Creating a PushSubscription via the Push API
 * 4. Sending subscription keys to the backend
 *
 * Requires NEXT_PUBLIC_VAPID_PUBLIC_KEY environment variable.
 */

import { api } from '@/lib/api';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

/**
 * Convert a base64 URL-safe string to a Uint8Array (for applicationServerKey).
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

/**
 * Check if push notifications are supported and permission is granted.
 */
export function isPushSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

/**
 * Get the current notification permission status.
 */
export function getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!isPushSupported()) return 'unsupported';
    return Notification.permission;
}

/**
 * Register the service worker and subscribe to push notifications.
 * Returns true if subscription was successful.
 */
export async function subscribeToPush(): Promise<boolean> {
    if (!isPushSupported() || !VAPID_PUBLIC_KEY) {
        console.warn('Push notifications not available (missing VAPID key or unsupported browser)');
        return false;
    }

    try {
        // 1. Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
            return false;
        }

        // 2. Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // 3. Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            // 4. Create new subscription
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
            });
        }

        // 5. Extract keys and send to backend
        const key = subscription.getKey('p256dh');
        const auth = subscription.getKey('auth');

        if (!key || !auth) {
            console.error('Failed to get push subscription keys');
            return false;
        }

        const p256dh = btoa(String.fromCharCode(...new Uint8Array(key)));
        const authKey = btoa(String.fromCharCode(...new Uint8Array(auth)));

        await api.subscribePush({
            endpoint: subscription.endpoint,
            p256dh,
            auth: authKey,
        });

        console.log('Push subscription registered successfully');
        return true;
    } catch (error) {
        console.error('Failed to subscribe to push:', error);
        return false;
    }
}

/**
 * Unsubscribe from push notifications.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
    if (!isPushSupported()) return false;

    try {
        const registration = await navigator.serviceWorker.getRegistration('/sw.js');
        if (!registration) return false;

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return false;

        // Notify backend
        await api.unsubscribePush(subscription.endpoint);

        // Unsubscribe locally
        await subscription.unsubscribe();

        console.log('Push subscription removed');
        return true;
    } catch (error) {
        console.error('Failed to unsubscribe from push:', error);
        return false;
    }
}
