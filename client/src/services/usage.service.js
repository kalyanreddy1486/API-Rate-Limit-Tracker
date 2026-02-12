import api from './api';

const usageService = {
  track: (data) => api.post('/api/usage/track', data),
  getHistory: (apiId, params) => api.get(`/api/usage/history/${apiId}`, { params }),
};

export default usageService;
