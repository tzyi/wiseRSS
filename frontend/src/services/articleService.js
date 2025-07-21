import api from './authService';

export const articleService = {
  // Get articles with pagination and filters
  getArticles: async (params = {}) => {
    const response = await api.get('/articles', { params });
    return response.data;
  },

  // Get single article by ID
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

  // Add article to favorites
  addToFavorites: async (articleId) => {
    const response = await api.post(`/articles/${articleId}/favorite`);
    return response.data;
  },

  // Remove article from favorites
  removeFromFavorites: async (articleId) => {
    const response = await api.delete(`/articles/${articleId}/favorite`);
    return response.data;
  },

  // Search articles
  searchArticles: async (query, filters = {}) => {
    const response = await api.get('/articles/search', {
      params: { q: query, ...filters },
    });
    return response.data;
  },

  // Get article statistics
  getArticleStats: async () => {
    const response = await api.get('/articles/stats');
    return response.data;
  },

  // Bulk mark as read
  bulkMarkAsRead: async (articleIds) => {
    const response = await api.put('/articles/bulk/read', {
      articleIds,
    });
    return response.data;
  },

  // Get articles by feed
  getArticlesByFeed: async (feedId, params = {}) => {
    const response = await api.get(`/feeds/${feedId}/articles`, { params });
    return response.data;
  },

  // Get articles by category/tag
  getArticlesByCategory: async (category, params = {}) => {
    const response = await api.get('/articles/category', {
      params: { category, ...params },
    });
    return response.data;
  },

  // Add note to article
  addNote: async (articleId, note) => {
    const response = await api.post(`/articles/${articleId}/notes`, { note });
    return response.data;
  },

  // Update note
  updateNote: async (articleId, noteId, note) => {
    const response = await api.put(`/articles/${articleId}/notes/${noteId}`, {
      note,
    });
    return response.data;
  },

  // Delete note
  deleteNote: async (articleId, noteId) => {
    const response = await api.delete(`/articles/${articleId}/notes/${noteId}`);
    return response.data;
  },

  // Add highlight to article
  addHighlight: async (articleId, highlight) => {
    const response = await api.post(`/articles/${articleId}/highlights`, {
      highlight,
    });
    return response.data;
  },

  // Delete highlight
  deleteHighlight: async (articleId, highlightId) => {
    const response = await api.delete(
      `/articles/${articleId}/highlights/${highlightId}`
    );
    return response.data;
  },
};