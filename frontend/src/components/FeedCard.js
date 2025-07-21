import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const FeedCard = ({ feed, onDelete, onRefresh, isDeleting, isRefreshing }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'pending':
        return 'status-pending';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return '活躍';
      case 'inactive':
        return '停用';
      case 'pending':
        return '待處理';
      default:
        return '未知';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      tech: 'tag-blue',
      business: 'tag-green',
      design: 'tag-red',
      news: 'tag-purple',
      science: 'tag-yellow',
    };
    return colors[category] || 'tag-blue';
  };

  const formatLastUpdate = (dateString) => {
    if (!dateString) return '從未更新';
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: zhTW,
      });
    } catch {
      return '時間未知';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          {/* Feed Icon */}
          <div className="flex-shrink-0">
            {feed.iconUrl ? (
              <img
                src={feed.iconUrl}
                alt={feed.title}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center ${
                feed.iconUrl ? 'hidden' : ''
              }`}
            >
              <i className="fas fa-rss text-white text-lg"></i>
            </div>
          </div>

          {/* Feed Info */}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-white line-clamp-1">
              {feed.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-1">
              {feed.url}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`status ${getStatusColor(feed.status)}`}>
          {getStatusText(feed.status)}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {feed.description || '沒有描述'}
      </p>

      {/* Statistics */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <span className="flex items-center">
          <i className="fas fa-newspaper mr-1"></i>
          {feed.articleCount || 0} 篇文章
        </span>
        <span className="flex items-center">
          <i className="fas fa-clock mr-1"></i>
          {formatLastUpdate(feed.lastUpdated)}
        </span>
        {feed.updateFrequency && (
          <span className="flex items-center">
            <i className="fas fa-sync mr-1"></i>
            {feed.updateFrequency}
          </span>
        )}
      </div>

      {/* Tags */}
      {feed.tags && feed.tags.length > 0 && (
        <div className="flex items-center space-x-2 mb-4">
          {feed.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className={`tag ${getCategoryColor(feed.category)}`}
            >
              {tag}
            </span>
          ))}
          {feed.tags.length > 3 && (
            <span className="text-gray-500 text-xs">
              +{feed.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Error Message */}
      {feed.lastError && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg">
          <div className="flex items-center text-red-400 text-sm">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            <span className="font-medium">更新錯誤：</span>
          </div>
          <p className="text-red-300 text-xs mt-1 line-clamp-2">
            {feed.lastError}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="btn btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRefreshing ? (
              <>
                <LoadingSpinner size="sm" />
                更新中...
              </>
            ) : (
              <>
                <i className="fas fa-sync"></i>
                更新
              </>
            )}
          </button>
          
          <button className="btn btn-secondary text-sm">
            <i className="fas fa-eye"></i>
            查看
          </button>
          
          <button className="btn btn-secondary text-sm">
            <i className="fas fa-edit"></i>
            編輯
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Health Indicator */}
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${
                feed.health === 'good'
                  ? 'bg-green-500'
                  : feed.health === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            ></div>
            <span className="text-xs text-gray-500">
              {feed.health === 'good'
                ? '正常'
                : feed.health === 'warning'
                ? '警告'
                : '錯誤'}
            </span>
          </div>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="刪除"
          >
            {isDeleting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <i className="fas fa-trash"></i>
            )}
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">創建時間：</span>
            <br />
            {feed.createdAt
              ? new Date(feed.createdAt).toLocaleDateString('zh-TW')
              : '未知'}
          </div>
          <div>
            <span className="font-medium">文章頻率：</span>
            <br />
            {feed.avgArticlesPerDay
              ? `${feed.avgArticlesPerDay} 篇/天`
              : '計算中...'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedCard;