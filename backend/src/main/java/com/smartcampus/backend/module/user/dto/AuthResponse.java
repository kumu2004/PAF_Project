package com.smartcampus.backend.module.user.dto;

import com.smartcampus.backend.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response body returned after successful register or login.
 * Contains the JWT token and basic user info so the frontend
 * doesn't need to make a second API call to get the user's profile.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    @Builder.Default
    private String tokenType = "Bearer";

    private String userId;
    private String firstName;
    private String lastName;
    private String email;
    private UserRole role;
    private String profilePictureUrl;
}
