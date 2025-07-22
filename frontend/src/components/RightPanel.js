import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { articleService } from '../services/articleService';

const RightPanel = ({ selectedArticle, onArticleUpdate }) => {
  const [activeTab, setActiveTab] = useState('notebook');
  const [note, setNote] = useState('');
  const queryClient = useQueryClient();

  const { data: notes = [] } = useQuery(
    ['notes', selectedArticle?.id],
    () => articleService.getNotes(selectedArticle.id),
    { enabled: !!selectedArticle }
  );

  const { data: highlights = [] } = useQuery(
    ['highlights', selectedArticle?.id],
    () => articleService.getHighlights(selectedArticle.id),
    { enabled: !!selectedArticle }
  );

  const addNoteMutation = useMutation(
    ({ articleId, note }) => articleService.addNote(articleId, note),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notes', selectedArticle?.id]);
        setNote('');
      }
    }
  );

  const handleAddNote = () => {
    if (note.trim() && selectedArticle) {
      addNoteMutation.mutate({
        articleId: selectedArticle.id,
        note: note.trim()
      });
    }
  };

  const tabs = [
    { id: 'info', label: 'Info', icon: 'fas fa-info-circle' },
    { id: 'notebook', label: 'Notebook', icon: 'fas fa-book' },
    { id: 'links', label: 'Links', icon: 'fas fa-link' }
  ];

  if (!selectedArticle) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-400">
          <i className="fas fa-mouse-pointer text-4xl mb-4"></i>
          <p>選擇一篇文章查看詳情</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Top Tabs */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
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

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Article Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                文章資訊
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">作者:</span>
                  <span className="text-white">{selectedArticle.author || '未知'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">發布時間:</span>
                  <span className="text-white">
                    {new Date(selectedArticle.published_at).toLocaleString('zh-TW')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">來源:</span>
                  <span className="text-white">{selectedArticle.feed_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">閱讀時間:</span>
                  <span className="text-white">{selectedArticle.read_time || '5'} 分鐘</span>
                </div>
              </div>
            </div>

            {/* Article Actions */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                操作
              </h3>
              <div className="space-y-2">
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left text-sm transition-colors">
                  <i className="fas fa-bookmark mr-2"></i>
                  {selectedArticle.is_bookmarked ? '取消收藏' : '加入收藏'}
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left text-sm transition-colors">
                  <i className="fas fa-share-alt mr-2"></i>
                  分享文章
                </button>
                <button className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left text-sm transition-colors">
                  <i className="fas fa-external-link-alt mr-2"></i>
                  開啟原文
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notebook' && (
          <div className="space-y-6">
            {/* Document Note */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                文檔筆記
              </h3>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
                placeholder="新增文檔筆記..."
              />
              <button
                onClick={handleAddNote}
                disabled={!note.trim() || addNoteMutation.isLoading}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
              >
                {addNoteMutation.isLoading ? '新增中...' : '新增筆記'}
              </button>
            </div>

            {/* Notes List */}
            {notes.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                  我的筆記
                </h3>
                <div className="space-y-3">
                  {notes.map((noteItem) => (
                    <div key={noteItem.id} className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm text-white mb-2">{noteItem.content}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(noteItem.created_at).toLocaleString('zh-TW')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                  重點標記
                </h3>
                <div className="space-y-4">
                  {highlights.map((highlight) => (
                    <div key={highlight.id} className="p-4 bg-gray-700 rounded-lg">
                      <p className="text-sm text-yellow-300 mb-2">
                        "{highlight.text}"
                      </p>
                      <span className="text-xs text-gray-400">重點標記</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default highlights for demo */}
            {highlights.length === 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                  重點標記
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p className="text-sm text-yellow-300 mb-2">
                      "人工智慧技術在過去一年中取得了重大突破，從自然語言處理到電腦視覺，各個領域都有顯著進展。"
                    </p>
                    <span className="text-xs text-gray-400">重點標記</span>
                  </div>
                  <div className="p-4 bg-gray-700 rounded-lg">
                    <p className="text-sm text-green-300 mb-2">
                      "建立一個可持續的商業模式是創業成功的關鍵因素。"
                    </p>
                    <span className="text-xs text-gray-400">重要筆記</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                相關連結
              </h3>
              <div className="space-y-3">
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">原文連結</span>
                    <i className="fas fa-external-link-alt text-gray-400"></i>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {selectedArticle.feed_name}
                  </p>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RightPanel;
