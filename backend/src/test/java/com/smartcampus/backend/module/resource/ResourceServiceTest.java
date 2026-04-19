package com.smartcampus.backend.module.resource;

import com.smartcampus.backend.common.enums.ResourceStatus;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.module.resource.dto.CreateResourceRequest;
import com.smartcampus.backend.module.resource.dto.ResourceResponse;
import com.smartcampus.backend.module.resource.entity.CampusResource;
import com.smartcampus.backend.module.resource.repository.ResourceRepository;
import com.smartcampus.backend.module.resource.service.ResourceServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private ResourceServiceImpl resourceService;

    // TEST 1: Create resource successfully
    @Test
    void createResource_withValidRequest_shouldReturnCreatedResource() {
        // Arrange
        CreateResourceRequest request = new CreateResourceRequest();
        request.setName("Lab A");
        request.setLocation("Block 3");
        request.setCapacity(30);

        when(resourceRepository.existsByNameIgnoreCase("Lab A")).thenReturn(false);
        when(resourceRepository.save(any(CampusResource.class)))
            .thenAnswer(inv -> {
                CampusResource r = inv.getArgument(0);
                r.setId("test-id-123");
                return r;
            });

        // Act
        ResourceResponse response = resourceService.createResource(request);

        // Assert
        assertNotNull(response);
        assertEquals("Lab A", response.getName());
        assertNotNull(response.getLinks());
        assertTrue(response.getLinks().containsKey("self"));
        verify(resourceRepository).save(any(CampusResource.class));
    }

    // TEST 2: Duplicate name should throw exception
    @Test
    void createResource_withDuplicateName_shouldThrowException() {
        CreateResourceRequest request = new CreateResourceRequest();
        request.setName("Lab A");

        when(resourceRepository.existsByNameIgnoreCase("Lab A")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
            () -> resourceService.createResource(request));

        verify(resourceRepository, never()).save(any());
    }

    // TEST 3: Get resource by ID not found
    @Test
    void getResourceById_withInvalidId_shouldThrowResourceNotFoundException() {
        when(resourceRepository.findById("invalid-id"))
            .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
            () -> resourceService.getResourceById("invalid-id"));
    }

    // TEST 4: Delete resource
    @Test
    void deleteResource_withValidId_shouldDeleteSuccessfully() {
        when(resourceRepository.existsById("test-id")).thenReturn(true);

        resourceService.deleteResource("test-id");

        verify(resourceRepository).deleteById("test-id");
    }

    // TEST 5: Update status with invalid value
    @Test
    void updateStatus_withInvalidStatus_shouldThrowException() {
        CampusResource resource = new CampusResource();
        resource.setId("test-id");
        when(resourceRepository.findById("test-id"))
            .thenReturn(Optional.of(resource));

        assertThrows(IllegalArgumentException.class,
            () -> resourceService.updateStatus("test-id", "INVALID_STATUS"));
    }
}
