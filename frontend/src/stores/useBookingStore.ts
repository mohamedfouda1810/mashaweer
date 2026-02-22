import { create } from 'zustand';
import { Booking } from '@/types';
import { api } from '@/lib/api';

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  isBooking: boolean;
  error: string | null;

  // Actions
  fetchBookings: () => Promise<void>;
  bookSeat: (tripId: string, seats?: number) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<{ refundAmount: number } | null>;
}

export const useBookingStore = create<BookingState>((set) => ({
  bookings: [],
  isLoading: false,
  isBooking: false,
  error: null,

  fetchBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getMyBookings();
      set({ bookings: response.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  bookSeat: async (tripId: string, seats = 1) => {
    set({ isBooking: true, error: null });
    try {
      await api.bookSeat(tripId, seats);
      set({ isBooking: false });
      return true;
    } catch (error: any) {
      set({ error: error.message, isBooking: false });
      return false;
    }
  },

  cancelBooking: async (bookingId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.cancelBooking(bookingId);
      set({ isLoading: false });
      return response.data || null;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
}));
