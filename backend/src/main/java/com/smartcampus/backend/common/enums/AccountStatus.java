package com.smartcampus.backend.common.enums;

/**
 * Account status in the Smart Campus system.
 */
public enum AccountStatus {
    ACTIVE,     // Can log in
    PENDING,    // Awaiting admin approval (lecturer/technician only)
    REJECTED,   // Admin rejected the registration
    SUSPENDED   // Admin suspended the account
}
