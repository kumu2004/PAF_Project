package com.smartcampus.backend.module.booking.controller;

import com.smartcampus.backend.module.booking.dto.BookingResponse;
import com.smartcampus.backend.module.booking.dto.CreateBookingRequest;
import com.smartcampus.backend.module.booking.dto.RejectBookingRequest;
import com.smartcampus.backend.module.booking.service.BookingService;
import com.smartcampus.backend.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','LECTURER')")
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        String userId = getCurrentUserId();
        return new ResponseEntity<>(bookingService.createBooking(request, userId), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.getMyBookings(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable String id) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.getBookingById(id, userId));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable String id) {
        String userId = getCurrentUserId();
        return ResponseEntity.ok(bookingService.cancelBooking(id, userId));
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<List<BookingResponse>> getResourceCalendar(@PathVariable String resourceId) {
        return ResponseEntity.ok(bookingService.getResourceCalendar(resourceId));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> approveBooking(@PathVariable String id) {
        return ResponseEntity.ok(bookingService.approveBooking(id));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BookingResponse> rejectBooking(@PathVariable String id, @Valid @RequestBody RejectBookingRequest request) {
        return ResponseEntity.ok(bookingService.rejectBooking(id, request.getReason()));
    }

    /**
     * Extracts the current user ID from the JWT token in the SecurityContext.
     * Populated by JwtAuthenticationFilter on every request.
     */
    private String getCurrentUserId() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();
        return userDetails.getId();
    }
}
