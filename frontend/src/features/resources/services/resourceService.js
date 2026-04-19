import apiClient from '../../../services/apiClient';

const unwrapResponse = (responseData) => {
  if (!responseData) return responseData;
  if (Array.isArray(responseData)) return responseData;

  // Supports PageResponse directly: { content, totalElements, ... }
  if (responseData.content && Array.isArray(responseData.content)) {
    return responseData;
  }

  // Supports wrapped form: { data: ... }
  if (responseData.data) {
    return unwrapResponse(responseData.data);
  }

  return responseData;
};

export const resourceService = {
  getAllResources: async (filters = {}) => {
    const { page = 0, size = 10, type, status, location, capacity, search } = filters;
    const params = new URLSearchParams();

    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (location) params.append('location', location);
    if (capacity) params.append('capacity', capacity);
    if (search) params.append('search', search);
    params.append('page', String(page));
    params.append('size', String(size));

    const response = await apiClient.get(`/api/resources?${params.toString()}`);
    return unwrapResponse(response.data);
  },

  getResourceById: async (id) => {
    const response = await apiClient.get(`/api/resources/${id}`);
    return unwrapResponse(response.data);
  },

  createResource: async (resourceData) => {
    const response = await apiClient.post('/api/resources', resourceData);
    return unwrapResponse(response.data);
  },

  updateResource: async (id, resourceData) => {
    const response = await apiClient.put(`/api/resources/${id}`, resourceData);
    return unwrapResponse(response.data);
  },

  updateResourceStatus: async (id, status) => {
    const response = await apiClient.patch(`/api/resources/${id}/status`, { status });
    return unwrapResponse(response.data);
  },

  deleteResource: async (id) => {
    await apiClient.delete(`/api/resources/${id}`);
  },

  checkAvailability: async (id, from, to) => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const response = await apiClient.get(`/api/resources/${id}/availability?${params.toString()}`);
    return unwrapResponse(response.data);
  },

  getResourceTypes: async () => {
    const response = await apiClient.get('/api/resources/types');
    return unwrapResponse(response.data);
  },
  
  uploadResourceFile: async (file, folder = 'resources') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await apiClient.post('/api/resources/upload', formData, {
      headers: {
        'Content-Type': undefined, // Tell Axios to let the browser set the boundary
      },
    });
    return unwrapResponse(response.data);
  },
};
