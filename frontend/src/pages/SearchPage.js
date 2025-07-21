import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { articleService } from '../services/articleService';
import LoadingSpinner from '../components/LoadingSpinner';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'all');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update URL params when search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (searchType !== 'all') params.set('type', searchType);
    setSearchParams(params);
  }, [debouncedQuery, searchType, setSearchParams]);

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

  const searchFilters = [
    { key: 'all', label: '全部', icon: 'fas fa-newspaper' },
    { key: 'articles', label: '文章', icon: 'fas fa-file-alt' },
    { key: 'feeds', label: 'RSS源', icon: 'fas fa-rss' },
    { key: 'tags', label: '標籤', icon: 'fas fa-tags' },
  ];

  const popularSearches = [
    '人工智慧', '機器學習', '區塊鏈', '創業', '設計', 'React',
    'Vue.js', 'Python', 'JavaScript', '數據科學', '雲端運算', '物聯網'
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedQuery(searchQuery);
  };

  const handlePopularSearch = (term) => {
    setSearchQuery(term);
    setDebouncedQuery(term);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700 bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            <i className="fas fa-search mr-3 text-blue-500"></i>
            搜索功能
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-14 pr-4 py-4 text-lg"
                placeholder="搜索文章、RSS源、標籤..."
                autoFocus
              />
              <i className="fas fa-search absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"></i>
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </form>

          {/* Search Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            {searchFilters.map((filter) => (
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

          {/* Search Stats */}
          {debouncedQuery && searchResults && (
            <div className="text-sm text-gray-400">
              找到 <span className="text-white font-semibold">{searchResults.total || 0}</span> 個結果
              {searchResults.searchTime && (
                <span>，用時 <span className="text-white">{searchResults.searchTime}</span> 秒</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {isLoading && debouncedQuery && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-4 text-gray-400 text-lg">搜尋中...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
              <h3 className="text-xl font-semibold text-white mb-2">搜尋失敗</h3>
              <p className="text-gray-400">搜尋時發生錯誤，請稍後再試</p>
            </div>
          )}

          {/* No Query State */}
          {!debouncedQuery && (
            <div className="space-y-8">
              <div className="text-center py-8">
                <i className="fas fa-search text-6xl text-gray-600 mb-6"></i>
                <h2 className="text-2xl font-bold text-white mb-4">開始搜尋</h2>
                <p className="text-gray-400 text-lg">輸入關鍵字來搜尋文章、RSS源或標籤</p>
              </div>

              {/* Popular Searches */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">熱門搜尋</h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term) => (
                    <button
                      key={term}
                      onClick={() => handlePopularSearch(term)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full text-sm transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Tips */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">搜尋技巧</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">基本搜尋</h4>
                    <ul className="space-y-1 text-gray-400">
                      <li>• 輸入關鍵字搜尋相關內容</li>
                      <li>• 使用引號搜尋完整詞組</li>
                      <li>• 使用 + 號包含必要詞彙</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-300 mb-2">進階搜尋</h4>
                    <ul className="space-y-1 text-gray-400">
                      <li>• 使用篩選器縮小搜尋範圍</li>
                      <li>• 按日期或來源篩選結果</li>
                      <li>• 搜尋特定標籤或分類</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults && debouncedQuery && (
            <div className="space-y-4">
              {searchResults.results?.length === 0 ? (
                <div className="text-center py-12">
                  <i className="fas fa-search text-4xl text-gray-600 mb-4"></i>
                  <h3 className="text-xl font-semibold text-white mb-2">沒有找到結果</h3>
                  <p className="text-gray-400 mb-4">
                    沒有找到與 "<span className="text-white">{debouncedQuery}</span>" 相關的內容
                  </p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>建議：</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>檢查拼寫是否正確</li>
                      <li>嘗試使用不同的關鍵字</li>
                      <li>使用更通用的搜尋詞</li>
                      <li>調整搜尋篩選器</li>
                    </ul>
                  </div>
                </div>
              ) : (
                searchResults.results?.map((result, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-gray-750 hover:border-gray-600 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            result.type === 'article' ? 'bg-blue-600 text-white' :
                            result.type === 'feed' ? 'bg-green-600 text-white' :
                            'bg-purple-600 text-white'
                          }`}>
                            {result.type === 'article' ? '文章' :
                             result.type === 'feed' ? 'RSS源' : '標籤'}
                          </span>
                          {result.publishedAt && (
                            <span className="text-xs text-gray-400">
                              {new Date(result.publishedAt).toLocaleDateString('zh-TW')}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {result.title}
                        </h3>
                        
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {result.description || result.content}
                        </p>
                        
                        {result.source && (
                          <div className="flex items-center text-xs text-gray-400">
                            <i className="fas fa-globe mr-1"></i>
                            {result.source}
                          </div>
                        )}
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
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;