import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor for Auth
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('moreez_polyventure_user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
