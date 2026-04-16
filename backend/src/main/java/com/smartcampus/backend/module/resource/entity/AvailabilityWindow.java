package com.smartcampus.backend.module.resource.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Embedded POJO representing a time window during which a resource is available.
 * This class is not annotated with @Document as it is meant to be embedded 
 * directly within the CampusResource entity document.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityWindow {

    private LocalDate date;

    private LocalTime startTime;

    private LocalTime endTime;
}
