package com.smartcampus.backend.module.notification.entity;

import java.time.LocalDateTime;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.smartcampus.backend.common.BaseDocument;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Document(collection = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Notification extends BaseDocument {

    /**
     * Recipient user id. If null, this notification is treated as a role-based broadcast
     * (see {@code audienceRole}).
     */
    @Indexed
    private String userId;

    /**
     * Role-based broadcast audience. Only used when {@code userId} is null.
     * Example: "ADMIN".
     */
    @Indexed
    private String audienceRole;

    /** String enum (NotificationType.name()) to keep Mongo storage stable. */
    @Indexed
    private String type;

    private String title;
    private String message;

    /** Optional app path the UI can navigate to, e.g. "/dashboard/notifications". */
    private String actionPath;

    private LocalDateTime readAt;
}

