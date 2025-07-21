import api from './authService';

export const feedService = {
  // Get all feeds for current user
  getFeeds: async (params = {}) => {
    const response = await api.get('/feeds', { params });
    return response.data;
  },

  // Get single feed by ID
  getFeed: async (feedId) => {
    const response = await api.get(`/feeds/${feedId}`);
    return response.data;
  },

  // Create new feed
  createFeed: async (feedData) => {
    const response = await api.post('/feeds', feedData);
    return response.data;
  },

  // Update feed
  updateFeed: async (feedId, feedData) => {
    const response = await api.put(`/feeds/${feedId}`, feedData);
    return response.data;
  },

  // Delete feed
  deleteFeed: async (feedId) => {
    const response = await api.delete(`/feeds/${feedId}`);
    return response.data;
  },

  // Refresh feed (fetch new articles)
  refreshFeed: async (feedId) => {
    const response = await api.post(`/feeds/${feedId}/refresh`);
    return response.data;
  },

  // Get feed statistics
  getFeedStats: async () => {
    const response = await api.get('/feeds/stats');
    return response.data;
  },

  // Validate RSS URL
  validateRssUrl: async (url) => {
    const response = await api.post('/feeds/validate', { url });
    return response.data;
  },

  // Get feed categories/tags
  getCategories: async () => {
    const response = await api.get('/feeds/categories');
    return response.data;
  },

  // Bulk operations
  bulkUpdateFeeds: async (feedIds, updateData) => {
    const response = await api.put('/feeds/bulk', {
      feedIds,
      updateData,
    });
    return response.data;
  },

  bulkDeleteFeeds: async (feedIds) => {
    const response = await api.delete('/feeds/bulk', {
      data: { feedIds },
    });
    return response.data;
  },
};