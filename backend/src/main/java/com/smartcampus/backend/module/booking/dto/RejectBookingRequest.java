package com.smartcampus.backend.module.booking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectBookingRequest {
    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
