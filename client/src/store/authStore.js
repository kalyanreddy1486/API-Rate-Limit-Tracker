import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from '../services/auth.service';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.login(credentials);
          const user = data.data?.user || data.user;
          const token = data.data?.token || data.token;
          set({ user, token, isAuthenticated: true, loading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error?.message || error.message || 'Login failed';
          set({
            error: errorMessage,
            loading: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      signup: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const data = await authService.signup(credentials);
          const user = data.data?.user || data.user;
          const token = data.data?.token || data.token;
          set({ user, token, isAuthenticated: true, loading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.error?.message || error.message || 'Signup failed';
          set({
            error: errorMessage,
            loading: false,
          });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        authService.logout();
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      checkAuth: () => {
        const state = get();
        if (state.token && !state.isAuthenticated) {
          set({ isAuthenticated: true });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

export default useAuthStore;
