package com.smartcampus.backend.module.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAnalyticsResponse {
    
    private List<DataPoint> resourcesByType;
    private List<DataPoint> resourcesByStatus;
    private List<DataPoint> ticketsByPriority;
    private List<DataPoint> ticketsByCategory;
    private List<DataPoint> ticketsByStatus;
    private List<DataPoint> bookingsByStatus;
    private List<DataPoint> usersByRole;
    private List<ActivityPoint> activityTimeline;
    
    private long totalResources;
    private long totalTickets;
    private long totalBookings;
    private long totalUsers;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DataPoint {
        private String _id;
        private long value;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class ActivityPoint {
        private String date;
        private long student;
        private long lecturer;
        private long admin;
        private long technician;
    }
}
