import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigate('/home');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary to-dark-secondary flex items-center justify-center p-4">
      <div className="bg-dark-tertiary bg-opacity-80 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <i className="fas fa-rss text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            WiseRSS
          </h1>
          <p className="text-gray-400 mt-2">智慧RSS閱讀系統</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <i className="fas fa-user mr-2"></i>帳號
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="input-field w-full px-4 py-3 rounded-lg text-white placeholder-gray-400"
              placeholder="請輸入您的帳號"
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <i className="fas fa-lock mr-2"></i>密碼
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 pr-12"
                placeholder="請輸入您的密碼"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={togglePassword}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-300">記住我</span>
            </label>
            <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
              忘記密碼？
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 px-4 rounded-lg font-medium text-white focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                登入中...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt mr-2"></i>
                登入系統
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-gray-400 text-sm">或</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <button 
            type="button"
            className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors"
            disabled={loading}
          >
            <i className="fab fa-google mr-2"></i>
            使用 Google 登入
          </button>
          <button 
            type="button"
            className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors"
            disabled={loading}
          >
            <i className="fab fa-github mr-2"></i>
            使用 GitHub 登入
          </button>
        </div>

        {/* Register Link */}
        <div className="text-center mt-6">
          <span className="text-gray-400">還沒有帳號？</span>
          <a href="#" className="text-blue-400 hover:text-blue-300 ml-1">
            立即註冊
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;