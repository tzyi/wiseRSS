import React, { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import { feedService } from '../services/feedService';

const AddFeedModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
    tags: [],
    is_active: true,
    auto_update: true,
    custom_tag: ''
  });

  const [errors, setErrors] = useState({});

  const addFeedMutation = useMutation(
    (feedData) => feedService.addFeed(feedData),
    {
      onSuccess: (data) => {
        onSuccess();
        onClose();
        setFormData({
          title: '',
          url: '',
          description: '',
          category: '',
          tags: [],
          is_active: true,
          auto_update: true,
          custom_tag: ''
        });
        setErrors({});
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.error || 'Failed to add feed';
        setErrors({ general: errorMessage });
      }
    }
  );

  const predefinedTags = ['科技', '商業', '設計', 'AI', '新聞', '生活'];

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCustomTagAdd = () => {
    const customTag = formData.custom_tag.trim();
    if (customTag && !formData.tags.includes(customTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag],
        custom_tag: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = '請輸入 Feed 名稱';
    }
    if (!formData.url.trim()) {
      newErrors.url = '請輸入 RSS URL';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = '請輸入有效的 URL';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare data for submission
    const submitData = {
      title: formData.title.trim(),
      url: formData.url.trim(),
      description: formData.description.trim(),
      category: formData.category || null,
      tags: formData.tags.length > 0 ? formData.tags : null,
      is_active: formData.is_active,
      auto_update: formData.auto_update
    };

    addFeedMutation.mutate(submitData);
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="modal-content rounded-2xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">新增 RSS Feed</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
            disabled={addFeedMutation.isLoading}
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg text-red-200 text-sm">
            {errors.general}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* RSS URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              RSS URL *
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              className={`input-field w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 ${
                errors.url ? 'border-red-500' : ''
              }`}
              placeholder="https://example.com/rss"
              disabled={addFeedMutation.isLoading}
            />
            {errors.url && <p className="text-red-400 text-sm mt-1">{errors.url}</p>}
          </div>

          {/* Feed Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Feed 名稱 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`input-field w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 ${
                errors.title ? 'border-red-500' : ''
              }`}
              placeholder="輸入 Feed 名稱"
              disabled={addFeedMutation.isLoading}
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              描述
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input-field w-full px-4 py-3 rounded-lg text-white placeholder-gray-400 h-24 resize-none"
              placeholder="輸入 Feed 描述"
              disabled={addFeedMutation.isLoading}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              分類
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input-field w-full px-4 py-3 rounded-lg text-white"
              disabled={addFeedMutation.isLoading}
            >
              <option value="">選擇分類</option>
              <option value="科技">科技</option>
              <option value="商業">商業</option>
              <option value="設計">設計</option>
              <option value="AI">AI</option>
              <option value="新聞">新聞</option>
              <option value="生活">生活</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              標籤
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {predefinedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    formData.tags.includes(tag)
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                  disabled={addFeedMutation.isLoading}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                name="custom_tag"
                value={formData.custom_tag}
                onChange={handleInputChange}
                className="input-field flex-1 px-4 py-2 rounded-lg text-white placeholder-gray-400"
                placeholder="或輸入自定義標籤"
                disabled={addFeedMutation.isLoading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCustomTagAdd();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleCustomTagAdd}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                disabled={addFeedMutation.isLoading || !formData.custom_tag.trim()}
              >
                新增
              </button>
            </div>

            {/* Selected tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-sm flex items-center space-x-1"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className="hover:text-gray-300"
                      disabled={addFeedMutation.isLoading}
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                disabled={addFeedMutation.isLoading}
              />
              <span className="ml-2 text-sm text-gray-300">立即啟用</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="auto_update"
                checked={formData.auto_update}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                disabled={addFeedMutation.isLoading}
              />
              <span className="ml-2 text-sm text-gray-300">自動更新</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={addFeedMutation.isLoading}
              className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {addFeedMutation.isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  新增中...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>
                  新增 Feed
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={addFeedMutation.isLoading}
              className="flex-1 py-3 px-4 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFeedModal;