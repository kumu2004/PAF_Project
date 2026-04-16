package com.smartcampus.backend.module.resource.repository;

import com.smartcampus.backend.common.enums.ResourceStatus;
import com.smartcampus.backend.common.enums.ResourceType;
import com.smartcampus.backend.module.resource.entity.CampusResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<CampusResource, String> {

    // Find by type (e.g. LECTURE_HALL, LAB)
    Page<CampusResource> findByType(ResourceType type, Pageable pageable);

    // Find by status
    List<CampusResource> findByStatus(ResourceStatus status);

    // Find by location containing (case-insensitive search)
    Page<CampusResource> findByLocationContainingIgnoreCase(String location, Pageable pageable);

    // Combined search — you will use MongoTemplate for complex multi-field search in the service
    Page<CampusResource> findByTypeAndStatus(ResourceType type, ResourceStatus status, Pageable pageable);

    // Check if name already exists (prevent duplicates)
    boolean existsByNameIgnoreCase(String name);
}
