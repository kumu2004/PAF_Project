package com.smartcampus.backend.module.resource.dto;

import com.smartcampus.backend.common.enums.ResourceStatus;
import com.smartcampus.backend.common.enums.ResourceType;
import com.smartcampus.backend.module.resource.entity.AvailabilityWindow;
import lombok.Data;

import java.util.List;

@Data
public class UpdateResourceRequest {
    private String name;
    private String description;
    
    private ResourceType type;
    private ResourceStatus status;
    
    private String location;
    private Integer capacity;
    
    private List<String> equipment;

    private String imageUrl;
    private String floorPlanUrl;
    private List<String> amenities;
    private List<AvailabilityWindow> availabilityWindows;
}
