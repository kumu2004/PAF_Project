package com.smartcampus.backend.module.user.dto;

import lombok.Data;

@Data
public class ApproveRegistrationRequest {

    private String action;             // "APPROVE" or "REJECT" (legacy)
    private Boolean approved;          // Used by frontend

    private String rejectionReason;    // required if rejected
}
