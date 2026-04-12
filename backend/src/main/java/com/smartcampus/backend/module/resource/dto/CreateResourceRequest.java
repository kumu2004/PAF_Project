package com.smartcampus.backend.module.resource.dto;

import com.smartcampus.backend.common.enums.ResourceStatus;
import com.smartcampus.backend.common.enums.ResourceType;
import com.smartcampus.backend.module.resource.entity.AvailabilityWindow;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Resource Type is required")
    private ResourceType type;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Capacity is required")
    private Integer capacity;

    private List<String> equipment;

    private String imageUrl;
    private String floorPlanUrl;
    private List<String> amenities;
    private List<AvailabilityWindow> availabilityWindows;
}
