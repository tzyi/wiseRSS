import React, { useState } from 'react';

const RightPanel = ({ article }) => {
  const [activeTab, setActiveTab] = useState('notebook');
  const [note, setNote] = useState('');
  const [highlights] = useState([
    {
      id: 1,
      text: 'We call someone who is not in control of their mind insane. What do we call someone who is not in control of their attention, which is the gateway to the mind?',
      color: 'yellow',
      timestamp: new Date(),
    },
    {
      id: 2,
      text: 'Your job as a notetaker is to preserve the notes you\'re taking on the things you discover in such a way that they can survive the journey into the future.',
      color: 'green',
      timestamp: new Date(),
    },
  ]);

  const tabs = [
    { id: 'info', label: 'Info', icon: 'fas fa-info-circle' },
    { id: 'notebook', label: 'Notebook', icon: 'fas fa-book' },
    { id: 'links', label: 'Links', icon: 'fas fa-link' },
  ];

  const handleSaveNote = () => {
    if (note.trim()) {
      // TODO: Implement save note functionality
      console.log('Saving note:', note);
      setNote('');
    }
  };

  const renderInfoTab = () => (
    <div className="space-y-4">
      {article ? (
        <>
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">標題</h4>
            <p className="text-white">{article.title}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">來源</h4>
            <p className="text-white">{article.feedTitle || article.source}</p>
          </div>
          
          {article.author && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">作者</h4>
              <p className="text-white">{article.author}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">發布時間</h4>
            <p className="text-white">
              {new Date(article.publishedAt).toLocaleString('zh-TW')}
            </p>
          </div>
          
          {article.tags && article.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-2">標籤</h4>
              <div className="flex flex-wrap gap-1">
                {article.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`tag tag-${
                      ['blue', 'green', 'purple', 'red', 'yellow'][index % 5]
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">原文連結</h4>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <i className="fas fa-external-link-alt mr-1"></i>
              查看原文
            </a>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <i className="fas fa-info-circle text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-400">選擇一篇文章查看詳細資訊</p>
        </div>
      )}
    </div>
  );

  const renderNotebookTab = () => (
    <div className="space-y-6">
      {/* Document Note */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          DOCUMENT NOTE
        </h4>
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="Add a document note..."
          />
          <button
            onClick={handleSaveNote}
            disabled={!note.trim()}
            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-save"></i>
            儲存筆記
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
          HIGHLIGHTS
        </h4>
        <div className="space-y-4">
          {highlights.length > 0 ? (
            highlights.map((highlight) => (
              <div key={highlight.id} className="p-4 bg-gray-700 rounded-lg">
                <p
                  className={`text-sm mb-2 ${
                    highlight.color === 'yellow'
                      ? 'text-yellow-300'
                      : highlight.color === 'green'
                      ? 'text-green-300'
                      : 'text-blue-300'
                  }`}
                >
                  "{highlight.text}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {highlight.timestamp.toLocaleDateString('zh-TW')}
                  </span>
                  <button className="text-gray-400 hover:text-red-400 transition-colors">
                    <i className="fas fa-trash text-xs"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <i className="fas fa-highlighter text-4xl text-gray-600 mb-4"></i>
              <p className="text-gray-400 text-sm">
                還沒有任何重點標記
              </p>
              <p className="text-gray-500 text-xs mt-1">
                在文章中選取文字來新增重點標記
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderLinksTab = () => (
    <div className="space-y-4">
      {article ? (
        <>
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">相關連結</h4>
            <div className="space-y-2">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <i className="fas fa-external-link-alt text-blue-400"></i>
                  <div>
                    <p className="text-white text-sm font-medium">原文連結</p>
                    <p className="text-gray-400 text-xs">{article.source}</p>
                  </div>
                </div>
              </a>
              
              {article.feedUrl && (
                <a
                  href={article.feedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-rss text-orange-400"></i>
                    <div>
                      <p className="text-white text-sm font-medium">RSS源</p>
                      <p className="text-gray-400 text-xs">{article.feedTitle}</p>
                    </div>
                  </div>
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">分享</h4>
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
                <i className="fab fa-twitter text-blue-400 mb-1"></i>
                <p className="text-xs text-gray-300">Twitter</p>
              </button>
              <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
                <i className="fab fa-facebook text-blue-500 mb-1"></i>
                <p className="text-xs text-gray-300">Facebook</p>
              </button>
              <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
                <i className="fas fa-link text-gray-400 mb-1"></i>
                <p className="text-xs text-gray-300">複製連結</p>
              </button>
              <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors text-center">
                <i className="fas fa-envelope text-green-400 mb-1"></i>
                <p className="text-xs text-gray-300">Email</p>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <i className="fas fa-link text-4xl text-gray-600 mb-4"></i>
          <p className="text-gray-400">選擇一篇文章查看相關連結</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
      {/* Tabs */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              <i className={`${tab.icon} mr-1`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'notebook' && renderNotebookTab()}
        {activeTab === 'links' && renderLinksTab()}
      </div>
    </div>
  );
};

export default RightPanel;