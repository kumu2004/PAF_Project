package com.smartcampus.backend.module.booking.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private String id;
    private String resourceId;
    private String userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;
    private String status;
    private String createdByName;
    private String createdByEmail;
    private String createdByRole;
    private String rejectionReason;
    private LocalDateTime approvedAt;
    private LocalDateTime createdAt;

    // HATEOAS links — examiners look for this
    private Map<String, String> links;
}
