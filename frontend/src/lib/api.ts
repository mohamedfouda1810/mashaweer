import { TripFilters, ApiResponse, Trip, Booking, Wallet, Notification, Rating, User } from '@/types';

// ─── Production-safe API base URL ──────────────────────────────────
// NEVER fall back to localhost in production builds.
const API_BASE = (() => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  // Only allow localhost fallback in development
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3001/api';
  // In production without env var, use empty string — requests will fail visibly
  // rather than silently hitting localhost
  console.error('[Mashaweer] NEXT_PUBLIC_API_URL is not set. API requests will fail.');
  return '';
})();

/** Default request timeout in milliseconds (30 seconds — generous for cold starts + slow mobile) */
const DEFAULT_TIMEOUT_MS = 15_000;

// ─── Error Types ───────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out. Please try again.') {
    super(message);
    this.name = 'TimeoutError';
  }
}

// ─── Helpers ───────────────────────────────────────────────────────

/**
 * Resolve an image path from the backend to a full URL.
 * Automatically applies Cloudinary performance optimizations (f_auto, q_auto, responsive resizing)
 * unless raw is requested or non-Cloudinary URL.
 */
export function getImageUrl(
  path?: string | null,
  options?: { width?: number; quality?: string | number; raw?: boolean },
): string | undefined {
  if (!path) return undefined;

  let fullUrl = path;
  // Already absolute or backend relative
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    const origin = API_BASE.replace(/\/api\/?$/, '');
    fullUrl = `${origin}${fullUrl.startsWith('/') ? '' : '/'}${fullUrl}`;
  }

  // If raw is explicitly requested (e.g. for original full-resolution download), return as-is
  if (options?.raw) {
    return fullUrl;
  }

  // Optimize Cloudinary URLs with auto-format (WebP/AVIF), auto-quality compression, and optional max width
  if (fullUrl.includes('cloudinary.com') && fullUrl.includes('/image/upload/')) {
    if (!fullUrl.includes('/f_auto') && !fullUrl.includes('/w_')) {
      const transforms = [
        'f_auto',
        'q_auto:eco',
        options?.width ? `w_${options.width},c_limit` : '',
      ].filter(Boolean).join(',');

      return fullUrl.replace('/image/upload/', `/image/upload/${transforms}/`);
    }
  }

  return fullUrl;
}

/**
 * Trigger download of any image URL (including cross-origin Cloudinary images).
 * Uses fetch blob when possible, with automatic fallback to Cloudinary fl_attachment header.
 */
export async function downloadImage(url: string, filename?: string): Promise<boolean> {
  if (!url) return false;
  try {
    const rawUrl = getImageUrl(url, { raw: true }) || url;

    // 1. Try client-side fetch + blob download (works for CORS-enabled resources)
    try {
      const res = await fetch(rawUrl, { mode: 'cors' });
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || 'driver-document.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
        return true;
      }
    } catch {
      // Fall through to attachment header / link fallback
    }

    // 2. If Cloudinary, insert fl_attachment transformation to force browser download via Content-Disposition header
    let downloadUrl = rawUrl;
    if (downloadUrl.includes('cloudinary.com') && downloadUrl.includes('/image/upload/')) {
      const cleanName = (filename || 'driver-document')
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      downloadUrl = downloadUrl.replace(
        '/image/upload/',
        `/image/upload/fl_attachment:${cleanName}/`,
      );
    }

    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || 'driver-document.jpg';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (err) {
    console.error('Failed to download image:', err);
    window.open(url, '_blank');
    return false;
  }
}

/** Check if an error is an abort/cancellation — these should be silently ignored */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

// ─── API Client ────────────────────────────────────────────────────

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  /**
   * Core request method with:
   * - Timeout protection via AbortController
   * - External signal support for request cancellation
   * - Network error detection
   * - JSON parse protection
   * - Comprehensive HTTP status handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit & { signal?: AbortSignal; timeoutMs?: number } = {},
  ): Promise<ApiResponse<T>> {
    const { timeoutMs = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;

    // Fail clearly if API URL is not configured
    if (!API_BASE) {
      throw new ApiError(
        'API is not configured. Contact support.',
        0,
        'CONFIG_ERROR',
      );
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...fetchOptions.headers,
    };

    // Create timeout AbortController
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeoutMs);

    // Combine external signal (if any) with timeout signal
    let combinedSignal: AbortSignal;
    if (fetchOptions.signal) {
      // If an external signal is already provided, we need to abort on either
      const combinedController = new AbortController();
      const onExternalAbort = () => combinedController.abort();
      const onTimeoutAbort = () => combinedController.abort();
      fetchOptions.signal.addEventListener('abort', onExternalAbort, { once: true });
      timeoutController.signal.addEventListener('abort', onTimeoutAbort, { once: true });
      combinedSignal = combinedController.signal;
    } else {
      combinedSignal = timeoutController.signal;
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: combinedSignal,
      });
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      // Request was intentionally cancelled — let caller handle silently
      if (isAbortError(error)) {
        // Determine if it was a timeout or external cancellation
        if (timeoutController.signal.aborted && !fetchOptions.signal?.aborted) {
          throw new TimeoutError();
        }
        throw error; // Re-throw DOMException for external abort
      }

      // Network failure (offline, DNS failure, CORS block, etc.)
      throw new NetworkError();
    } finally {
      clearTimeout(timeoutId);
    }

    // ── Handle HTTP errors ──────────────────────────────────────────
    if (!response.ok) {
      let errorBody: Record<string, unknown> = {};
      try {
        errorBody = await response.json();
      } catch {
        // Response body wasn't JSON — that's fine, use defaults
      }

      let msg = (errorBody.message || errorBody.error || '') as string;
      if (Array.isArray(msg)) msg = msg.join(', ');

      switch (response.status) {
        case 400:
          throw new ApiError(msg || 'Invalid request. Please check your input.', 400, 'BAD_REQUEST');
        case 401:
          throw new ApiError(msg || 'Session expired. Please log in again.', 401, 'UNAUTHORIZED');
        case 403:
          throw new ApiError(msg || 'You do not have permission for this action.', 403, 'FORBIDDEN');
        case 404:
          throw new ApiError(msg || 'The requested resource was not found.', 404, 'NOT_FOUND');
        case 408:
          throw new TimeoutError(msg || 'Request timed out. Please try again.');
        case 409:
          throw new ApiError(msg || 'This action conflicts with existing data.', 409, 'CONFLICT');
        case 422:
          throw new ApiError(msg || 'Invalid data submitted.', 422, 'VALIDATION_ERROR');
        case 429:
          throw new ApiError(msg || 'Too many requests. Please wait a moment.', 429, 'RATE_LIMITED');
        case 500:
          throw new ApiError(msg || 'Server error. Please try again later.', 500, 'SERVER_ERROR');
        case 502:
          throw new ApiError(msg || 'Server is temporarily unavailable. Please try again.', 502, 'BAD_GATEWAY');
        case 503:
          throw new ApiError(msg || 'Service unavailable. Please try again later.', 503, 'SERVICE_UNAVAILABLE');
        default:
          throw new ApiError(msg || `Request failed (${response.status})`, response.status, 'UNKNOWN');
      }
    }

    // ── Parse response JSON safely ──────────────────────────────────
    try {
      return await response.json();
    } catch {
      throw new ApiError('Invalid response from server.', response.status, 'PARSE_ERROR');
    }
  }

  // ─── Auth ────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: any) {
    return this.request<{ message: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string) {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  //  ─── Trips ──────────────────────────────────────────────────────

  async getTrips(filters?: TripFilters, signal?: AbortSignal) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return this.request<Trip[]>(`/trips?${params.toString()}`, { signal });
  }

  async getTrip(id: string) {
    return this.request<Trip>(`/trips/${id}`);
  }

  async createTrip(data: {
    fromCity: string;
    toCity: string;
    gatheringLocation: string;
    toAddress?: string;
    departureTime: string;
    price: number;
    pricePerSeat?: number;
    totalSeats: number;
    notes?: string;
    gatheringLatitude?: number;
    gatheringLongitude?: number;
    destinationLatitude?: number;
    destinationLongitude?: number;
  }) {
    return this.request<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get authoritative pricing from backend — SINGLE SOURCE OF TRUTH
   * Frontend MUST NOT recalculate pricing locally.
   */
  async calculatePricing(distanceKm: number, seats: number = 4) {
    return this.request<{
      distanceKm: number;
      suggestedTripPrice: number;
      seats: number;
      suggestedPricePerSeat: number;
      minPricePerSeat: number;
      maxPricePerSeat: number;
      clampedMin: number;
      clampedMax: number;
    }>('/trips/calculate-pricing', {
      method: 'POST',
      body: JSON.stringify({ distanceKm, seats }),
    });
  }

  async startTrip(tripId: string) {
    return this.request(`/trips/${tripId}/start`, {
      method: 'PATCH',
    });
  }

  async completeTrip(tripId: string) {
    return this.request(`/trips/${tripId}/complete`, {
      method: 'PATCH',
    });
  }

  async uploadFile(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const timeoutController = new AbortController();
    // Uploads get a longer timeout (60s)
    const timeoutId = setTimeout(() => timeoutController.abort(), 60_000);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers,
        body: formData,
        signal: timeoutController.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || 'Upload failed');
      }

      return response.json();
    } catch (error) {
      if (isAbortError(error)) throw new TimeoutError('Upload timed out. Please try again.');
      if (error instanceof Error && error.message === 'Upload failed') throw error;
      throw new NetworkError('Upload failed. Please check your connection.');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ─── Bookings ────────────────────────────────────────────────────

  async bookSeat(tripId: string, seats = 1, paymentMethod: 'WALLET' | 'CASH' = 'CASH') {
    return this.request<Booking>(`/bookings/trips/${tripId}`, {
      method: 'POST',
      body: JSON.stringify({ seats, paymentMethod }),
    });
  }

  async cancelBooking(bookingId: string) {
    return this.request<{ cancelled: boolean; refundAmount: number }>(
      `/bookings/${bookingId}`,
      { method: 'DELETE' },
    );
  }

  async getTripBookings(tripId: string) {
    return this.request<Booking[]>(`/bookings/trip/${tripId}`);
  }

  async getMyBookings() {
    return this.request<Booking[]>('/bookings/my-bookings');
  }

  // ─── Wallet ──────────────────────────────────────────────────────

  async getWallet() {
    return this.request<Wallet>('/wallet');
  }

  async getBalance() {
    return this.request<{ balance: number }>('/wallet/balance');
  }

  async requestDeposit(data: {
    amount: number;
    paymentMethod: string;
    receiptUrl: string;
  }) {
    return this.request('/wallet/deposit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactions() {
    return this.request('/wallet/transactions');
  }

  async getPaymentInfo() {
    return this.request<{ instapayNumber: string; vodafoneCashNumber: string }>('/wallet/payment-info');
  }

  // ─── Driver ──────────────────────────────────────────────────────

  async confirmReady(tripId: string) {
    return this.request(`/driver/trips/${tripId}/confirm-ready`, {
      method: 'POST',
    });
  }

  async getDriverDashboard() {
    return this.request('/driver/dashboard');
  }

  async editTrip(tripId: string, data: any) {
    return this.request(`/trips/${tripId}/edit`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async cancelTrip(tripId: string, reason?: string) {
    return this.request(`/trips/${tripId}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason: reason || '' }),
    });
  }

  // ─── Ratings ─────────────────────────────────────────────────────

  async submitRating(data: {
    ratedId: string;
    tripId: string;
    score: number;
    review?: string;
  }) {
    return this.request<Rating>('/ratings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserRating(userId: string) {
    return this.request(`/ratings/user/${userId}`);
  }

  async getTripRatings(tripId: string) {
    return this.request(`/ratings/trip/${tripId}`);
  }

  async getDriverRatings(driverId: string) {
    return this.request<{ averageScore: number; totalRatings: number; recentReviews: any[] }>(`/ratings/user/${driverId}`);
  }

  // ─── Notifications ──────────────────────────────────────────────

  async getNotifications(page = 1) {
    return this.request<Notification[]>(`/notifications?page=${page}`);
  }

  async getUnreadCount() {
    return this.request<{ count: number }>('/notifications/unread-count');
  }

  async markAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  async markAllAsRead() {
    return this.request(`/notifications/read-all`, { method: 'PATCH' });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, { method: 'DELETE' });
  }

  // ─── Admin ───────────────────────────────────────────────────────

  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminAlerts(resolved = false) {
    return this.request(`/admin/alerts?resolved=${resolved}`);
  }

  async getUsers(role?: string) {
    const query = role ? `?role=${role}` : '';
    return this.request(`/admin/users${query}`);
  }

  async banUser(userId: string, reason?: string) {
    return this.request(`/admin/users/${userId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async unbanUser(userId: string) {
    return this.request(`/admin/users/${userId}/unban`, {
      method: 'POST',
    });
  }

  async tempBanUser(userId: string, days: number, reason?: string) {
    return this.request(`/admin/users/${userId}/temp-ban`, {
      method: 'POST',
      body: JSON.stringify({ days, reason }),
    });
  }

  async changeUserRole(userId: string, role: string) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPendingDeposits() {
    return this.request('/admin/deposits/pending');
  }

  async markDriverNoShow(driverId: string, tripId: string) {
    return this.request(`/admin/drivers/${driverId}/trips/${tripId}/no-show`, {
      method: 'POST',
    });
  }

  async approveDeposit(depositId: string) {
    return this.request(`/admin/deposits/${depositId}/approve`, {
      method: 'POST',
    });
  }

  async rejectDeposit(depositId: string, reason?: string) {
    return this.request(`/admin/deposits/${depositId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getPendingDrivers() {
    return this.request('/admin/drivers/pending');
  }

  async approveDriver(driverId: string) {
    return this.request(`/admin/drivers/${driverId}/approve`, {
      method: 'POST',
    });
  }

  async declineDriver(driverId: string) {
    return this.request(`/admin/drivers/${driverId}/decline`, {
      method: 'POST',
    });
  }

  async getAllTripsAdmin(page = 1) {
    return this.request(`/admin/trips?page=${page}`);
  }

  async cancelTripAdmin(tripId: string) {
    return this.request(`/trips/${tripId}`, {
      method: 'DELETE',
    });
  }

  async boardPassenger(tripId: string, boardingToken: string) {
    return this.request<{
      passengerName: string;
      seatNumber: number;
      boardedAt: string;
      message: string;
    }>(`/trips/${tripId}/board-passenger`, {
      method: 'POST',
      body: JSON.stringify({ boardingToken }),
    });
  }

  async getBoardedPassengers(tripId: string) {
    return this.request<
      Array<{
        bookingId: string;
        passengerName: string;
        maskedPhone: string;
        seats: number;
        boardedAt: string;
      }>
    >(`/trips/${tripId}/boarded-passengers`);
  }

  async adminCompleteTrip(tripId: string) {
    return this.request(`/admin/trips/${tripId}/complete`, {
      method: 'PATCH',
    });
  }



  async getFinancials() {
    return this.request('/admin/financials');
  }

  async getPlatformSettings() {
    return this.request('/admin/platform-settings');
  }

  async updatePlatformSettings(data: {
    instapayNumber?: string;
    vodafoneCashNumber?: string;
    commissionRate?: number;
  }) {
    return this.request('/admin/platform-settings', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // ─── Commission System ────────────────────────────────────────────

  async getDriverWallet() {
    return this.request('/driver/wallet');
  }

  async getDriverCommissions() {
    return this.request('/driver/commissions');
  }

  async getDriverDebtSummary() {
    return this.request('/driver/debt-summary');
  }

  async submitCommissionPayment(data: {
    amount: number;
    instapayReferenceNumber: string;
    screenshotUrl: string;
  }) {
    return this.request('/driver/payment-request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDriverPaymentHistory() {
    return this.request('/driver/payment-history');
  }

  async getAdminPaymentRequests(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return this.request(`/admin/payment-requests${qs}`);
  }

  async approveCommissionPayment(paymentId: string) {
    return this.request(`/admin/payment-requests/${paymentId}/approve`, {
      method: 'PATCH',
    });
  }

  async rejectCommissionPayment(paymentId: string, reason?: string) {
    return this.request(`/admin/payment-requests/${paymentId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  async getDriverWeeklyStats() {
    return this.request('/wallet/driver-weekly-stats');
  }

  async payCommission(data: { amount: number; receiptUrl: string; paymentMethod: string }) {
    return this.request('/driver/payment-request', {
      method: 'POST',
      body: JSON.stringify({
        amount: data.amount,
        instapayReferenceNumber: data.paymentMethod,
        screenshotUrl: data.receiptUrl,
      }),
    });
  }

  // ─── Admin: Transactions & User Detail ────────────────────────────

  async getAllTransactionsAdmin(page = 1) {
    return this.request(`/admin/transactions?page=${page}`);
  }

  async getUserDetailAdmin(userId: string) {
    return this.request(`/admin/users/${userId}/detail`);
  }

  // ─── Trip Cancellation Requests ───────────────────────────────────

  async requestTripCancellation(tripId: string, reason: string) {
    return this.request(`/trips/${tripId}/request-cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async getPendingCancellations() {
    return this.request('/admin/cancellations/pending');
  }

  async approveCancellation(id: string) {
    return this.request(`/admin/cancellations/${id}/approve`, { method: 'POST' });
  }

  async rejectCancellation(id: string, reason?: string) {
    return this.request(`/admin/cancellations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ─── Admin: Driver Documents Gallery ──────────────────────────────

  async getDriverDocuments(userId: string) {
    return this.request(`/admin/drivers/${userId}/documents`);
  }

  // ─── Push Notifications ───────────────────────────────────────────

  async subscribePush(subscription: { endpoint: string; p256dh: string; auth: string }) {
    return this.request('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
  }

  async unsubscribePush(endpoint: string) {
    return this.request('/push/unsubscribe', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint }),
    });
  }

  // ─── Group Chat ───────────────────────────────────────────────────

  async getChatMessages(cursor?: string, limit = 50) {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    params.set('limit', String(limit));
    return this.request(`/chat/messages?${params.toString()}`);
  }

  async getChatStatus() {
    return this.request('/chat/status');
  }

  async deleteChatMessage(messageId: string) {
    return this.request(`/chat/messages/${messageId}`, { method: 'DELETE' });
  }

  async blockChatUser(userId: string, reason?: string) {
    return this.request(`/chat/block/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async unblockChatUser(userId: string) {
    return this.request(`/chat/block/${userId}`, { method: 'DELETE' });
  }

  async getBlockedChatUsers() {
    return this.request('/chat/blocked');
  }
}

export const api = new ApiClient();
