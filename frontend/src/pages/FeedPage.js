import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Layout from '../components/Layout';
import FeedCard from '../components/FeedCard';
import AddFeedModal from '../components/AddFeedModal';
import { feedService } from '../services/feedService';

const FeedPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const queryClient = useQueryClient();

  const { data: feeds = [], isLoading, error } = useQuery(
    ['feeds', { search: searchQuery, status: statusFilter, category: categoryFilter }],
    () => feedService.getFeeds({ 
      search: searchQuery,
      status: statusFilter,
      category: categoryFilter
    }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const { data: stats = {} } = useQuery(
    'feed-stats',
    () => feedService.getFeedStats(),
    {
      staleTime: 5 * 60 * 1000,
    }
  );

  const deleteFeedMutation = useMutation(
    (feedId) => feedService.deleteFeed(feedId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('feeds');
        queryClient.invalidateQueries('feed-stats');
      }
    }
  );

  const refreshFeedMutation = useMutation(
    (feedId) => feedService.refreshFeed(feedId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('feeds');
      }
    }
  );

  const handleDeleteFeed = (feedId, feedName) => {
    if (window.confirm(`確定要刪除 "${feedName}" 嗎？`)) {
      deleteFeedMutation.mutate(feedId);
    }
  };

  const handleRefreshFeed = (feedId) => {
    refreshFeedMutation.mutate(feedId);
  };

  const statisticsCards = [
    {
      title: '總訂閱數',
      value: stats.total || 0,
      icon: 'fas fa-rss',
      color: 'bg-blue-600'
    },
    {
      title: '活躍訂閱',
      value: stats.active || 0,
      icon: 'fas fa-check-circle',
      color: 'bg-green-600'
    },
    {
      title: '待處理',
      value: stats.pending || 0,
      icon: 'fas fa-clock',
      color: 'bg-yellow-600'
    },
    {
      title: '今日新文章',
      value: stats.new_articles_today || 0,
      icon: 'fas fa-envelope',
      color: 'bg-purple-600'
    }
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Feed 管理</h1>
            <p className="text-gray-400">管理您的RSS訂閱源，新增或移除電子報</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
          >
            <i className="fas fa-plus mr-2"></i>
            新增 RSS Feed
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statisticsCards.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center">
                <div className={`p-3 ${stat.color} rounded-lg`}>
                  <i className={`${stat.icon} text-white text-xl`}></i>
                </div>
                <div className="ml-4">
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 pl-12"
                placeholder="搜尋 RSS Feed..."
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field px-4 py-3 rounded-lg text-white"
          >
            <option value="">所有狀態</option>
            <option value="active">活躍</option>
            <option value="inactive">停用</option>
            <option value="pending">待處理</option>
            <option value="error">錯誤</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field px-4 py-3 rounded-lg text-white"
          >
            <option value="">所有分類</option>
            <option value="科技">科技</option>
            <option value="商業">商業</option>
            <option value="設計">設計</option>
            <option value="AI">AI</option>
          </select>
        </div>

        {/* Feed List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center h-64">
              <div className="text-center">
                <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
                <p className="text-gray-400">載入 Feed 中...</p>
              </div>
            </div>
          ) : error ? (
            <div className="col-span-full flex items-center justify-center h-64">
              <div className="text-center">
                <i className="fas fa-exclamation-triangle text-2xl text-red-400 mb-2"></i>
                <p className="text-red-400">載入 Feed 失敗</p>
              </div>
            </div>
          ) : feeds.length === 0 ? (
            <div className="col-span-full flex items-center justify-center h-64">
              <div className="text-center">
                <i className="fas fa-rss text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-400 text-lg">暫無 RSS Feed</p>
                <p className="text-gray-500 text-sm">點擊「新增 RSS Feed」來開始</p>
              </div>
            </div>
          ) : (
            feeds.map((feed) => (
              <FeedCard
                key={feed.id}
                feed={feed}
                onDelete={handleDeleteFeed}
                onRefresh={handleRefreshFeed}
                isRefreshing={refreshFeedMutation.isLoading}
              />
            ))
          )}
        </div>
      </div>

      {/* Add Feed Modal */}
      <AddFeedModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries('feeds');
          queryClient.invalidateQueries('feed-stats');
        }}
      />
    </Layout>
  );
};

export default FeedPage;