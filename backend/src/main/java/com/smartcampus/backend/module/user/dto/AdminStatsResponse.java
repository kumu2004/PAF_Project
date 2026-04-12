package com.smartcampus.backend.module.user.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AdminStatsResponse {
    private long totalResources;
    private long pendingBookings;
    private long openTickets;
    private long pendingRegistrations;
    private List<StatusCount> bookingsByStatus;
    private List<ResourceCount> topBookedResources;

    @Data
    @Builder
    public static class StatusCount {
        private String _id;
        private long count;
    }

    @Data
    @Builder
    public static class ResourceCount {
        private String _id;
        private long bookingCount;
    }
}
