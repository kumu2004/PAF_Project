package com.smartcampus.backend.module.booking.service;

import com.smartcampus.backend.module.booking.dto.BookingResponse;
import com.smartcampus.backend.module.booking.dto.CreateBookingRequest;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(CreateBookingRequest request, String userId);
    List<BookingResponse> getAllBookings();
    List<BookingResponse> getMyBookings(String userId);
    BookingResponse getBookingById(String id, String userId);
    BookingResponse cancelBooking(String id, String userId);
    List<BookingResponse> getResourceCalendar(String resourceId);
    BookingResponse approveBooking(String id);
    BookingResponse rejectBooking(String id, String reason);
}
