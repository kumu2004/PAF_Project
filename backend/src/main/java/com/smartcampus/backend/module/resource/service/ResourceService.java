package com.smartcampus.backend.module.resource.service;

import com.smartcampus.backend.module.resource.dto.CreateResourceRequest;
import com.smartcampus.backend.module.resource.dto.ResourceResponse;
import com.smartcampus.backend.module.resource.dto.UpdateResourceRequest;
import com.smartcampus.backend.common.PageResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface ResourceService {

    ResourceResponse         createResource(CreateResourceRequest request);
    ResourceResponse         getResourceById(String id);
    PageResponse<ResourceResponse> getAllResources(Map<String, String> filters, Pageable pageable);
    ResourceResponse         updateResource(String id, UpdateResourceRequest request);
    ResourceResponse         updateStatus(String id, String status);
    void                     deleteResource(String id);
    List<Map<String, Object>> checkAvailability(String id, LocalDateTime from, LocalDateTime to);
    List<String>             getResourceTypes();
}
