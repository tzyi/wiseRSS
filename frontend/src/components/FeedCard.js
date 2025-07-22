import React from 'react';

const FeedCard = ({ feed, onDelete, onRefresh, isRefreshing }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-600';
      case 'inactive':
        return 'bg-red-600';
      case 'pending':
        return 'bg-yellow-600';
      case 'error':
        return 'bg-red-600';
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
      case 'error':
        return '錯誤';
      default:
        return '未知';
    }
  };

  const getPlaceholderImage = (category) => {
    const colors = {
      '科技': '3b82f6',
      '商業': '10b981',
      '設計': 'ef4444',
      'AI': '8b5cf6',
      default: '6b7280'
    };
    
    const color = colors[category] || colors.default;
    const text = category ? category.substring(0, 2) : 'RSS';
    
    return `https://via.placeholder.com/48x48/${color}/ffffff?text=${encodeURIComponent(text)}`;
  };

  const formatLastUpdated = (lastFetched) => {
    if (!lastFetched) return '從未更新';
    
    const now = new Date();
    const updated = new Date(lastFetched);
    const diffInHours = Math.floor((now - updated) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '剛才更新';
    if (diffInHours < 24) return `${diffInHours}小時前更新`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}天前更新`;
  };

  return (
    <div className="feed-card rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img
            src={feed.image_url || getPlaceholderImage(feed.category)}
            alt={feed.title}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              e.target.src = getPlaceholderImage(feed.category);
            }}
          />
          <div>
            <h3 className="text-lg font-semibold text-white">{feed.title}</h3>
            <p className="text-sm text-gray-400">{feed.site_url || feed.url}</p>
          </div>
        </div>
        <span className={`${getStatusColor(feed.status)} px-3 py-1 rounded-full text-xs text-white`}>
          {getStatusText(feed.status)}
        </span>
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {feed.description || '暫無描述'}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <span>
          <i className="fas fa-newspaper mr-1"></i>
          {feed.total_articles} 篇文章
        </span>
        <span>
          <i className="fas fa-clock mr-1"></i>
          {formatLastUpdated(feed.last_fetched)}
        </span>
      </div>

      {/* Tags */}
      <div className="flex items-center space-x-2 mb-4">
        {feed.tags?.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Error message */}
      {feed.status === 'error' && feed.last_error && (
        <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg">
          <p className="text-red-200 text-sm">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {feed.last_error}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-600">
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            onClick={() => window.open(feed.site_url || feed.url, '_blank')}
          >
            <i className="fas fa-eye mr-1"></i>
            查看
          </button>
          <button
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors disabled:opacity-50"
            onClick={() => onRefresh(feed.id)}
            disabled={isRefreshing}
          >
            <i className={`fas ${isRefreshing ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-1`}></i>
            {isRefreshing ? '更新中' : '更新'}
          </button>
          <button className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors">
            <i className="fas fa-edit mr-1"></i>
            編輯
          </button>
        </div>
        <button
          className="text-red-400 hover:text-red-300 transition-colors"
          onClick={() => onDelete(feed.id, feed.title)}
        >
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

export default FeedCard;