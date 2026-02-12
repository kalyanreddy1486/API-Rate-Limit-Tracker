import api from './api';

const authService = {
  signup: (credentials) => api.post('/api/auth/signup', credentials),
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
};

export default authService;
