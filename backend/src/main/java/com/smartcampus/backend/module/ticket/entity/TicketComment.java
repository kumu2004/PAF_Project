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
public class TicketComment {
    private String commentId;       // UUID string
    private String userId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
