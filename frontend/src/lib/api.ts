import { TripFilters, ApiResponse, Trip, Booking, Wallet, Notification, Rating, User } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP ${response.status}`);
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
    return this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
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

  async createTrip(data: Partial<Trip>) {
    return this.request<Trip>('/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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

  // ─── Driver ──────────────────────────────────────────────────────

  async confirmReady(tripId: string) {
    return this.request(`/driver/trips/${tripId}/confirm-ready`, {
      method: 'POST',
    });
  }

  async getDriverDashboard() {
    return this.request('/driver/dashboard');
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
}

export const api = new ApiClient();
