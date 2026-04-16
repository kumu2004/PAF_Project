package com.smartcampus.backend;

import com.smartcampus.backend.common.enums.BookingStatus;
import com.smartcampus.backend.module.booking.entity.Booking;
import com.smartcampus.backend.module.booking.repository.BookingRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(BookingRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                System.out.println("--- Initializing Test Data for MongoDB ---");
                
                Booking b1 = Booking.builder()
                        .resourceId("hall-01")
                        .userId("user-123")
                        .startTime(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0))
                        .endTime(LocalDateTime.now().plusDays(1).withHour(12).withMinute(0))
                        .purpose("PAF Lecture")
                        .expectedAttendees(50)
                        .status(BookingStatus.APPROVED)
                        .createdAt(LocalDateTime.now())
                        .build();

                Booking b2 = Booking.builder()
                        .resourceId("hall-02")
                        .userId("user-456")
                        .startTime(LocalDateTime.now().plusDays(2).withHour(14).withMinute(0))
                        .endTime(LocalDateTime.now().plusDays(2).withHour(16).withMinute(0))
                        .purpose("Group Meeting")
                        .expectedAttendees(10)
                        .status(BookingStatus.PENDING)
                        .createdAt(LocalDateTime.now())
                        .build();

                repository.save(b1);
                repository.save(b2);
                
                System.out.println("Test Data Saved: Hall-01 (Approved), Hall-02 (Pending)");
            } else {
                System.out.println("--- MongoDB already contains data, skipping initialization ---");
            }
        };
    }
}
