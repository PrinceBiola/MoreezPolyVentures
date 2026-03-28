import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor for Auth
api.interceptors.request.use((config) => {
  try {
    const rawUser = localStorage.getItem('moreez_polyventure_user');
    if (!rawUser) return config;

    const user = JSON.parse(rawUser);
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
      // console.log(`🚀 Attaching token for ${config.url}`);
    }
  } catch (error) {
    console.error('❌ Error reading auth token from localStorage', error);
  }
  return config;
});

export default api;
