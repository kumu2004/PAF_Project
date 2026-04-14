package com.smartcampus.backend.module.user.entity;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.smartcampus.backend.common.BaseDocument;
import com.smartcampus.backend.common.enums.AccountStatus;
import com.smartcampus.backend.common.enums.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * User document representing a student, staff member, admin, or technician.
 * Stored in MongoDB collection: "users"
 *
 * Authentication modes supported:
 *  1. Google OAuth — googleId is set, password is null
 *  2. Email + Password — password is set (bcrypt hashed), googleId is null
 */
@Document(collection = "users")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseDocument {

    @Indexed(unique = true)
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;

    private String title;           // Mr., Mrs., Ms., Dr., Prof.
    private String gender;          // Male, Female, Prefer not to say

    @Size(max = 30, message = "City must not exceed 30 characters")
    private String city;

    private String profilePictureUrl;

    @NotNull(message = "Role is required")
    private UserRole role;

    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;

    /** Set for Google OAuth users. Null for email/password users. */
    private String googleId;

    /**
     * BCrypt-hashed password. Only set for email/password users.
     * Null for users who registered via Google OAuth.
     */
    private String password;

    /**
     * Whether this account is active. Defaults to true.
     * Required by Spring Security's CustomUserDetails.
     */
    @Builder.Default
    private boolean active = true;

    // -- Role-specific fields --
    private String studentId;       // e.g. "it23263826"
    private String academicYear;
    private String semester;
    private String faculty;
    private String phoneNumber;

    private String lecturerPosition; // Assistant Lecturer, Senior Lecturer, etc.
    private String technicianPosition; // IT Support, Electrician, etc.

    // -- Admin approval tracking --
    private String approvedByAdminId;
    private String rejectionReason;

    // id, createdAt, updatedAt are inherited from BaseDocument
}
