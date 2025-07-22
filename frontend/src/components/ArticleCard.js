import React from 'react';

const ArticleCard = ({ article, isSelected, onSelect }) => {
  const handleClick = () => {
    onSelect(article);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPlaceholderImage = (category) => {
    const colors = {
      '科技': '4f46e5',
      '商業': '059669', 
      '設計': 'dc2626',
      'AI': '8b5cf6',
      default: '6b7280'
    };
    
    const color = colors[category] || colors.default;
    const text = category ? category.charAt(0) : 'RSS';
    
    return `https://via.placeholder.com/80x80/${color}/ffffff?text=${text}`;
  };

  return (
    <div
      className={`article-card p-6 rounded-lg cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex space-x-4">
        <img
          src={article.image_url || getPlaceholderImage(article.category)}
          alt={article.title}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          onError={(e) => {
            e.target.src = getPlaceholderImage(article.category);
          }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white line-clamp-2 pr-2">
              {article.title}
            </h3>
            <span className="text-sm text-gray-400 flex-shrink-0">
              {formatDate(article.published_at)}
            </span>
          </div>
          
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {article.summary || article.content?.substring(0, 150) + '...'}
          </p>
          
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span className="flex items-center">
              <i className="fas fa-globe mr-1"></i>
              {article.feed_name}
            </span>
            {article.author && (
              <span>{article.author}</span>
            )}
            <span>{article.read_time || '5'} mins</span>
            
            {/* Tags */}
            <div className="flex space-x-2">
              {article.tags?.map((tag, index) => (
                <span key={index} className="tag px-2 py-1 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
            <div className="flex items-center space-x-3">
              {article.is_read && (
                <span className="text-green-400 text-xs">
                  <i className="fas fa-check-circle mr-1"></i>
                  已讀
                </span>
              )}
              {article.is_bookmarked && (
                <span className="text-yellow-400 text-xs">
                  <i className="fas fa-bookmark mr-1"></i>
                  收藏
                </span>
              )}
              {article.has_notes && (
                <span className="text-blue-400 text-xs">
                  <i className="fas fa-sticky-note mr-1"></i>
                  筆記
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="text-gray-400 hover:text-white text-xs">
                <i className="fas fa-share-alt"></i>
              </button>
              <button className="text-gray-400 hover:text-white text-xs">
                <i className="fas fa-ellipsis-v"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;