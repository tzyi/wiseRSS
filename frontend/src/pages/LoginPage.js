import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const LoginPage = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-gray-800/80 backdrop-blur-lg border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <i className="fas fa-rss text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold gradient-text">WiseRSS</h1>
          <p className="text-gray-400 mt-2">智慧RSS閱讀系統</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <i className="fas fa-user mr-2"></i>帳號
            </label>
            <input
              type="text"
              {...register('username', {
                required: '請輸入帳號',
                minLength: {
                  value: 3,
                  message: '帳號至少需要3個字符',
                },
              })}
              className="input w-full"
              placeholder="請輸入您的帳號"
            />
            {errors.username && (
              <p className="text-red-400 text-sm mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <i className="fas fa-lock mr-2"></i>密碼
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: '請輸入密碼',
                  minLength: {
                    value: 6,
                    message: '密碼至少需要6個字符',
                  },
                })}
                className="input w-full pr-12"
                placeholder="請輸入您的密碼"
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
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
            disabled={isLoading}
            className="btn-primary w-full py-3 px-4 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                登入中...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
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
          <button className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors">
            <i className="fab fa-google mr-2"></i>
            使用 Google 登入
          </button>
          <button className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium text-white transition-colors">
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