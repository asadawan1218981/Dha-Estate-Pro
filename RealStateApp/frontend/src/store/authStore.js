import { create } from 'zustand';
import { API_URL } from '../lib/api';

const getLocalStorageItem = (key) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const getLocalStorageJSON = (key) => {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
  return null;
};

const setLocalStorageItem = (key, value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeLocalStorageItem = (key) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

export const useAuthStore = create((set, get) => ({
  user: getLocalStorageJSON('dha_user'),
  token: getLocalStorageItem('dha_token'),
  refreshToken: getLocalStorageItem('dha_refresh_token'),
  isAuthenticated: !!getLocalStorageItem('dha_token'),
  isLoading: false,
  error: null,

  setUser: (user) => {
    setLocalStorageItem('dha_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  setTokens: (token, refreshToken) => {
    setLocalStorageItem('dha_token', token);
    setLocalStorageItem('dha_refresh_token', refreshToken);
    set({ token, refreshToken, isAuthenticated: true });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      get().setTokens(data.accessToken, data.refreshToken);
      get().setUser(data.user);
      set({ isLoading: false });
      return data.user;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (name, email, password, role = 'USER', phone = '') => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      get().setTokens(data.accessToken, data.refreshToken);
      get().setUser(data.user);
      set({ isLoading: false });
      return data.user;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    removeLocalStorageItem('dha_token');
    removeLocalStorageItem('dha_refresh_token');
    removeLocalStorageItem('dha_user');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
  },

  updateProfile: async (name, phone, avatar) => {
    const token = get().token;
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone, avatar }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      get().setUser(data.user);
      set({ isLoading: false });
      return data.user;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  toggleFavorite: async (propertyId) => {
    const token = get().token;
    const user = get().user;
    if (!token || !user) return;

    try {
      const response = await fetch(`${API_URL}/auth/favorites/${propertyId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...user, savedProperties: data.savedProperties };
        get().setUser(updatedUser);
      }
    } catch (err) {
      console.error('Toggle favorite err:', err);
    }
  }
}));
