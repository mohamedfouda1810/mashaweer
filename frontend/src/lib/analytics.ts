/**
 * Google Analytics 4 - Custom Event Tracking Utility
 * 
 * Pushes events to the GTM dataLayer. All events are prefixed
 * for easy identification in GA4 and GTM.
 * 
 * Usage:
 *   import { trackEvent, trackTripBooked } from '@/lib/analytics';
 *   trackTripBooked('trip_123', 'Cairo', 'Alexandria', 2, 150);
 */

// Extend Window type to include dataLayer
declare global {
    interface Window {
        dataLayer: Record<string, any>[];
    }
}

/**
 * Push a custom event to the GTM dataLayer.
 * Safe to call in SSR — silently no-ops if `window` is not available.
 */
export function trackEvent(eventName: string, params: Record<string, any> = {}) {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: eventName,
        ...params,
    });
}

// ─── Pre-built Event Helpers ─────────────────────────────────────

/** Fired when a passenger successfully books a seat */
export function trackTripBooked(
    tripId: string,
    fromCity: string,
    toCity: string,
    seats: number,
    totalPrice: number,
) {
    trackEvent('trip_booked', {
        trip_id: tripId,
        route: `${fromCity} → ${toCity}`,
        seats,
        total_price: totalPrice,
        currency: 'EGP',
    });
}

/** Fired when a driver marks a trip as completed */
export function trackTripCompleted(
    tripId: string,
    fromCity: string,
    toCity: string,
) {
    trackEvent('trip_completed', {
        trip_id: tripId,
        route: `${fromCity} → ${toCity}`,
    });
}

/** Fired when a passenger rates a driver */
export function trackDriverRated(
    tripId: string,
    driverId: string,
    score: number,
) {
    trackEvent('driver_rated', {
        trip_id: tripId,
        driver_id: driverId,
        rating_score: score,
    });
}

/** Fired when a user registers */
export function trackUserRegistered(role: string) {
    trackEvent('user_registered', { user_role: role });
}

/** Fired when a user logs in */
export function trackUserLogin() {
    trackEvent('user_login', {});
}

/** Fired when a user deposits funds */
export function trackDeposit(amount: number, method: string) {
    trackEvent('wallet_deposit', {
        amount,
        payment_method: method,
        currency: 'EGP',
    });
}
