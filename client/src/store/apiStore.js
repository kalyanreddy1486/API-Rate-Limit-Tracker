import { create } from 'zustand';
import apiService from '../services/api.service';

const useAPIStore = create((set, get) => ({
  apis: [],
  selectedAPI: null,
  loading: false,
  error: null,

  fetchAPIs: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.getAll();
      const apis = response.data || response;
      set({ apis: apis, loading: false });
    } catch (error) {
      set({
        error: error.response?.data?.error?.message || 'Failed to fetch APIs',
        loading: false,
      });
    }
  },

  fetchAPIById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.getById(id);
      const data = response.data || response;
      set({ selectedAPI: data, loading: false });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.error?.message || 'Failed to fetch API',
        loading: false,
      });
      return null;
    }
  },

  addAPI: async (apiData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.create(apiData);
      const data = response.data || response;
      set((state) => ({
        apis: [data, ...state.apis],
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error?.message || 'Failed to create API',
        loading: false,
      });
      return { success: false, error: error.response?.data?.error?.message };
    }
  },

  updateAPI: async (id, apiData) => {
    set({ loading: true, error: null });
    try {
      const response = await apiService.update(id, apiData);
      const data = response.data || response;
      set((state) => ({
        apis: state.apis.map((api) =>
          api.id === id ? { ...api, ...data } : api
        ),
        selectedAPI: state.selectedAPI?.id === id 
          ? { ...state.selectedAPI, ...data } 
          : state.selectedAPI,
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error?.message || 'Failed to update API',
        loading: false,
      });
      return { success: false, error: error.response?.data?.error?.message };
    }
  },

  deleteAPI: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiService.delete(id);
      set((state) => ({
        apis: state.apis.filter((api) => api.id !== id),
        selectedAPI: state.selectedAPI?.id === id ? null : state.selectedAPI,
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.error?.message || 'Failed to delete API',
        loading: false,
      });
      return { success: false, error: error.response?.data?.error?.message };
    }
  },

  selectAPI: (api) => set({ selectedAPI: api }),
  clearSelectedAPI: () => set({ selectedAPI: null }),
  clearError: () => set({ error: null }),
}));

export default useAPIStore;
