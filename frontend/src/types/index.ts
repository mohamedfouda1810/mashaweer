// ============================================================================
// Mashaweer - Shared TypeScript Types
// ============================================================================

export type Role = 'ADMIN' | 'DRIVER' | 'PASSENGER';

export enum TripStatus {
  SCHEDULED = 'SCHEDULED',
  DRIVER_CONFIRMED = 'DRIVER_CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  INSTAPAY = 'INSTAPAY',
  VODAFONE_CASH = 'VODAFONE_CASH',
}

export enum DepositStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ─── User Types ─────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
  isBanned: boolean;
  noShowCount: number;
  isVerified: boolean;
  createdAt: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  carModel: string;
  carColor?: string;
  carPhotoUrl?: string;
  plateNumber: string;
  licenseNumber: string;
  isApproved: boolean;
}

// ─── Trip Types ─────────────────────────────────────────────────────

export interface Trip {
  id: string;
  driverId: string;
  fromCity: string;
  toCity: string;
  fromAddress?: string;
  toAddress?: string;
  gatheringLocation: string;
  gatheringLatitude?: number;
  gatheringLongitude?: number;
  departureTime: string;
  estimatedArrival?: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: TripStatus;
  driverConfirmedAt?: string;
  notes?: string;
  createdAt: string;
  driver: User & { driverProfile: DriverProfile };
  _count?: {
    bookings: number;
    waitlists: number;
  };
}

export interface TripFilters {
  fromCity?: string;
  toCity?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

// ─── Booking Types ──────────────────────────────────────────────────

export interface Booking {
  id: string;
  userId: string;
  tripId: string;
  seats: number;
  status: BookingStatus;
  bookedAt: string;
  trip: Trip;
}

// ─── Wallet Types ───────────────────────────────────────────────────

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference?: string;
  createdAt: string;
}

export interface DepositRequest {
  id: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  receiptUrl: string;
  status: DepositStatus;
  adminNote?: string;
  createdAt: string;
}

// ─── Rating Types ───────────────────────────────────────────────────

export interface Rating {
  id: string;
  raterId: string;
  ratedId: string;
  tripId: string;
  score: number;
  review?: string;
  createdAt: string;
  rater?: User;
  rated?: User;
}

// ─── Notification Types ─────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Admin Types ────────────────────────────────────────────────────

export interface AdminAlert {
  id: string;
  type: string;
  tripId: string;
  driverId: string;
  message: string;
  isResolved: boolean;
  resolvedAt?: string;
  createdAt: string;
  trip: Trip;
  driver: User;
}

// ─── API Response ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
