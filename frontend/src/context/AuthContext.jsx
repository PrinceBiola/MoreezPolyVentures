import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

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
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      } catch (e) {
        localStorage.removeItem('moreez_polyventure_user');
      }
    }

    // Add interceptor for 401s
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    setLoading(false);
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    const userData = res.data;
    localStorage.setItem('moreez_polyventure_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
    const userData = res.data;
    localStorage.setItem('moreez_polyventure_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
    setUser(userData);
    return userData;
  };

  const forgotPassword = async (email) => {
    const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
    return res.data;
  };

  const updateProfile = async (profileData) => {
    const res = await axios.put('http://localhost:5000/api/auth/profile', profileData);
    const updatedUserData = { ...user, ...res.data };
    localStorage.setItem('moreez_polyventure_user', JSON.stringify(updatedUserData));
    setUser(updatedUserData);
    return updatedUserData;
  };

  const logout = () => {
    localStorage.removeItem('moreez_polyventure_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
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
