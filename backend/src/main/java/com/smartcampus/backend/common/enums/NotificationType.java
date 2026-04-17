package com.smartcampus.backend.common.enums;

/**
 * Notification types used by the system.
 *
 * NOTE: This implementation is intentionally limited to user-management events
 * as requested (register/approve/enable/disable).
 */
public enum NotificationType {
    STUDENT_REGISTERED,
    USER_APPROVED,
    ACCOUNT_ENABLED,
    ACCOUNT_DISABLED,
    TICKET_UPDATED,
    BOOKING_UPDATED,

    // Admin-only (user management tab) events
    ADMIN_USER_MGMT,
    
    // Booking management events
    BOOKING_APPROVED,
    BOOKING_REJECTED,
    NEW_BOOKING_REQUEST
}

