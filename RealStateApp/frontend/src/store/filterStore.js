import { create } from 'zustand';

const initialFilters = {
  status: 'BUY', // BUY or RENT
  type: '',      // HOUSE, APARTMENT, PORTION, PLOT, OFFICE, SHOP, COMMERCIAL
  phase: '',     // Phase 1 - 8, DHA City
  priceMin: '',
  priceMax: '',
  beds: '',
  baths: '',
  possessionStatus: '',
  furnished: '',
  query: '',
};

export const useFilterStore = create((set) => ({
  filters: { ...initialFilters },
  viewMode: 'grid', // 'grid' | 'list' | 'map'

  setFilter: (name, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [name]: value,
      },
    }));
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
      },
    }));
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  resetFilters: () => {
    set((state) => ({
      filters: {
        ...initialFilters,
        status: state.filters.status, // Keep listing status (BUY/RENT) consistent
      },
    }));
  },

  clearAll: () => {
    set({ filters: { ...initialFilters } });
  }
}));
