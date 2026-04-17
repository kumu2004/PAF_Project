package com.smartcampus.backend.module.auth.entity;

import com.smartcampus.backend.common.BaseDocument;
import lombok.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "registration_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RegistrationRequest extends BaseDocument {

    private String userId;          // references User._id
    private String requestType;     // "LECTURER" or "TECHNICIAN"
    private String requestStatus;   // "PENDING", "APPROVED", "REJECTED"
    private String reviewedByAdmin; // admin userId who acted on this
    private String rejectionReason;
    private LocalDateTime reviewedAt;

    // Snapshot of registration data for admin to review
    private String fullName;
    private String email;
    private String faculty;
    private String position;        // lecturer position or technician position
    private String phoneNumber;
}
