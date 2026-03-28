import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Dashboard hooks
export const useDashboardStats = (startDate, endDate) => {
  return useQuery({
    queryKey: ['dashboard-stats', startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats', {
        params: { startDate, endDate }
      });
      return data;
    },
    enabled: true,
  });
};

// Transport hooks
export const useCars = (search = '') => {
  return useQuery({
    queryKey: ['cars', search],
    queryFn: async () => {
      const { data } = await api.get('/transport/cars', {
        params: { search }
      });
      return data;
    },
  });
};

export const usePayments = (filters = {}) => {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: async () => {
      const { data } = await api.get('/transport/payments', {
        params: filters
      });
      return data;
    },
  });
};

// Business hooks
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await api.get('/business');
      return data;
    },
  });
};

export const useSales = (filters = {}) => {
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: async () => {
      const { data } = await api.get('/business/sales', {
        params: filters
      });
      return data;
    },
  });
};

// Generic mutation helper
export const useApiMutation = (url, method = 'post', queryToInvalidate = []) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newData) => {
      const { data } = await api[method](url, newData);
      return data;
    },
    onSuccess: () => {
      queryToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });
    },
  });
};

export default api;
