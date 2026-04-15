package com.smartcampus.backend.module.booking.entity;

import com.smartcampus.backend.common.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;

    private String resourceId;
    private String userId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private BookingStatus status;

    private String purpose;
    private Integer expectedAttendees;

    private String requestedByName;
    private String requestedByEmail;
    private String requestedByRole;

    private String rejectionReason;
    private String approvedByUserId;
    private LocalDateTime approvedAt;

    @CreatedDate
    private LocalDateTime createdAt;
}
