import React, { useState } from 'react';
import { useQuery } from 'react-query';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';
import RightPanel from '../components/RightPanel';
import { articleService } from '../services/articleService';

const HomePage = () => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [filter, setFilter] = useState('LATER');

  const { data: articlesRaw = [], isLoading, error } = useQuery(
    ['articles', filter],
    () => articleService.getArticles({ status: filter.toLowerCase() }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  console.log('articlesRaw', articlesRaw);

  const articles = Array.isArray(articlesRaw)
    ? articlesRaw
    : Array.isArray(articlesRaw?.results)
      ? articlesRaw.results
      : [];

  const filterOptions = ['LATER', 'SHORTLIST', 'ARCHIVE'];

  const rightPanel = (
    <RightPanel 
      selectedArticle={selectedArticle}
      onArticleUpdate={() => {
        // Refresh articles if needed
      }}
    />
  );

  return (
    <Layout rightPanel={rightPanel}>
      {/* Top Toolbar */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Library</h1>
            <div className="flex space-x-2">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filter === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-400 hover:text-white flex items-center">
              <i className="fas fa-tags mr-2"></i>
              Manage tags
            </button>
            <button className="text-gray-400 hover:text-white flex items-center">
              <i className="fas fa-clock mr-2"></i>
              Last opened
            </button>
          </div>
        </div>
      </div>

      {/* Article List */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-2"></i>
              <p className="text-gray-400">載入文章中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-exclamation-triangle text-2xl text-red-400 mb-2"></i>
              <p className="text-red-400">載入文章失敗</p>
            </div>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-400 text-lg">暫無文章</p>
              <p className="text-gray-500 text-sm">新增一些 RSS Feed 來開始使用</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isSelected={selectedArticle?.id === article.id}
                onSelect={setSelectedArticle}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;