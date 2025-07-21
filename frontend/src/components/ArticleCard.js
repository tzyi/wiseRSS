import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const ArticleCard = ({ article, isSelected, onSelect }) => {
  const handleFavorite = (e) => {
    e.stopPropagation();
    // TODO: Implement favorite functionality
  };

  const handleShare = (e) => {
    e.stopPropagation();
    // TODO: Implement share functionality
  };

  const getReadingTime = (content) => {
    if (!content) return '1 min';
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min${readingTime > 1 ? 's' : ''}`;
  };

  const formatDate = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: zhTW,
      });
    } catch {
      return '剛剛';
    }
  };

  return (
    <div
      className={`article-card ${isSelected ? 'selected' : ''} ${
        !article.isRead ? 'border-l-4 border-l-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex space-x-4">
        {/* Article Image */}
        <div className="flex-shrink-0">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-20 h-20 rounded-lg object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-newspaper text-white text-xl"></i>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white line-clamp-2 pr-4">
              {article.title}
            </h3>
            <div className="flex-shrink-0 flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {formatDate(article.publishedAt)}
              </span>
              {!article.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
            {article.description || article.content || '沒有描述...'}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              {/* Source */}
              <span className="flex items-center">
                <i className="fas fa-globe mr-1"></i>
                {article.feedTitle || article.source || 'Unknown'}
              </span>

              {/* Author */}
              {article.author && (
                <span className="flex items-center">
                  <i className="fas fa-user mr-1"></i>
                  {article.author}
                </span>
              )}

              {/* Reading Time */}
              <span className="flex items-center">
                <i className="fas fa-clock mr-1"></i>
                {getReadingTime(article.content)}
              </span>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                  {article.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className={`tag tag-${
                        ['blue', 'green', 'purple', 'red', 'yellow'][index % 5]
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 2 && (
                    <span className="text-gray-500">+{article.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleFavorite}
                className={`transition-colors ${
                  article.isFavorite
                    ? 'text-yellow-400'
                    : 'text-gray-400 hover:text-yellow-400'
                }`}
                title={article.isFavorite ? '取消收藏' : '加入收藏'}
              >
                <i className={`fas fa-star ${article.isFavorite ? '' : 'far'}`}></i>
              </button>
              
              <button
                onClick={handleShare}
                className="text-gray-400 hover:text-blue-400 transition-colors"
                title="分享"
              >
                <i className="fas fa-share"></i>
              </button>

              {/* Read Status Indicator */}
              {article.isRead && (
                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar for Partially Read Articles */}
          {article.readProgress && article.readProgress > 0 && article.readProgress < 100 && (
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${article.readProgress}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500 mt-1">
                已閱讀 {article.readProgress}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;