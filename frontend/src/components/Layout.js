import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { feedService } from '../services/feedService';
import SearchModal from './SearchModal';

const Layout = ({ children, rightPanel }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Fetch user's feeds for sidebar
  const { data: feedsData = {} } = useQuery(
    'sidebar-feeds',
    () => feedService.getFeeds(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!user, // Only fetch if user is authenticated
    }
  );

  const feeds = feedsData.feeds || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-dark-primary text-white">
      {/* Left Sidebar */}
      <div className="sidebar w-64 flex flex-col">
        {/* Logo Area */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-rss text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold">WiseRSS</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          {/* Main Navigation */}
          <div className="space-y-2 mb-8">
            <div
              className={`nav-item px-4 py-3 rounded-lg cursor-pointer flex items-center space-x-3 ${
                isActive('/home') ? 'active' : ''
              }`}
              onClick={() => navigate('/home')}
            >
              <i className="fas fa-home text-lg"></i>
              <span className="font-medium">首頁</span>
            </div>
            <div
              className={`nav-item px-4 py-3 rounded-lg cursor-pointer flex items-center space-x-3 ${
                isActive('/feeds') ? 'active' : ''
              }`}
              onClick={() => navigate('/feeds')}
            >
              <i className="fas fa-rss text-lg"></i>
              <span className="font-medium">Feed</span>
            </div>
          </div>

          {/* Search Button */}
          <div className="mb-8">
            <button
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center space-x-3 transition-colors"
              onClick={() => setIsSearchModalOpen(true)}
            >
              <i className="fas fa-search text-lg"></i>
              <span className="font-medium">搜尋電子報</span>
            </button>
          </div>

          {/* Subscribed Feeds */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
              訂閱列表
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {feeds.length > 0 ? (
                feeds.map((feed) => (
                  <div key={feed.id} className="nav-item px-4 py-2 rounded-lg cursor-pointer flex items-center justify-between hover:bg-gray-700">
                    <div className="flex items-center space-x-2 min-w-0">
                      {feed.image_url ? (
                        <img
                          src={feed.image_url}
                          alt={feed.title}
                          className="w-4 h-4 rounded flex-shrink-0"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <i className="fas fa-rss text-xs text-gray-400 flex-shrink-0"></i>
                      )}
                      <span className="text-sm truncate" title={feed.title}>
                        {feed.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {feed.total_articles || 0}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  暫無訂閱的 Feed
                </div>
              )}
            </div>
            {feeds.length > 0 && (
              <div className="mt-4">
                <button
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                  onClick={() => navigate('/feeds')}
                >
                  管理訂閱
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Area */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
              <i className="fas fa-user text-sm"></i>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{user?.username || '使用者'}</div>
              <div className="text-xs text-gray-400">{user?.email || 'user@example.com'}</div>
            </div>
            <button
              className="text-gray-400 hover:text-white"
              onClick={handleLogout}
              title="登出"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content flex-1 flex flex-col">
        {children}
      </div>

      {/* Right Panel */}
      {rightPanel && (
        <div className="right-panel w-80 flex flex-col">
          {rightPanel}
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
};

export default Layout;