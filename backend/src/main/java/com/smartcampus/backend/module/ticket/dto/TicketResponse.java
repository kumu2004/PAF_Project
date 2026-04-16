package com.smartcampus.backend.module.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketResponse {
    private String id;
    private String userId;
    private String resourceId;
    private String title;
    private String description;
    private String category;
    private String priority;
    private String status;
    private String assignedTechnicianId;
    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private LocalDateTime slaDeadline;
    private boolean slaBreached;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private List<AttachmentResponse> attachments;
    private List<CommentResponse> comments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttachmentResponse {
        private String attachmentId;
        private String fileName;
        private String fileUrl;
        private Long fileSize;
        private String contentType;
        private String uploadedBy;
        private LocalDateTime uploadedAt;
    }
}
