package com.smartcampus.backend.module.user.dto;

import com.smartcampus.backend.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Data Transfer Object for User Profile (GET response)
 * Used to send user profile data to the frontend
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {

    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String city;
    private String profilePictureUrl;
    private UserRole role;

    private String title;
    private String gender;

    // Role-specific fields
    private String studentId;
    private String academicYear;
    private String semester;
    private String faculty;
    private String phoneNumber;
    
    private String lecturerPosition;
    private String technicianPosition;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
