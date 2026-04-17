package com.smartcampus.backend.module.ticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private String commentId;
    private String userId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
