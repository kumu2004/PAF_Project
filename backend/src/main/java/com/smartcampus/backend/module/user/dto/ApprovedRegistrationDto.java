package com.smartcampus.backend.module.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovedRegistrationDto {
    private String userId;
    private String requestType;   // LECTURER / TECHNICIAN
    private String fullName;
    private String email;
    private String faculty;
    private String position;
    private String phoneNumber;

    private LocalDateTime requestedAt; // when request created
    private LocalDateTime approvedAt;  // when admin approved (reviewedAt)
}

