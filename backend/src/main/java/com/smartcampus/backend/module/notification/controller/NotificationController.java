package com.smartcampus.backend.module.notification.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.backend.common.dto.ApiResponse;
import com.smartcampus.backend.module.notification.dto.NotificationDto;
import com.smartcampus.backend.module.notification.entity.Notification;
import com.smartcampus.backend.module.notification.service.NotificationService;
import com.smartcampus.backend.security.CustomUserDetails;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> listMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(value = "unreadOnly", defaultValue = "false") boolean unreadOnly,
            @RequestParam(value = "limit", defaultValue = "50") int limit
    ) {
        List<Notification> items = notificationService.getNotificationsForUser(userDetails.getId(), unreadOnly, limit);
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched", items.stream().map(this::toDto).toList()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> unreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.countUnreadForUser(userDetails.getId())));
    }

    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String notificationId
    ) {
        notificationService.markRead(userDetails.getId(), notificationId);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    // ── Admin broadcast (user management tab) ────────────────────────────────

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<NotificationDto>>> listAdminBroadcast(
            @RequestParam(value = "unreadOnly", defaultValue = "false") boolean unreadOnly,
            @RequestParam(value = "limit", defaultValue = "50") int limit
    ) {
        List<Notification> items = notificationService.getAdminBroadcastNotifications(unreadOnly, limit);
        return ResponseEntity.ok(ApiResponse.success("Admin notifications fetched", items.stream().map(this::toDto).toList()));
    }

    @GetMapping("/admin/unread-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> adminUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(notificationService.countUnreadAdminBroadcast()));
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .type(n.getType())
                .title(n.getTitle())
                .message(n.getMessage())
                .actionPath(n.getActionPath())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .build();
    }
}

