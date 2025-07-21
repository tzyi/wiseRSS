import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { feedService } from '../services/feedService';
import LoadingSpinner from '../components/LoadingSpinner';
import FeedCard from '../components/FeedCard';
import AddFeedModal from '../components/AddFeedModal';
import toast from 'react-hot-toast';

const FeedPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const queryClient = useQueryClient();

  const {
    data: feeds,
    isLoading,
    error,
  } = useQuery('feeds', feedService.getFeeds);

  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery('feedStats', feedService.getFeedStats);

  const deleteFeedMutation = useMutation(feedService.deleteFeed, {
    onSuccess: () => {
      queryClient.invalidateQueries('feeds');
      queryClient.invalidateQueries('feedStats');
      toast.success('RSS源已刪除');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '刪除失敗');
    },
  });

  const refreshFeedMutation = useMutation(feedService.refreshFeed, {
    onSuccess: () => {
      queryClient.invalidateQueries('feeds');
      toast.success('RSS源已更新');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '更新失敗');
    },
  });

  const handleDeleteFeed = async (feedId, feedTitle) => {
    if (window.confirm(`確定要刪除 "${feedTitle}" 嗎？`)) {
      deleteFeedMutation.mutate(feedId);
    }
  };

  const handleRefreshFeed = (feedId) => {
    refreshFeedMutation.mutate(feedId);
  };

  const filteredFeeds = feeds?.filter((feed) => {
    const matchesSearch = feed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         feed.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || feed.status === statusFilter;
    const matchesCategory = !categoryFilter || feed.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h2 className="text-xl font-semibold text-white mb-2">載入失敗</h2>
          <p className="text-gray-400">無法載入RSS源，請稍後再試</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Feed 管理</h1>
            <p className="text-gray-400">管理您的RSS訂閱源，新增或移除電子報</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-success px-6 py-3 font-medium"
          >
            <i className="fas fa-plus"></i>
            新增 RSS Feed
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-600 rounded-lg">
                <i className="fas fa-rss text-white text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">總訂閱數</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.totalFeeds || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-600 rounded-lg">
                <i className="fas fa-check-circle text-white text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">活躍訂閱</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.activeFeeds || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-600 rounded-lg">
                <i className="fas fa-clock text-white text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">待處理</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.pendingFeeds || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-600 rounded-lg">
                <i className="fas fa-envelope text-white text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-gray-400 text-sm">今日新文章</p>
                <p className="text-2xl font-bold text-white">
                  {statsLoading ? '...' : stats?.todayArticles || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-12"
                placeholder="搜尋 RSS Feed..."
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">所有狀態</option>
            <option value="active">活躍</option>
            <option value="inactive">停用</option>
            <option value="pending">待處理</option>
          </select>
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="">所有分類</option>
            <option value="tech">科技</option>
            <option value="business">商業</option>
            <option value="design">設計</option>
            <option value="news">新聞</option>
          </select>
        </div>
      </div>

      {/* Feed List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredFeeds?.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-rss text-4xl text-gray-600 mb-4"></i>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery || statusFilter || categoryFilter ? '沒有符合條件的RSS源' : '還沒有RSS源'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || statusFilter || categoryFilter 
                ? '請嘗試調整搜尋條件或篩選器'
                : '開始添加您喜歡的RSS源來獲取最新內容'
              }
            </p>
            {!searchQuery && !statusFilter && !categoryFilter && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-primary"
              >
                <i className="fas fa-plus"></i>
                新增第一個 RSS Feed
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredFeeds?.map((feed) => (
              <FeedCard
                key={feed.id}
                feed={feed}
                onDelete={() => handleDeleteFeed(feed.id, feed.title)}
                onRefresh={() => handleRefreshFeed(feed.id)}
                isDeleting={deleteFeedMutation.isLoading}
                isRefreshing={refreshFeedMutation.isLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Feed Modal */}
      <AddFeedModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          queryClient.invalidateQueries('feeds');
          queryClient.invalidateQueries('feedStats');
        }}
      />
    </div>
  );
};

export default FeedPage;