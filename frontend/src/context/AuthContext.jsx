import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('moreez_polyventure_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('moreez_polyventure_user');
      }
    }

    // Add interceptor for 401s
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    setLoading(false);
    return () => api.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const userData = res.data;
    localStorage.setItem('moreez_polyventure_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const userData = res.data;
    localStorage.setItem('moreez_polyventure_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (token, password) => {
    const res = await api.put(`/auth/reset-password/${token}`, { password });
    return res.data;
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    const updatedUserData = { ...user, ...res.data };
    localStorage.setItem('moreez_polyventure_user', JSON.stringify(updatedUserData));
    setUser(updatedUserData);
    return updatedUserData;
  };

  const logout = () => {
    localStorage.removeItem('moreez_polyventure_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, forgotPassword, resetPassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
