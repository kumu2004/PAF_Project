import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
});

// Attach JWT and User-Id to every request
apiClient.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();
  if (token) {
    const rawToken = typeof token === 'string' && token.startsWith('Bearer ')
      ? token.slice('Bearer '.length)
      : token;
    if (rawToken) {
      config.headers.Authorization = `Bearer ${rawToken}`;
    }
  }
  // Send user ID so backend can identify the caller without full JWT parsing
  const userId = user?.userId || user?.id;
  if (userId) {
    config.headers['X-User-Id'] = userId;
  }
  if (user?.role) {
    config.headers['X-User-Role'] = user.role;
  }
  return config;
});

// Auto-logout on 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
