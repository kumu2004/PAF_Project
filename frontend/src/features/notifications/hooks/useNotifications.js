import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import {
  fetchUnreadCount,
  fetchUnreadNotifications,
  markNotificationRead,
} from '../services/notificationService';

/**
 * Fetches the unread notification count for the current user (polls every 30s).
 * Admin users get the admin broadcast count; other users get their personal count.
 */
export function useUnreadCount() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['notifications', 'unreadCount', isAdmin],
    queryFn: () => fetchUnreadCount({ isAdmin }),
    refetchInterval: 30_000,
    enabled: !!user,
  });
}

/**
 * Fetches a limited list of unread notifications (only when the dropdown is open).
 */
export function useUnreadNotifications(enabled = false) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';

  return useQuery({
    queryKey: ['notifications', 'unreadList', isAdmin],
    queryFn: () => fetchUnreadNotifications({ isAdmin, limit: 6 }),
    enabled: enabled && !!user,
  });
}

/**
 * Returns a mutation to mark a single notification as read.
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
