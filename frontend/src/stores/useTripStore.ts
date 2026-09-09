import { create } from 'zustand';
import { Trip, TripFilters } from '@/types';
import { api, isAbortError } from '@/lib/api';

type ErrorKind = 'network' | 'server' | 'auth' | 'generic';

interface TripState {
  trips: Trip[];
  selectedTrip: Trip | null;
  filters: TripFilters;
  isLoading: boolean;
  error: string | null;
  errorKind: ErrorKind | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;

  // Internal — NOT consumed by components
  _abortController: AbortController | null;

  // Actions
  fetchTrips: () => Promise<void>;
  fetchTrip: (id: string) => Promise<void>;
  updateTrip: (data: Partial<Trip>) => void;
  setFilters: (filters: Partial<TripFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  cancelPendingRequest: () => void;
}

const defaultFilters: TripFilters = {
  q: '',
  fromCity: '',
  toCity: '',
  date: '',
  minPrice: undefined,
  maxPrice: undefined,
  page: 1,
  limit: 10,
};

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  selectedTrip: null,
  filters: { ...defaultFilters },
  isLoading: false,
  error: null,
  errorKind: null,
  meta: null,
  _abortController: null,

  cancelPendingRequest: () => {
    const current = get()._abortController;
    if (current) {
      current.abort();
      set({ _abortController: null });
    }
  },

  fetchTrips: async () => {
    // Cancel any in-flight request to prevent race conditions
    const prev = get()._abortController;
    if (prev) prev.abort();

    const controller = new AbortController();
    set({ isLoading: true, error: null, errorKind: null, _abortController: controller });

    try {
      const response = await api.getTrips(get().filters, controller.signal);
      // Only update state if this request wasn't cancelled
      if (!controller.signal.aborted) {
        set({
          trips: response.data || [],
          meta: response.meta || null,
          isLoading: false,
          _abortController: null,
        });
      }
    } catch (error: any) {
      // Silently ignore aborted requests (user navigated away or new request started)
      if (isAbortError(error)) return;

      let errorKind: ErrorKind = 'generic';
      if (error.name === 'NetworkError') errorKind = 'network';
      else if (error.name === 'TimeoutError') errorKind = 'network';
      else if (error.name === 'ApiError' && error.status === 401) errorKind = 'auth';
      else if (error.name === 'ApiError' && error.status >= 500) errorKind = 'server';

      set({
        error: error.message,
        errorKind,
        isLoading: false,
        _abortController: null,
      });
    }
  },

  fetchTrip: async (id: string) => {
    set({ isLoading: true, error: null, errorKind: null });
    try {
      const response = await api.getTrip(id);
      set({ selectedTrip: response.data || null, isLoading: false });
    } catch (error: any) {
      if (isAbortError(error)) return;

      let errorKind: ErrorKind = 'generic';
      if (error.name === 'NetworkError' || error.name === 'TimeoutError') errorKind = 'network';
      else if (error.name === 'ApiError' && error.status >= 500) errorKind = 'server';

      set({ error: error.message, errorKind, isLoading: false });
    }
  },

  updateTrip: (data: Partial<Trip>) => {
    set((state) => ({
      selectedTrip: state.selectedTrip ? { ...state.selectedTrip, ...data } as Trip : null,
      trips: state.trips.map(t => t.id === data.id ? { ...t, ...data } as Trip : t)
    }));
  },

  setFilters: (newFilters: Partial<TripFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    }));
    // Auto-fetch with new filters (previous request auto-cancelled in fetchTrips)
    get().fetchTrips();
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
    get().fetchTrips();
  },

  setPage: (page: number) => {
    set((state) => ({
      filters: { ...state.filters, page },
    }));
    // Auto-fetch when page changes
    get().fetchTrips();
  },
}));
