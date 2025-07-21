import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { articleService } from '../services/articleService';
import { feedService } from '../services/feedService';
import LoadingSpinner from './LoadingSpinner';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery(
    ['search', debouncedQuery, searchType],
    () => articleService.searchArticles(debouncedQuery, { type: searchType }),
    {
      enabled: debouncedQuery.length > 0,
    }
  );

  const handleClose = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content p-8 w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">搜尋電子報</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input w-full pl-12"
              placeholder="輸入關鍵字搜尋電子報..."
              autoFocus
            />
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        {/* Search Filters */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: '全部', icon: 'fas fa-newspaper' },
              { key: 'articles', label: '文章', icon: 'fas fa-file-alt' },
              { key: 'feeds', label: 'RSS源', icon: 'fas fa-rss' },
              { key: 'tags', label: '標籤', icon: 'fas fa-tags' },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSearchType(filter.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchType === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <i className={`${filter.icon} mr-1`}></i>
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading && debouncedQuery && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-2 text-gray-400">搜尋中...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-2"></i>
              <p className="text-gray-400">搜尋時發生錯誤，請稍後再試</p>
            </div>
          )}

          {!debouncedQuery && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white mb-4">
                推薦電子報
              </h3>
              {[
                {
                  title: 'TechCrunch Newsletter',
                  description: '最新科技新聞和創業資訊',
                  type: 'feed',
                },
                {
                  title: 'Harvard Business Review',
                  description: '商業管理和策略分析',
                  type: 'feed',
                },
                {
                  title: 'Design Weekly',
                  description: '設計趨勢和創意靈感',
                  type: 'feed',
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                >
                  <h4 className="font-medium text-white">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              ))}
            </div>
          )}

          {searchResults && debouncedQuery && (
            <div className="space-y-3">
              <div className="text-sm text-gray-400 mb-4">
                找到 <span className="text-white font-semibold">{searchResults.total || 0}</span> 個結果
              </div>
              
              {searchResults.results?.map((result, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-1">
                        {result.title}
                      </h4>
                      <p className="text-sm text-gray-400 mb-2">
                        {result.description || result.content}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded ${
                          result.type === 'article' ? 'bg-blue-600' :
                          result.type === 'feed' ? 'bg-green-600' :
                          'bg-purple-600'
                        } text-white`}>
                          {result.type === 'article' ? '文章' :
                           result.type === 'feed' ? 'RSS源' : '標籤'}
                        </span>
                        {result.source && <span>{result.source}</span>}
                        {result.publishedAt && (
                          <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button className="text-gray-400 hover:text-yellow-400 transition-colors">
                        <i className="fas fa-star"></i>
                      </button>
                      <button className="text-gray-400 hover:text-blue-400 transition-colors">
                        <i className="fas fa-external-link-alt"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {searchResults.results?.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-search text-gray-600 text-2xl mb-2"></i>
                  <p className="text-gray-400">沒有找到相關結果</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Suggestions */}
        {!debouncedQuery && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              熱門搜尋
            </h3>
            <div className="flex flex-wrap gap-2">
              {['人工智慧', '機器學習', '區塊鏈', '創業', '設計', 'React'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full text-sm transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;