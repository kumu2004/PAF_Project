package com.smartcampus.backend.module.resource.entity;

import com.smartcampus.backend.common.enums.ResourceStatus;
import com.smartcampus.backend.common.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "resources")
public class CampusResource {

    @Id
    private String id;
    
    private String name;
    private String description;
    
    private ResourceType type;
    private ResourceStatus status;

    private String location;
    private int capacity;

    private String imageUrl;
    private String floorPlanUrl;

    @Builder.Default
    private List<String> equipment = new ArrayList<>();

    @Builder.Default
    private List<String> amenities = new ArrayList<>();
    
    @Builder.Default
    private List<AvailabilityWindow> availabilityWindows = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    @CreatedBy
    private String createdByUserId;
}
