package com.smartcampus.backend.module.ticket.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketAttachment {
    private String attachmentId;    // UUID string
    private String fileName;
    private String fileUrl;         // Cloudinary URL — not a local path
    private Long fileSize;
    private String contentType;
    private String uploadedBy;      // userId
    private LocalDateTime uploadedAt;
}
