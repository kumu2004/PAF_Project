package com.smartcampus.backend.module.user.controller;

import com.smartcampus.backend.common.dto.ApiResponse;
import com.smartcampus.backend.module.user.dto.CreateUserRequest;
import com.smartcampus.backend.module.user.dto.UpdateUserProfileRequest;
import com.smartcampus.backend.module.user.dto.UserProfileDto;
import com.smartcampus.backend.module.user.service.UserService;
import com.smartcampus.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for user profile management
 * Provides endpoints for CRUD operations on user profiles
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    private final UserService userService;
    
    /**
     * Get users by role (Admin only)
     * GET /api/users/role/{role}
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<java.util.List<UserProfileDto>>> getUsersByRole(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String role) {
        if (userDetails == null || !"ADMIN".equals(userDetails.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        try {
            com.smartcampus.backend.common.enums.UserRole userRole = com.smartcampus.backend.common.enums.UserRole.valueOf(role.toUpperCase());
            java.util.List<UserProfileDto> users = userService.getUsersByRole(userRole);
            log.info("Found {} users with role {}", users.size(), role);
            return ResponseEntity.ok(ApiResponse.success("Users with role " + role + " retrieved", users));
        } catch (IllegalArgumentException e) {
            log.error("Invalid role requested: {}", role);
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid role: " + role));
        }
    }

    /**
     * Get all users (Admin only)
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<UserProfileDto>>> getAllUsers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null || !"ADMIN".equals(userDetails.getRole())) {
            log.warn("Unauthorized access attempt to /api/users by non-admin");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        log.info("Admin {} fetching all users", userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("All users retrieved", userService.getAllUsers()));
    }

    /**
     * Get the currently authenticated user's profile
     * GET /api/users/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUserProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            log.warn("Unauthorized access attempt to /api/users/me");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        log.info("Fetching current user profile for email: {}", userDetails.getUsername());
        try {
            UserProfileDto userProfile = userService.getUserProfile(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Current profile retrieved", userProfile));
        } catch (RuntimeException e) {
            log.error("Error fetching current user profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get user profile by ID
     * GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserProfile(@PathVariable String id) {
        log.info("Fetching user profile for ID: {}", id);
        try {
            UserProfileDto userProfile = userService.getUserProfile(id);
            return ResponseEntity.ok(ApiResponse.success("User profile retrieved", userProfile));
        } catch (RuntimeException e) {
            log.error("Error fetching user profile: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create a new user with optional profile picture
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserProfileDto>> createUser(@ModelAttribute CreateUserRequest request) {
        log.info("Creating new user with email: {}", request.getEmail());
        try {
            UserProfileDto newUser = userService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User created successfully", newUser));
        } catch (RuntimeException e) {
            log.error("Error creating user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update user profile with optional profile picture upload
     * PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateUserProfile(
            @PathVariable String id,
            @ModelAttribute UpdateUserProfileRequest request) {
        log.info("Updating user profile for ID: {}", id);
        try {
            UserProfileDto updatedUser = userService.updateUserProfile(id, request);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
        } catch (RuntimeException e) {
            log.error("Error updating user profile: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete profile picture for a user
     * DELETE /api/users/{id}/picture
     */
    @DeleteMapping("/{id}/picture")
    public ResponseEntity<Void> deleteProfilePicture(@PathVariable String id) {
        log.info("Deleting profile picture for user ID: {}", id);
        try {
            userService.deleteProfilePicture(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            log.error("Error deleting profile picture: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
