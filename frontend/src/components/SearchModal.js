import React, { useState, useEffect } from 'react';
import { articleService } from '../services/articleService';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.getElementById('searchInput')?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await articleService.searchArticles(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="modal-content rounded-2xl p-8 w-full max-w-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">搜尋電子報</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              id="searchInput"
              className="input-field w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 pl-12"
              placeholder="輸入關鍵字搜尋電子報..."
              value={searchQuery}
              onChange={handleInputChange}
            />
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400"></i>
              <p className="text-gray-400 mt-2">搜尋中...</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((article) => (
              <div
                key={article.id}
                className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={() => {
                  // Handle article selection
                  onClose();
                }}
              >
                <h4 className="font-medium text-white mb-1">{article.title}</h4>
                <p className="text-sm text-gray-400 mb-2 line-clamp-2">{article.summary}</p>
                <div className="flex items-center text-xs text-gray-500 space-x-4">
                  <span>{article.feed_name}</span>
                  <span>{new Date(article.published_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : searchQuery ? (
            <div className="text-center py-8">
              <p className="text-gray-400">未找到相關結果</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600">
                <h4 className="font-medium text-white">TechCrunch Newsletter</h4>
                <p className="text-sm text-gray-400">最新科技新聞和創業資訊</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600">
                <h4 className="font-medium text-white">Harvard Business Review</h4>
                <p className="text-sm text-gray-400">商業管理和策略分析</p>
              </div>
              <div className="p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600">
                <h4 className="font-medium text-white">Design Weekly</h4>
                <p className="text-sm text-gray-400">設計趨勢和創意靈感</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;