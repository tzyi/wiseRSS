import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { articleService } from '../services/articleService';
import LoadingSpinner from '../components/LoadingSpinner';
import ArticleCard from '../components/ArticleCard';
import RightPanel from '../components/RightPanel';

const HomePage = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [filter, setFilter] = useState('all');

  const {
    data: articles,
    isLoading,
    error,
    refetch,
  } = useQuery(['articles', filter], () =>
    articleService.getArticles({ filter })
  );

  const handleArticleSelect = (article) => {
    setSelectedArticle(article);
    // Mark as read when selected
    if (!article.isRead) {
      articleService.markAsRead(article.id);
    }
  };

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
          <p className="text-gray-400 mb-4">無法載入文章，請稍後再試</p>
          <button
            onClick={() => refetch()}
            className="btn-primary"
          >
            <i className="fas fa-redo"></i>
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Library</h1>
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('later')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'later'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  LATER
                </button>
                <button
                  onClick={() => setFilter('shortlist')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'shortlist'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  SHORTLIST
                </button>
                <button
                  onClick={() => setFilter('archive')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filter === 'archive'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  ARCHIVE
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors">
                <i className="fas fa-tags mr-2"></i>
                Manage tags
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <i className="fas fa-clock mr-2"></i>
                Last opened
              </button>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="flex-1 overflow-y-auto p-6">
          {articles?.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-newspaper text-4xl text-gray-600 mb-4"></i>
              <h3 className="text-xl font-semibold text-white mb-2">
                沒有文章
              </h3>
              <p className="text-gray-400">
                {filter === 'all' 
                  ? '還沒有任何文章，請先添加一些RSS源'
                  : `在${filter}分類中沒有文章`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles?.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  isSelected={selectedArticle?.id === article.id}
                  onSelect={() => handleArticleSelect(article)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <RightPanel article={selectedArticle} />
    </div>
  );
};

export default HomePage;