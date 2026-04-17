package com.smartcampus.backend.module.resource.controller;

import com.smartcampus.backend.common.dto.ApiResponse;
import com.smartcampus.backend.common.PageResponse;
import com.smartcampus.backend.module.resource.dto.CreateResourceRequest;
import com.smartcampus.backend.module.resource.dto.ResourceResponse;
import com.smartcampus.backend.module.resource.dto.UpdateResourceRequest;
import com.smartcampus.backend.module.resource.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.smartcampus.backend.common.service.CloudinaryService;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;
    private final CloudinaryService cloudinaryService;

    @Operation(summary = "Upload resource image or floor plan")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "resources") String folder) {
        String url = cloudinaryService.uploadFile(file, folder);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", url));
    }

    // ── GET ALL (public, with search/filter) ──────────────────────────────────

    @Operation(summary = "Get all resources with optional filters")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ResourceResponse>>> getAllResources(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "capacity", required = false) String capacity,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sort", defaultValue = "name") String sort) {

        Map<String, String> filters = new HashMap<>();
        if (type     != null) filters.put("type",     type);
        if (status   != null) filters.put("status",   status);
        if (location != null) filters.put("location", location);
        if (capacity != null) filters.put("capacity", capacity);
        if (search   != null) filters.put("search",   search);

        Pageable pageable = PageRequest.of(page, size, Sort.by(sort));
        PageResponse<ResourceResponse> result =
            resourceService.getAllResources(filters, pageable);

        return ResponseEntity.ok(ApiResponse.success("Resources retrieved successfully", result));
    }

    // ── GET ONE (public) ──────────────────────────────────────────────────────

    @Operation(summary = "Get a single resource by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> getResourceById(@PathVariable String id) {
        ResourceResponse response = resourceService.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.success("Resource retrieved successfully", response));
    }

    // ── CREATE (admin only) ───────────────────────────────────────────────────

    @Operation(summary = "Create a new resource — Admin only")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<ResourceResponse>> createResource(
            @Valid @RequestBody CreateResourceRequest request) {
        ResourceResponse response = resourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource created successfully", response));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> updateResource(
            @PathVariable String id,
            @Valid @RequestBody UpdateResourceRequest request) {
        ResourceResponse response = resourceService.updateResource(id, request);
        return ResponseEntity.ok(ApiResponse.success("Resource updated successfully", response));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ResourceResponse>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        ResourceResponse response = resourceService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Resource status updated", response));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully", null));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> checkAvailability(
            @PathVariable String id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        List<Map<String, Object>> availability = resourceService.checkAvailability(id, from, to);
        return ResponseEntity.ok(ApiResponse.success("Availability checked", availability));
    }

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<String>>> getResourceTypes() {
        List<String> types = resourceService.getResourceTypes();
        return ResponseEntity.ok(ApiResponse.success("Resource types retrieved", types));
    }
}
