import apiClient from '../../../services/apiClient';

export async function fetchUnreadCount({ isAdmin }) {
  const url = isAdmin ? '/api/notifications/admin/unread-count' : '/api/notifications/unread-count';
  const res = await apiClient.get(url);
  // backend ApiResponse<Long> (or long)
  return res.data?.data ?? res.data;
}

export async function fetchUnreadNotifications({ isAdmin, limit = 6 }) {
  const url = isAdmin
    ? `/api/notifications/admin?unreadOnly=true&limit=${limit}`
    : `/api/notifications?unreadOnly=true&limit=${limit}`;
  const res = await apiClient.get(url);
  return res.data?.data ?? res.data;
}

export async function fetchAllNotifications({ isAdmin, limit = 100 }) {
  const url = isAdmin
    ? `/api/notifications/admin?unreadOnly=false&limit=${limit}`
    : `/api/notifications?unreadOnly=false&limit=${limit}`;
  const res = await apiClient.get(url);
  return res.data?.data ?? res.data;
}

export async function markNotificationRead(notificationId) {
  const res = await apiClient.patch(`/api/notifications/${notificationId}/read`);
  return res.data?.data ?? res.data;
}

