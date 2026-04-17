package com.smartcampus.backend.module.user.service;

import java.io.IOException;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.smartcampus.backend.module.user.dto.CreateUserRequest;
import com.smartcampus.backend.module.user.dto.UpdateUserProfileRequest;
import com.smartcampus.backend.module.user.dto.UserProfileDto;
import com.smartcampus.backend.module.user.entity.User;
import com.smartcampus.backend.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Service for user profile management
 * Handles user CRUD operations and profile picture uploads to Cloudinary
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final com.smartcampus.backend.common.service.CloudinaryService cloudinaryService;

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final String[] ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "webp"};

    /**
     * Get all profiles filtered by role
     */
    public java.util.List<UserProfileDto> getUsersByRole(com.smartcampus.backend.common.enums.UserRole role) {
        if (role == com.smartcampus.backend.common.enums.UserRole.TECHNICIAN) {
            return userRepository.findByRoleIn(java.util.List.of(
                    com.smartcampus.backend.common.enums.UserRole.TECHNICIAN,
                    com.smartcampus.backend.common.enums.UserRole.PENDING_TECHNICIAN)).stream()
                    .map(this::convertToDto)
                    .collect(java.util.stream.Collectors.toList());
        }
        return userRepository.findByRole(role).stream()
                .map(this::convertToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get all user profiles (Admin)
     */
    public java.util.List<UserProfileDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get user profile by ID
     */
    public UserProfileDto getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        return convertToDto(user);
    }

    /**
     * Update user profile with optional picture upload
     */
    public UserProfileDto updateUserProfile(String userId, UpdateUserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setCity(request.getCity());
        
        if (request.getTitle() != null) user.setTitle(request.getTitle());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());

        // Upload new profile picture if provided
        if (request.getProfilePicture() != null && !request.getProfilePicture().isEmpty()) {
            // Delete old picture if exists
            if (user.getProfilePictureUrl() != null) {
                cloudinaryService.deleteFileByUrl(user.getProfilePictureUrl());
            }
            String pictureUrl = cloudinaryService.uploadFile(request.getProfilePicture(), "profile-pictures");
            user.setProfilePictureUrl(pictureUrl);
        }

        user = userRepository.save(user);
        return convertToDto(user);
    }

    /**
     * Create a new user with optional profile picture
     */
    public UserProfileDto createUser(CreateUserRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with email: " + request.getEmail() + " already exists");
        }

        String pictureUrl = null;
        if (request.getProfilePicture() != null && !request.getProfilePicture().isEmpty()) {
            pictureUrl = cloudinaryService.uploadFile(request.getProfilePicture(), "profile-pictures");
        }

        User user = User.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .city(request.getCity())
                .role(request.getRole())
                .profilePictureUrl(pictureUrl)
                .build();

        user = userRepository.save(user);
        return convertToDto(user);
    }

    /**
     * Delete profile picture from Cloudinary
     */
    public void deleteProfilePicture(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (user.getProfilePictureUrl() != null && !user.getProfilePictureUrl().isEmpty()) {
            cloudinaryService.deleteFileByUrl(user.getProfilePictureUrl());
            user.setProfilePictureUrl(null);
            userRepository.save(user);
            log.info("Profile picture removed for user: {}", userId);
        }
    }

    /**
     * Validate uploaded file
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds maximum allowed size of 5MB");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new RuntimeException("Invalid file");
        }

        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        boolean isAllowed = false;
        for (String ext : ALLOWED_EXTENSIONS) {
            if (ext.equals(fileExtension)) {
                isAllowed = true;
                break;
            }
        }

        if (!isAllowed) {
            throw new RuntimeException("File type not allowed. Allowed types: jpg, jpeg, png, webp");
        }
    }

    /**
     * Extract public ID from Cloudinary URL
     */
    private String extractPublicId(String url) {
        // Extract from URL format: https://res.cloudinary.com/.../public_id
        String[] parts = url.split("/");
        String lastPart = parts[parts.length - 1];
        return lastPart.contains(".") ? lastPart.substring(0, lastPart.lastIndexOf(".")) : lastPart;
    }

    /**
     * Convert User entity to UserProfileDto
     */
    private UserProfileDto convertToDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .city(user.getCity())
                .profilePictureUrl(user.getProfilePictureUrl())
                .role(user.getRole())
                .title(user.getTitle())
                .gender(user.getGender())
                .studentId(user.getStudentId())
                .academicYear(user.getAcademicYear())
                .semester(user.getSemester())
                .faculty(user.getFaculty())
                .phoneNumber(user.getPhoneNumber())
                .lecturerPosition(user.getLecturerPosition())
                .technicianPosition(user.getTechnicianPosition())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}