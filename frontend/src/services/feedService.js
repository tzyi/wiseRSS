import { api } from './authService';

export const feedService = {
  // Get all feeds
  getFeeds: async (params = {}) => {
    const response = await api.get('/feeds', { params });
    return response.data;
  },

  // Get single feed
  getFeed: async (feedId) => {
    const response = await api.get(`/feeds/${feedId}`);
    return response.data;
  },

  // Add new feed
  addFeed: async (feedData) => {
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

  // Refresh feed
  refreshFeed: async (feedId) => {
    const response = await api.post(`/feeds/${feedId}/refresh`);
    return response.data;
  },

  // Get feed statistics
  getFeedStats: async () => {
    const response = await api.get('/feeds/stats');
    return response.data;
  },
};