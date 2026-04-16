package com.smartcampus.backend.module.booking;

import com.smartcampus.backend.common.enums.BookingStatus;
import com.smartcampus.backend.common.enums.ResourceType;
import com.smartcampus.backend.common.enums.UserRole;
import com.smartcampus.backend.exception.BookingConflictException;
import com.smartcampus.backend.exception.ResourceNotFoundException;
import com.smartcampus.backend.module.booking.dto.BookingResponse;
import com.smartcampus.backend.module.booking.dto.CreateBookingRequest;
import com.smartcampus.backend.module.booking.entity.Booking;
import com.smartcampus.backend.module.booking.repository.BookingRepository;
import com.smartcampus.backend.module.resource.entity.CampusResource;
import com.smartcampus.backend.module.resource.repository.ResourceRepository;
import com.smartcampus.backend.module.booking.service.BookingServiceImpl;
import com.smartcampus.backend.module.user.entity.User;
import com.smartcampus.backend.module.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

        @Mock
        private ResourceRepository resourceRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void createBooking_withOverlap_shouldThrowConflictException() {
        CreateBookingRequest request = createRequest();
        String userId = "user-123";

        Booking existing = Booking.builder()
                .id("booking-1")
                .resourceId(request.getResourceId())
                .status(BookingStatus.APPROVED)
                .startTime(request.getStartTime().minusMinutes(15))
                .endTime(request.getEndTime().plusMinutes(15))
                .build();

        CampusResource resource = CampusResource.builder()
                .id(request.getResourceId())
                .type(ResourceType.MEETING_ROOM)
                .capacity(25)
                .build();
        when(resourceRepository.findById(request.getResourceId())).thenReturn(Optional.of(resource));
        when(bookingRepository.findConflicts(request.getResourceId(), request.getStartTime(), request.getEndTime()))
                .thenReturn(List.of(existing));

        assertThrows(BookingConflictException.class, () -> bookingService.createBooking(request, userId));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void createBooking_withValidRequest_shouldCreatePendingBooking() {
        CreateBookingRequest request = createRequest();
        String userId = "student-001";

        CampusResource resource = CampusResource.builder()
                .id(request.getResourceId())
                .type(ResourceType.MEETING_ROOM)
                .capacity(25)
                .build();
        when(resourceRepository.findById(request.getResourceId())).thenReturn(Optional.of(resource));
        when(bookingRepository.findConflicts(request.getResourceId(), request.getStartTime(), request.getEndTime()))
                .thenReturn(List.of());
        User requester = User.builder()
                .firstName("Kamal")
                .lastName("Silva")
                .email("kamal@student.edu")
                .role(UserRole.STUDENT)
                .build();
        requester.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(requester));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking booking = invocation.getArgument(0);
            booking.setId("booking-created");
            return booking;
        });

        BookingResponse response = bookingService.createBooking(request, userId);

        assertEquals("booking-created", response.getId());
        assertEquals("PENDING", response.getStatus());
        assertEquals(userId, response.getUserId());
        assertEquals(request.getResourceId(), response.getResourceId());
        assertEquals(request.getPurpose(), response.getPurpose());
        assertEquals(request.getExpectedAttendees(), response.getExpectedAttendees());
        assertEquals("Kamal Silva", response.getCreatedByName());
        assertEquals("kamal@student.edu", response.getCreatedByEmail());
        assertEquals("STUDENT", response.getCreatedByRole());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createBooking_whenStudentBooksDisallowedType_shouldThrowException() {
        CreateBookingRequest request = createRequest();

        CampusResource resource = CampusResource.builder()
                .id(request.getResourceId())
                .type(ResourceType.LAB)
                .capacity(40)
                .build();
        User requester = User.builder()
                .firstName("Saman")
                .lastName("Fernando")
                .email("saman@student.edu")
                .role(UserRole.STUDENT)
                .build();
        requester.setId("student-111");

        when(resourceRepository.findById(request.getResourceId())).thenReturn(Optional.of(resource));
        when(userRepository.findById("student-111")).thenReturn(Optional.of(requester));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(request, "student-111"));

        assertTrue(ex.getMessage().contains("Students can only book"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

        @Test
        void createBooking_withInvalidResource_shouldThrowResourceNotFoundException() {
                CreateBookingRequest request = createRequest();

                when(resourceRepository.findById(request.getResourceId())).thenReturn(Optional.empty());

                assertThrows(ResourceNotFoundException.class,
                                () -> bookingService.createBooking(request, "student-777"));

                verify(bookingRepository, never()).save(any(Booking.class));
        }

    @Test
    void createBooking_whenExpectedAttendeesExceedCapacity_shouldThrowException() {
        CreateBookingRequest request = createRequest();
        request.setExpectedAttendees(60);

        CampusResource resource = CampusResource.builder()
                .id(request.getResourceId())
                .type(ResourceType.MEETING_ROOM)
                .capacity(25)
                .build();

        when(resourceRepository.findById(request.getResourceId())).thenReturn(Optional.of(resource));
        when(userRepository.findById("student-200")).thenReturn(Optional.empty());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(request, "student-200"));

        assertTrue(ex.getMessage().contains("cannot exceed resource capacity"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void cancelBooking_whenStatusIsPending_shouldFail() {
        String bookingId = "booking-2";
        String userId = "student-002";

        Booking pendingBooking = Booking.builder()
                .id(bookingId)
                .userId(userId)
                .status(BookingStatus.PENDING)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(pendingBooking));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> bookingService.cancelBooking(bookingId, userId));

        assertTrue(ex.getMessage().contains("Only APPROVED bookings can be cancelled"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void cancelBooking_whenApproved_shouldSetCancelled() {
        String bookingId = "booking-3";
        String userId = "student-003";

        Booking approvedBooking = Booking.builder()
                .id(bookingId)
                .userId(userId)
                .status(BookingStatus.APPROVED)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(approvedBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.cancelBooking(bookingId, userId);

        assertEquals("CANCELLED", response.getStatus());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void approveBooking_whenNotPending_shouldFail() {
        String bookingId = "booking-4";
        Booking alreadyApproved = Booking.builder()
                .id(bookingId)
                .status(BookingStatus.APPROVED)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(alreadyApproved));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> bookingService.approveBooking(bookingId));

        assertTrue(ex.getMessage().contains("Only PENDING bookings can be approved"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void rejectBooking_whenPending_shouldSetRejectedAndReason() {
        String bookingId = "booking-5";
        String reason = "Room required for urgent exam scheduling.";

        Booking pendingBooking = Booking.builder()
                .id(bookingId)
                .status(BookingStatus.PENDING)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookingResponse response = bookingService.rejectBooking(bookingId, reason);

        assertEquals("REJECTED", response.getStatus());
        assertEquals(reason, response.getRejectionReason());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void getAllBookings_shouldIncludeCreatorIdentity() {
        Booking booking = Booking.builder()
                .id("booking-6")
                .userId("student-100")
                .resourceId("hall-01")
                .purpose("Seminar")
                .status(BookingStatus.PENDING)
                .build();

        User creator = User.builder()
                .email("student100@campus.edu")
                .firstName("Nimal")
                .lastName("Perera")
                .role(UserRole.STUDENT)
                .build();
        creator.setId("student-100");

        when(bookingRepository.findAll()).thenReturn(List.of(booking));
        when(userRepository.findAllById(any(Iterable.class))).thenReturn(List.of(creator));

        List<BookingResponse> responses = bookingService.getAllBookings();

        assertEquals(1, responses.size());
        assertEquals("Nimal Perera", responses.get(0).getCreatedByName());
        assertEquals("student100@campus.edu", responses.get(0).getCreatedByEmail());
                assertEquals("STUDENT", responses.get(0).getCreatedByRole());
    }

    private CreateBookingRequest createRequest() {
        CreateBookingRequest request = new CreateBookingRequest();
        request.setResourceId("resource-1");
        request.setStartTime(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0).withSecond(0).withNano(0));
        request.setEndTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0));
        request.setPurpose("Project review meeting");
        request.setExpectedAttendees(6);
        return request;
    }
}
