package com.smartcampus.backend.module.ticket.entity;

import com.smartcampus.backend.common.BaseDocument;
import com.smartcampus.backend.common.enums.TicketPriority;
import com.smartcampus.backend.common.enums.TicketStatus;
import lombok.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "tickets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Ticket extends BaseDocument {
    @Indexed
    private String userId;
    private String resourceId;
    private String title;
    private String description;
    private String category;
    
    @Builder.Default
    private String priority = TicketPriority.MEDIUM.name();
    
    @Indexed
    @Builder.Default
    private String status = TicketStatus.OPEN.name();
    
    private String assignedTechnicianId;
    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private String rejectionReason;
    private String preferredContact;
    private LocalDateTime slaDeadline;        // Innovation: SLA timer
    
    @Builder.Default
    private boolean slaBreached = false;      // Innovation: SLA timer

    private List<TicketAttachment> attachments;
    private List<TicketComment> comments;
}
