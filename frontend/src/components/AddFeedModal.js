import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { feedService } from '../services/feedService';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const AddFeedModal = ({ isOpen, onClose, onSuccess }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm();

  const createFeedMutation = useMutation(feedService.createFeed, {
    onSuccess: (data) => {
      toast.success('RSS源添加成功！');
      reset();
      setSelectedTags([]);
      setValidationResult(null);
      onSuccess?.(data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '添加失敗，請稍後再試');
    },
  });

  const watchedUrl = watch('url');

  const validateRssUrl = async () => {
    if (!watchedUrl) {
      toast.error('請先輸入RSS URL');
      return;
    }

    setIsValidating(true);
    try {
      const result = await feedService.validateRssUrl(watchedUrl);
      setValidationResult(result);
      
      if (result.isValid) {
        // Auto-fill form with validated data
        setValue('title', result.title || '');
        setValue('description', result.description || '');
        toast.success('RSS源驗證成功！');
      } else {
        toast.error(result.error || 'RSS源驗證失敗');
      }
    } catch (error) {
      toast.error('驗證失敗，請檢查URL是否正確');
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  const predefinedTags = [
    { name: '科技', color: 'blue' },
    { name: '商業', color: 'green' },
    { name: '設計', color: 'red' },
    { name: 'AI', color: 'purple' },
    { name: '新聞', color: 'yellow' },
    { name: '創業', color: 'indigo' },
    { name: '程式設計', color: 'pink' },
    { name: '行銷', color: 'orange' },
  ];

  const toggleTag = (tagName) => {
    setSelectedTags(prev => 
      prev.includes(tagName)
        ? prev.filter(tag => tag !== tagName)
        : [...prev, tagName]
    );
  };

  const onSubmit = async (data) => {
    const feedData = {
      ...data,
      tags: selectedTags,
      isActive: data.isActive || false,
      autoUpdate: data.autoUpdate || false,
    };

    createFeedMutation.mutate(feedData);
  };

  const handleClose = () => {
    reset();
    setSelectedTags([]);
    setValidationResult(null);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-content p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">新增 RSS Feed</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* RSS URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              RSS URL *
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                {...register('url', {
                  required: '請輸入RSS URL',
                  pattern: {
                    value: /^https?:\/\/.+/,
                    message: '請輸入有效的URL',
                  },
                })}
                className="input flex-1"
                placeholder="https://example.com/rss"
              />
              <button
                type="button"
                onClick={validateRssUrl}
                disabled={isValidating || !watchedUrl}
                className="btn btn-secondary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <i className="fas fa-check"></i>
                )}
              </button>
            </div>
            {errors.url && (
              <p className="text-red-400 text-sm mt-1">{errors.url.message}</p>
            )}
            
            {/* Validation Result */}
            {validationResult && (
              <div className={`mt-2 p-3 rounded-lg ${
                validationResult.isValid 
                  ? 'bg-green-900/20 border border-green-700' 
                  : 'bg-red-900/20 border border-red-700'
              }`}>
                <div className={`flex items-center text-sm ${
                  validationResult.isValid ? 'text-green-400' : 'text-red-400'
                }`}>
                  <i className={`fas ${
                    validationResult.isValid ? 'fa-check-circle' : 'fa-exclamation-triangle'
                  } mr-2`}></i>
                  {validationResult.isValid ? 'RSS源驗證成功' : '驗證失敗'}
                </div>
                {validationResult.message && (
                  <p className="text-xs mt-1 text-gray-300">
                    {validationResult.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Feed Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Feed 名稱 *
            </label>
            <input
              type="text"
              {...register('title', {
                required: '請輸入Feed名稱',
                minLength: {
                  value: 2,
                  message: '名稱至少需要2個字符',
                },
              })}
              className="input w-full"
              placeholder="輸入 Feed 名稱"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              描述
            </label>
            <textarea
              {...register('description')}
              className="input w-full h-24 resize-none"
              placeholder="輸入 Feed 描述"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              分類
            </label>
            <select
              {...register('category')}
              className="input w-full"
            >
              <option value="">選擇分類</option>
              <option value="tech">科技</option>
              <option value="business">商業</option>
              <option value="design">設計</option>
              <option value="news">新聞</option>
              <option value="science">科學</option>
              <option value="entertainment">娛樂</option>
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
                  key={tag.name}
                  type="button"
                  onClick={() => toggleTag(tag.name)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag.name)
                      ? `bg-${tag.color}-600 text-white`
                      : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="input w-full"
              placeholder="或輸入自定義標籤（按Enter添加）"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = e.target.value.trim();
                  if (value && !selectedTags.includes(value)) {
                    setSelectedTags(prev => [...prev, value]);
                    e.target.value = '';
                  }
                }
              }}
            />
            {selectedTags.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">已選擇的標籤：</p>
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="ml-1 hover:text-red-300"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Update Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              更新頻率
            </label>
            <select
              {...register('updateFrequency')}
              className="input w-full"
            >
              <option value="auto">自動檢測</option>
              <option value="hourly">每小時</option>
              <option value="daily">每天</option>
              <option value="weekly">每週</option>
              <option value="manual">手動</option>
            </select>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isActive')}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-300">立即啟用</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('autoUpdate')}
                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-300">自動更新</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('notifications')}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-300">新文章通知</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={createFeedMutation.isLoading}
              className="btn-success flex-1 py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createFeedMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  新增中...
                </>
              ) : (
                <>
                  <i className="fas fa-plus"></i>
                  新增 Feed
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary flex-1 py-3 font-medium"
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