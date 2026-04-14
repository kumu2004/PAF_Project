package com.smartcampus.backend.module.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminUserDto {
    private String id;
    private String title;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String faculty;
    private String role;
    private String status;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

