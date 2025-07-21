import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        toast.success('登入成功！');
        return { success: true };
      }
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || '登入失敗，請檢查帳號密碼');
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        toast.success('註冊成功！');
        return { success: true };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.message || '註冊失敗，請稍後再試');
      return { success: false, error: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('已成功登出');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      toast.success('個人資料更新成功！');
      return { success: true };
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error(error.response?.data?.message || '更新失敗，請稍後再試');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};