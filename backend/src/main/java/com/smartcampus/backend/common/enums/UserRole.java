package com.smartcampus.backend.common.enums;

/**
 * User roles in the Smart Campus system.
 *
 * USER - Students and staff members
 * ADMIN - Administrators who can manage resources, approve/reject bookings
 * TECHNICIAN - Technicians who can manage assigned tickets
 */
public enum UserRole {
    STUDENT,
    LECTURER,
    TECHNICIAN,
    ADMIN,

    // Pending states — used while awaiting admin approval
    PENDING_LECTURER,
    PENDING_TECHNICIAN
}
