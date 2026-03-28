import api from './api';

export const notificationService = {
  getNotifications: async () => {
    try {
      return await api.get('/notifications');
    } catch (error) {
      throw error;
    }
  },
  markAsRead: async (id) => {
    try {
      return await api.patch(`/notifications/${id}`);
    } catch (error) {
      throw error;
    }
  },
  markAllAsRead: async () => {
    try {
      return await api.post('/notifications/read-all');
    } catch (error) {
      throw error;
    }
  },
  deleteNotification: async (id) => {
    try {
      return await api.delete(`/notifications/${id}`);
    } catch (error) {
      throw error;
    }
  },
};

export default notificationService;
