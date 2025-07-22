import { api } from './authService';

export const articleService = {
  // Get articles
  getArticles: async (params = {}) => {
    const response = await api.get('/articles', { params });
    return response.data;
  },

  // Get single article
  getArticle: async (articleId) => {
    const response = await api.get(`/articles/${articleId}`);
    return response.data;
  },

  // Mark article as read
  markAsRead: async (articleId) => {
    const response = await api.put(`/articles/${articleId}/read`);
    return response.data;
  },

  // Mark article as unread
  markAsUnread: async (articleId) => {
    const response = await api.put(`/articles/${articleId}/unread`);
    return response.data;
  },

  // Add/remove bookmark
  toggleBookmark: async (articleId) => {
    const response = await api.put(`/articles/${articleId}/bookmark`);
    return response.data;
  },

  // Search articles
  searchArticles: async (query, filters = {}) => {
    const response = await api.get('/articles/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // Add note to article
  addNote: async (articleId, note) => {
    const response = await api.post(`/articles/${articleId}/notes`, { note });
    return response.data;
  },

  // Get article notes
  getNotes: async (articleId) => {
    const response = await api.get(`/articles/${articleId}/notes`);
    return response.data;
  },

  // Add highlight
  addHighlight: async (articleId, highlightData) => {
    const response = await api.post(`/articles/${articleId}/highlights`, highlightData);
    return response.data;
  },

  // Get highlights
  getHighlights: async (articleId) => {
    const response = await api.get(`/articles/${articleId}/highlights`);
    return response.data;
  },
};