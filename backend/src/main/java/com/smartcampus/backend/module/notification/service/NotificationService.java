package com.smartcampus.backend.module.notification.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.smartcampus.backend.common.enums.NotificationType;
import com.smartcampus.backend.module.notification.entity.Notification;
import com.smartcampus.backend.module.notification.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Admin broadcast for user-management notifications (requested scope).
     */
    public void notifyAdmin(String message) {
        try {
            log.info("Admin Notification: {}", message);
            Notification n = Notification.builder()
                    .userId(null)
                    .audienceRole("ADMIN")
                    .type(NotificationType.ADMIN_USER_MGMT.name())
                    .title("User management")
                    .message(message)
                    .actionPath("/admin/notifications")
                    .readAt(null)
                    .build();
            Notification saved = notificationRepository.save(n);
            log.info("Admin notification saved successfully with ID: {}", saved.getId());
        } catch (Exception e) {
            log.error("Error creating admin notification", e);
        }
    }

    /**
     * Admin notification for new booking requests with navigation to bookings tab.
     */
    public void notifyAdminNewBooking(String resourceName, String userName) {
        try {
            log.info("Creating New Booking Notification for Admin: Resource={}, User={}", resourceName, userName);
            Notification n = Notification.builder()
                    .userId(null)
                    .audienceRole("ADMIN")
                    .type(NotificationType.NEW_BOOKING_REQUEST.name())
                    .title("New Booking Request")
                    .message(userName + " has requested to book " + resourceName)
                    .actionPath("/admin/bookings")
                    .readAt(null)
                    .build();
            Notification saved = notificationRepository.save(n);
            log.info("New Booking Notification saved successfully with ID: {}", saved.getId());
        } catch (Exception e) {
            log.error("Error creating new booking notification for admin", e);
        }
    }

    public Notification notifyUser(String userId, NotificationType type, String title, String message, String actionPath) {
        try {
            log.info("Creating notification for user: userId={}, type={}, title={}", userId, type, title);
            Notification n = Notification.builder()
                    .userId(userId)
                    .audienceRole(null)
                    .type(type.name())
                    .title(title)
                    .message(message)
                    .actionPath(actionPath)
                    .readAt(null)
                    .build();
            Notification saved = notificationRepository.save(n);
            log.info("User notification created successfully with ID: {}", saved.getId());
            return saved;
        } catch (Exception e) {
            log.error("Error creating notification for user: {}", userId, e);
            throw new RuntimeException("Failed to create notification", e);
        }
    }



    public List<Notification> getNotificationsForUser(String userId, boolean unreadOnly, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        var pageable = PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (unreadOnly) {
            return notificationRepository.findByUserIdAndReadAtIsNull(userId, pageable);
        }
        return notificationRepository.findByUserId(userId, pageable);
    }

    public List<Notification> getAdminBroadcastNotifications(boolean unreadOnly, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 200));
        var pageable = PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (unreadOnly) {
            return notificationRepository.findByAudienceRoleAndReadAtIsNull("ADMIN", pageable);
        }
        return notificationRepository.findByAudienceRole("ADMIN", pageable);
    }

    public long countUnreadForUser(String userId) {
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    public long countUnreadAdminBroadcast() {
        return notificationRepository.countByAudienceRoleAndReadAtIsNull("ADMIN");
    }

    public void markRead(String userId, String notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found."));
        if (n.getUserId() != null && !userId.equals(n.getUserId())) {
            throw new RuntimeException("Not allowed.");
        }
        if (n.getReadAt() == null) {
            n.setReadAt(LocalDateTime.now());
            notificationRepository.save(n);
        }
    }

    /**
     * Notifies a technician when they are assigned to a ticket.
     */
    public void createTicketAssignedNotification(String technicianId, String ticketTitle, String ticketId) {
        notifyUser(
                technicianId,
                NotificationType.TICKET_UPDATED,
                "Ticket Assigned",
                "You have been assigned to ticket: " + ticketTitle,
                "/technician/tickets/" + ticketId
        );
    }
}


