package com.smartcampus.backend.module.booking.service;

import com.smartcampus.backend.common.enums.BookingStatus;
import com.smartcampus.backend.common.enums.NotificationType;
import com.smartcampus.backend.common.enums.ResourceType;
import com.smartcampus.backend.common.enums.UserRole;
import com.smartcampus.backend.exception.BookingConflictException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.exception.UnauthorizedAccessException;
import com.smartcampus.backend.module.booking.dto.BookingResponse;
import com.smartcampus.backend.module.booking.dto.CreateBookingRequest;
import com.smartcampus.backend.module.booking.entity.Booking;
import com.smartcampus.backend.module.booking.repository.BookingRepository;
import com.smartcampus.backend.module.notification.service.NotificationService;
import com.smartcampus.backend.module.resource.repository.ResourceRepository;
import com.smartcampus.backend.module.user.entity.User;
import com.smartcampus.backend.module.user.repository.UserRepository;
import com.smartcampus.backend.module.notification.service.NotificationService;
import com.smartcampus.backend.common.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public BookingResponse createBooking(CreateBookingRequest request, String userId) {
        var resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + request.getResourceId()));

        Optional<User> requester = userRepository.findById(userId);
        if (requester.isPresent() && requester.get().getRole() == UserRole.STUDENT) {
            ResourceType resourceType = resource.getType();
            boolean isAllowed = resourceType == ResourceType.MEETING_ROOM ||
                                resourceType == ResourceType.EQUIPMENT ||
                                resourceType == ResourceType.LIBRARY ||
                                resourceType == ResourceType.STUDY_SPACE;

            if (!isAllowed) {
                throw new IllegalArgumentException(
                    "Students can only book MEETING_ROOM, EQUIPMENT, LIBRARY, or STUDY_SPACE resources. " +
                    "Lecture halls and laboratories are restricted to staff only."
                );
            }
        }

        if (request.getExpectedAttendees() != null && request.getExpectedAttendees() > resource.getCapacity()) {
            throw new IllegalArgumentException("Expected attendees cannot exceed resource capacity (" + resource.getCapacity() + ").");
        }

        // 0. Time consistency check
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        // 1. Conflict Detection
        List<Booking> conflicts = bookingRepository.findConflicts(
                request.getResourceId(),
                request.getStartTime(),
                request.getEndTime()
        );

        if (!conflicts.isEmpty()) {
            throw new BookingConflictException("The resource is already booked for the selected time range.");
        }

        String requesterName = requester
            .map(user -> (user.getFirstName() + " " + user.getLastName()).trim())
            .orElse(null);
        String requesterEmail = requester.map(User::getEmail).orElse(null);
        String requesterRole = requester.map(user -> user.getRole() == null ? null : user.getRole().name()).orElse(null);

        // 2. Create Entity
        Booking booking = Booking.builder()
                .resourceId(request.getResourceId())
                .userId(userId)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose())
                .expectedAttendees(request.getExpectedAttendees())
            .requestedByName(requesterName)
            .requestedByEmail(requesterEmail)
            .requestedByRole(requesterRole)
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        Booking saved = bookingRepository.save(booking);

        // Notify admin about new booking request
        try {
            notificationService.notifyAdminNewBooking(resource.getName(), requesterName);
        } catch (Exception e) {
            // Log error but don't fail the booking creation
            log.error("Failed to create booking notification for admin", e);
        }

        // 3. Map to Response with HATEOAS
        return mapToResponse(saved);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        Map<String, User> userLookup = buildUserLookup(bookings);

        return bookings.stream()
            .map(booking -> mapToResponse(booking, userLookup.get(booking.getUserId())))
                .collect(Collectors.toList());
    }

    @Override
    public List<BookingResponse> getMyBookings(String userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(String id, String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
        
        // Ownership check
        if (!booking.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You are not authorized to view this booking.");
        }
        
        return mapToResponse(booking);
    }

    @Override
    public BookingResponse cancelBooking(String id, String userId) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (!booking.getUserId().equals(userId)) {
            throw new UnauthorizedAccessException("You can only cancel your own bookings.");
        }

        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only APPROVED bookings can be cancelled. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return mapToResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getResourceCalendar(String resourceId) {
        return bookingRepository.findByResourceIdAndStatus(resourceId, BookingStatus.APPROVED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse approveBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be approved. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        
        // Notify user about booking approval
        try {
            var resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
            String resourceName = resource != null ? resource.getName() : "Resource";
            notificationService.notifyUser(
                booking.getUserId(),
                NotificationType.BOOKING_APPROVED,
                "Booking Approved",
                "Your booking for " + resourceName + " has been approved.",
                "/bookings/my"
            );
        } catch (Exception e) {
            // Log error but don't fail the approval
            log.error("Failed to create booking approval notification for user: {}", booking.getUserId(), e);
        }
        
        return mapToResponse(saved);
    }

    @Override
    public BookingResponse rejectBooking(String id, String reason) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be rejected. Current status: " + booking.getStatus());
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        Booking saved = bookingRepository.save(booking);
        
        // Notify user about booking rejection with reason
        try {
            var resource = resourceRepository.findById(booking.getResourceId()).orElse(null);
            String resourceName = resource != null ? resource.getName() : "Resource";
            String rejectionMessage = "Your booking for " + resourceName + " has been rejected.";
            if (reason != null && !reason.isEmpty()) {
                rejectionMessage += " Reason: " + reason;
            }
            notificationService.notifyUser(
                booking.getUserId(),
                NotificationType.BOOKING_REJECTED,
                "Booking Rejected",
                rejectionMessage,
                "/bookings/my"
            );
        } catch (Exception e) {
            // Log error but don't fail the rejection
            log.error("Failed to create booking rejection notification for user: {}", booking.getUserId(), e);
        }
        
        return mapToResponse(saved);
    }

    private BookingResponse mapToResponse(Booking booking) {
        return mapToResponse(booking, null);
    }

    private BookingResponse mapToResponse(Booking booking, User creator) {
        Map<String, String> links = new HashMap<>();
        links.put("self", "/api/bookings/" + booking.getId());
        links.put("resource", "/api/resources/" + booking.getResourceId());
        
        if (booking.getStatus() == BookingStatus.PENDING) {
            links.put("approve", "/api/bookings/" + booking.getId() + "/approve");
            links.put("reject", "/api/bookings/" + booking.getId() + "/reject");
        }
        if (booking.getStatus() == BookingStatus.APPROVED) {
            links.put("cancel", "/api/bookings/" + booking.getId() + "/cancel");
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .resourceId(booking.getResourceId())
                .userId(booking.getUserId())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus().name())
                .createdByName(resolveCreatedByName(booking, creator))
                .createdByEmail(resolveCreatedByEmail(booking, creator))
                .createdByRole(resolveCreatedByRole(booking, creator))
                .rejectionReason(booking.getRejectionReason())
                .approvedAt(booking.getApprovedAt())
                .createdAt(booking.getCreatedAt())
                .links(links)
                .build();
    }

    private String resolveCreatedByName(Booking booking, User creator) {
        if (creator != null) {
            return (creator.getFirstName() + " " + creator.getLastName()).trim();
        }
        return booking.getRequestedByName();
    }

    private String resolveCreatedByEmail(Booking booking, User creator) {
        if (creator != null) {
            return creator.getEmail();
        }
        return booking.getRequestedByEmail();
    }

    private String resolveCreatedByRole(Booking booking, User creator) {
        if (creator != null && creator.getRole() != null) {
            return creator.getRole().name();
        }
        return booking.getRequestedByRole();
    }

    private Map<String, User> buildUserLookup(List<Booking> bookings) {
        Set<String> userIds = bookings.stream()
                .map(Booking::getUserId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));
    }
}
