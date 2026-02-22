import { create } from 'zustand';
import { Trip, TripFilters } from '@/types';
import { api } from '@/lib/api';

interface TripState {
  trips: Trip[];
  selectedTrip: Trip | null;
  filters: TripFilters;
  isLoading: boolean;
  error: string | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;

  // Actions
  fetchTrips: () => Promise<void>;
  fetchTrip: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TripFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
}

const defaultFilters: TripFilters = {
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
  meta: null,

  fetchTrips: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getTrips(get().filters);
      set({
        trips: response.data || [],
        meta: response.meta || null,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchTrip: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.getTrip(id);
      set({ selectedTrip: response.data || null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setFilters: (newFilters: Partial<TripFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: 1 },
    }));
  },

  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
  },

  setPage: (page: number) => {
    set((state) => ({
      filters: { ...state.filters, page },
    }));
  },
}));
