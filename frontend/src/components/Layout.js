import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SearchModal from './SearchModal';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-rss text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-white">WiseRSS</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          {/* Main Navigation */}
          <div className="space-y-2 mb-8">
            <Link
              to="/"
              className={`nav-item ${isActive('/') ? 'active' : ''}`}
            >
              <i className="fas fa-home text-lg"></i>
              <span className="font-medium">首頁</span>
            </Link>
            <Link
              to="/feeds"
              className={`nav-item ${isActive('/feeds') ? 'active' : ''}`}
            >
              <i className="fas fa-rss text-lg"></i>
              <span className="font-medium">Feed管理</span>
            </Link>
          </div>

          {/* Search Button */}
          <div className="mb-8">
            <button
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-3 transition-colors"
            >
              <i className="fas fa-search text-lg"></i>
              <span className="font-medium">搜尋電子報</span>
            </button>
          </div>

          {/* Tags Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              標籤
            </h3>
            <div className="space-y-2">
              <div className="nav-item">
                <span className="text-sm">科技</span>
                <span className="text-xs text-gray-400 ml-auto">12</span>
              </div>
              <div className="nav-item">
                <span className="text-sm">商業</span>
                <span className="text-xs text-gray-400 ml-auto">8</span>
              </div>
              <div className="nav-item">
                <span className="text-sm">設計</span>
                <span className="text-xs text-gray-400 ml-auto">5</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-sm text-gray-300"></i>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-white">
                {user?.username || '使用者'}
              </div>
              <div className="text-xs text-gray-400">
                {user?.email || 'user@example.com'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
              title="登出"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
};

export default Layout;