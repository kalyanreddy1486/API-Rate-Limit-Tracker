import api from './api';

const apiService = {
  getAll: () => api.get('/api/apis'),
  getById: (id) => api.get(`/api/apis/${id}`),
  create: (data) => api.post('/api/apis', data),
  update: (id, data) => api.put(`/api/apis/${id}`, data),
  delete: (id) => api.delete(`/api/apis/${id}`),
};

export default apiService;
