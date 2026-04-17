package com.smartcampus.backend.module.booking.repository;

import com.smartcampus.backend.common.enums.BookingStatus;
import com.smartcampus.backend.module.booking.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for managing {@link Booking} documents in MongoDB.
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    /**
     * Finds any booking that overlaps the given time window for the same resource and is not cancelled or rejected.
     * This query checks for the overlap condition: (startTime < search_endTime AND endTime > search_startTime).
     *
     * @param resourceId The ID of the resource to check.
     * @param startTime  Search start time.
     * @param endTime    Search end time.
     * @return List of conflicting bookings.
     */
    @Query("{ 'resourceId': ?0, " +
           "'status': { $in: ['PENDING', 'APPROVED'] }, " +
           "'startTime': { $lt: ?2 }, " +
           "'endTime':   { $gt: ?1 } }")
    List<Booking> findConflicts(String resourceId,
                                LocalDateTime startTime,
                                LocalDateTime endTime);

    /**
     * Finds bookings made by a user, ordered by creation date (descending).
     *
     * @param userId The ID of the user.
     * @return List of bookings.
     */
    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * Finds bookings by their status with pagination support.
     *
     * @param status   The status string.
     * @param pageable Pagination and sorting information.
     * @return Page of bookings.
     */
    List<Booking> findByResourceIdAndStatus(String resourceId, BookingStatus status);

    Page<Booking> findByStatus(String status, Pageable pageable);

    /**
     * Finds bookings for a specific resource with multiple allowed statuses.
     *
     * @param resourceId The ID of the resource.
     * @param statuses   List of status strings.
     * @return List of bookings.
     */
    List<Booking> findByResourceIdAndStatusIn(String resourceId, List<String> statuses);
}
