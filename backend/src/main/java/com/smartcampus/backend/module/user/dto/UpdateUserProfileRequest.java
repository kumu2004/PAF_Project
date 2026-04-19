package com.smartcampus.backend.module.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating user profile
 * Accepts multipart form data with optional profile picture file
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserProfileRequest {

    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;

    @Size(max = 30, message = "City must not exceed 30 characters")
    private String city;

    private String title;
    private String gender;
    private String phoneNumber;

    // Optional: user can upload a new profile picture or leave it null to keep existing
    private MultipartFile profilePicture;
}
