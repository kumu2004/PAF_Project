package com.smartcampus.backend.module.resource.service;

import com.smartcampus.backend.common.PageResponse;
import com.smartcampus.backend.common.enums.ResourceStatus;
import com.smartcampus.backend.common.enums.ResourceType;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.module.resource.dto.CreateResourceRequest;
import com.smartcampus.backend.module.resource.dto.ResourceResponse;
import com.smartcampus.backend.module.resource.dto.UpdateResourceRequest;
import com.smartcampus.backend.module.resource.entity.CampusResource;
import com.smartcampus.backend.module.resource.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final MongoTemplate      mongoTemplate;

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Override
    public ResourceResponse createResource(CreateResourceRequest request) {
        // Prevent duplicate names
        if (resourceRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException(
                "A resource with this name already exists: " + request.getName()
            );
        }
        CampusResource resource = CampusResource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity() != null ? request.getCapacity() : 0)
                .location(request.getLocation())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .floorPlanUrl(request.getFloorPlanUrl())
                .status(ResourceStatus.ACTIVE)
                .availabilityWindows(request.getAvailabilityWindows() == null ? new ArrayList<>() : request.getAvailabilityWindows())
                .equipment(request.getEquipment() == null ? new ArrayList<>() : request.getEquipment())
                .amenities(request.getAmenities() == null ? new ArrayList<>() : request.getAmenities())
                .build();

        CampusResource saved = resourceRepository.save(resource);
        log.info("Created resource: {} ({})", saved.getName(), saved.getId());
        return ResourceResponse.from(saved);
    }

    // ── READ ONE ──────────────────────────────────────────────────────────────

    @Override
    public ResourceResponse getResourceById(String id) {
        CampusResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Resource not found with id: " + id
                ));
        return ResourceResponse.from(resource);
    }

    // ── READ ALL (with filters) ───────────────────────────────────────────────

    @Override
    public PageResponse<ResourceResponse> getAllResources(
            Map<String, String> filters, Pageable pageable) {
        // Build a dynamic MongoDB query from the filters map

        Query query = new Query().with(pageable);
        Criteria criteria = new Criteria();

        List<Criteria> conditions = new ArrayList<>();

        if (filters.containsKey("type") && !filters.get("type").isBlank()) {
            try {
                conditions.add(Criteria.where("type").is(ResourceType.valueOf(filters.get("type").toUpperCase())));
            } catch (IllegalArgumentException ignored) {}
        }
        if (filters.containsKey("status") && !filters.get("status").isBlank()) {
            try {
                conditions.add(Criteria.where("status").is(ResourceStatus.valueOf(filters.get("status").toUpperCase())));
            } catch (IllegalArgumentException ignored) {}
        }
        if (filters.containsKey("location") && !filters.get("location").isBlank()) {
            conditions.add(Criteria.where("location").regex(filters.get("location"), "i"));
        }
        if (filters.containsKey("capacity") && !filters.get("capacity").isBlank()) {
            try {
                int minCapacity = Integer.parseInt(filters.get("capacity"));
                conditions.add(Criteria.where("capacity").gte(minCapacity));
            } catch (NumberFormatException ignored) {}
        }
        if (filters.containsKey("search") && !filters.get("search").isBlank()) {
            String searchTerm = filters.get("search");
            conditions.add(new Criteria().orOperator(
                Criteria.where("name").regex(searchTerm, "i"),
                Criteria.where("location").regex(searchTerm, "i"),
                Criteria.where("description").regex(searchTerm, "i")
            ));
        }

        if (!conditions.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(conditions.toArray(new Criteria[0])));
        }

        long total = mongoTemplate.count(query, CampusResource.class);
        query.with(pageable);
        List<CampusResource> resources = mongoTemplate.find(query, CampusResource.class);

        List<ResourceResponse> responses = resources.stream()
            .map(ResourceResponse::from)
            .toList();

        return PageResponse.<ResourceResponse>builder()
            .content(responses)
            .page(pageable.getPageNumber())
            .size(pageable.getPageSize())
            .totalElements(total)
            .totalPages((int) Math.ceil((double) total / pageable.getPageSize()))
            .last(pageable.getPageNumber() >= (int) Math.ceil((double) total / pageable.getPageSize()) - 1)
            .build();
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @Override
    public ResourceResponse updateResource(String id, UpdateResourceRequest request) {
        CampusResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Resource not found with id: " + id
                ));


        // Only update fields that are present in the request
        if (request.getName()        != null) resource.setName(request.getName());
        if (request.getType()        != null) resource.setType(request.getType());
        if (request.getCapacity()    != null) resource.setCapacity(request.getCapacity());
        if (request.getLocation()    != null) resource.setLocation(request.getLocation());
        if (request.getDescription() != null) resource.setDescription(request.getDescription());
        if (request.getEquipment()   != null) resource.setEquipment(request.getEquipment());
        if (request.getImageUrl()    != null) resource.setImageUrl(request.getImageUrl());
        if (request.getFloorPlanUrl()!= null) resource.setFloorPlanUrl(request.getFloorPlanUrl());
        if (request.getStatus()      != null) resource.setStatus(request.getStatus());
        if (request.getAmenities()   != null) resource.setAmenities(request.getAmenities());
        if (request.getAvailabilityWindows() != null) resource.setAvailabilityWindows(request.getAvailabilityWindows());
        
        CampusResource saved = resourceRepository.save(resource);
        log.info("Updated resource: {}", id);
        return ResourceResponse.from(saved);
    }

    // ── UPDATE STATUS ─────────────────────────────────────────────────────────

    @Override
    public ResourceResponse updateStatus(String id, String status) {
        CampusResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Resource not found with id: " + id
                ));

        try {
            resource.setStatus(ResourceStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                "Invalid status: " + status + ". Valid statuses are: " + Arrays.toString(ResourceStatus.values())
            );
        }

        CampusResource saved = resourceRepository.save(resource);
        log.info("Updated resource {} status to {}", id, status);
        return ResourceResponse.from(saved);
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Override
    public void deleteResource(String id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
        log.info("Deleted resource: {}", id);
    }

    // ── AVAILABILITY CHECK ────────────────────────────────────────────────────

    @Override
    public List<Map<String, Object>> checkAvailability(
            String id, LocalDateTime from, LocalDateTime to) {

        // Verify resource exists
        resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Resource not found with id: " + id
                ));


        // This calls BookingRepository — Member 2 will provide this
        // For now return a placeholder — wire up properly in Day 4 integration
        // Placeholder — wire up properly in Day 4 integration
        Map<String, Object> result = new HashMap<>();
        result.put("resourceId", id);
        result.put("from", from);
        result.put("to", to);
        result.put("available", true);
        return List.of(result);
    }

    // ── GET TYPES ─────────────────────────────────────────────────────────────

    @Override
    public List<String> getResourceTypes() {
        return Arrays.stream(ResourceType.values())
                     .map(Enum::name)
                     .toList();
    }
}
