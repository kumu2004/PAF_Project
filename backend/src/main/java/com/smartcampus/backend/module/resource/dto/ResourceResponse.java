package com.smartcampus.backend.module.resource.dto;

import com.smartcampus.backend.common.enums.ResourceStatus;
import com.smartcampus.backend.common.enums.ResourceType;
import com.smartcampus.backend.module.resource.entity.AvailabilityWindow;
import com.smartcampus.backend.module.resource.entity.CampusResource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.smartcampus.backend.module.resource.entity.CampusResource;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private String id;
    
    private String name;
    private String description;
    
    private ResourceType type;
    private ResourceStatus status;
    
    private String location;
    private Integer capacity;
    
    private String imageUrl;
    private String floorPlanUrl;
    
    private List<String> equipment;
    private List<String> amenities;
    private List<AvailabilityWindow> availabilityWindows;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // HATEOAS links
    private Map<String, String> links;

    public static ResourceResponse from(CampusResource resource) {
        Map<String, String> links = new HashMap<>();
        links.put("self",         "/api/resources/" + resource.getId());
        links.put("bookings",     "/api/resources/" + resource.getId() + "/bookings");
        links.put("availability", "/api/resources/" + resource.getId() + "/availability");

        return ResourceResponse.builder()
                .id(resource.getId())
                .name(resource.getName())
                .description(resource.getDescription())
                .type(resource.getType())
                .status(resource.getStatus())
                .location(resource.getLocation())
                .capacity(resource.getCapacity())
                .imageUrl(resource.getImageUrl())
                .floorPlanUrl(resource.getFloorPlanUrl())
                .equipment(resource.getEquipment())
                .amenities(resource.getAmenities())
                .availabilityWindows(resource.getAvailabilityWindows())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .links(links)
                .build();
    }
}
