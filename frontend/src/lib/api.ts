import { TripFilters, ApiResponse, Trip, Booking, Wallet, Notification, Rating, User } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/** Resolve an image path from the backend (e.g. "/uploads/x.jpg") to a full URL */
export function getImageUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  // Already absolute
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // Strip /api suffix to get the backend origin
  const origin = API_BASE.replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      // Extract the best error message
      let msg = error.message || error.error || '';
      if (Array.isArray(msg)) msg = msg.join(', ');
      
      switch (response.status) {
        case 400:
          throw new Error(msg || 'Invalid request. Please check your input.');
        case 401:
          throw new Error(msg || 'Session expired. Please log in again.');
        case 403:
          throw new Error(msg || 'You do not have permission for this action.');
        case 404:
          throw new Error(msg || 'The requested resource was not found.');
        case 409:
          throw new Error(msg || 'This action conflicts with existing data.');
        case 500:
          throw new Error(msg || 'Server error. Please try again later.');
        default:
          throw new Error(msg || `Request failed (${response.status})`);
      }
    }

    return response.json();
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

  async verifyEmail(token: string) {
    return this.request<{ message: string }>(`/auth/verify-email?token=${token}`);
  }

  async resendVerification(email: string) {
    return this.request<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  //  ─── Trips ──────────────────────────────────────────────────────

  async getTrips(filters?: TripFilters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    return this.request<Trip[]>(`/trips?${params.toString()}`);
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

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  // ─── Bookings ────────────────────────────────────────────────────

  async bookSeat(tripId: string, seats = 1) {
    return this.request<Booking>(`/bookings/trip/${tripId}`, {
      method: 'POST',
      body: JSON.stringify({ seats }),
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

  async cancelTrip(tripId: string) {
    return this.request(`/trips/${tripId}`, {
      method: 'DELETE',
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

  async confirmPassengerReady(bookingId: string) {
    return this.request(`/bookings/${bookingId}/ready`, {
      method: 'POST',
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
}

export const api = new ApiClient();
