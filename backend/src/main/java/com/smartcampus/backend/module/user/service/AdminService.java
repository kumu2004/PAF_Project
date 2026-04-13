package com.smartcampus.backend.module.user.service;

import com.smartcampus.backend.common.enums.AccountStatus;
import com.smartcampus.backend.common.enums.BookingStatus;
import com.smartcampus.backend.common.enums.TicketStatus;
import com.smartcampus.backend.module.booking.entity.Booking;
import com.smartcampus.backend.module.resource.repository.ResourceRepository;
import com.smartcampus.backend.module.ticket.repository.TicketRepository;
import com.smartcampus.backend.module.auth.entity.RegistrationRequest;
import com.smartcampus.backend.module.auth.repository.RegistrationRequestRepository;
import com.smartcampus.backend.common.enums.NotificationType;
import com.smartcampus.backend.module.notification.service.NotificationService;
import com.smartcampus.backend.module.user.dto.AdminAnalyticsResponse;
import com.smartcampus.backend.module.user.dto.AdminStatsResponse;
import com.smartcampus.backend.module.user.dto.AdminUserDto;
import com.smartcampus.backend.module.user.dto.ApprovedRegistrationDto;
import com.smartcampus.backend.module.user.entity.User;
import com.smartcampus.backend.module.user.repository.UserRepository;
import com.mongodb.client.result.DeleteResult;
import com.mongodb.client.result.UpdateResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    /**
     * Matches a 24-char hex id inside quotes (legacy bad {@code String.valueOf(ObjectId)} payloads).
     */
    private static final Pattern OBJECT_ID_IN_QUOTES = Pattern.compile("[\"']([a-fA-F0-9]{24})[\"']");

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final TicketRepository ticketRepository;
    private final MongoTemplate mongoTemplate;
    private final RegistrationRequestRepository registrationRequestRepository;
    private final NotificationService notificationService;

    public AdminStatsResponse getStats() {
        long totalResources = resourceRepository.count();

        long pendingBookings = mongoTemplate.count(
                new Query(Criteria.where("status").is(BookingStatus.PENDING)),
                Booking.class);

        long openTickets = ticketRepository.countByStatusIn(List.of(TicketStatus.OPEN.name(), TicketStatus.IN_PROGRESS.name()));
        long pendingRegistrations = userRepository.countByStatus(AccountStatus.PENDING);

        // Bookings by status aggregation
        Aggregation statusAgg = Aggregation.newAggregation(
                Aggregation.group("status").count().as("count"));
        AggregationResults<AdminStatsResponse.StatusCount> statusResults = mongoTemplate.aggregate(statusAgg,
                "bookings", AdminStatsResponse.StatusCount.class);

        // Top booked resources aggregation
        Aggregation resourceAgg = Aggregation.newAggregation(
                Aggregation.group("resourceName").count().as("bookingCount"),
                Aggregation.sort(org.springframework.data.domain.Sort.Direction.DESC, "bookingCount"),
                Aggregation.limit(5));
        AggregationResults<AdminStatsResponse.ResourceCount> resourceResults = mongoTemplate.aggregate(resourceAgg,
                "bookings", AdminStatsResponse.ResourceCount.class);

        return AdminStatsResponse.builder()
                .totalResources(totalResources)
                .pendingBookings(pendingBookings)
                .openTickets(openTickets)
                .pendingRegistrations(pendingRegistrations)
                .bookingsByStatus(statusResults.getMappedResults())
                .topBookedResources(resourceResults.getMappedResults())
                .build();
    }

    public AdminAnalyticsResponse getAnalytics() {
        // Resources by Type
        Aggregation resourceTypeAgg = Aggregation.newAggregation(
                Aggregation.group("type").count().as("value"));
        List<AdminAnalyticsResponse.DataPoint> resByType = mongoTemplate.aggregate(resourceTypeAgg, "resources", AdminAnalyticsResponse.DataPoint.class)
                .getMappedResults().stream().map(dp -> new AdminAnalyticsResponse.DataPoint(dp.get_id() == null ? "UNKNOWN" : dp.get_id(), dp.getValue())).toList();

        // Resources by Status
        Aggregation resourceStatusAgg = Aggregation.newAggregation(
                Aggregation.group("status").count().as("value"));
        List<AdminAnalyticsResponse.DataPoint> resByStatus = mongoTemplate.aggregate(resourceStatusAgg, "resources", AdminAnalyticsResponse.DataPoint.class)
                .getMappedResults().stream().map(dp -> new AdminAnalyticsResponse.DataPoint(dp.get_id() == null ? "UNKNOWN" : dp.get_id(), dp.getValue())).toList();

        // Tickets by Priority
        Aggregation ticketPriorityAgg = Aggregation.newAggregation(
                Aggregation.group("priority").count().as("value"));
        List<AdminAnalyticsResponse.DataPoint> ticketsByPriority = mongoTemplate.aggregate(ticketPriorityAgg, "tickets", AdminAnalyticsResponse.DataPoint.class)
                .getMappedResults().stream().map(dp -> new AdminAnalyticsResponse.DataPoint(dp.get_id() == null ? "UNKNOWN" : dp.get_id(), dp.getValue())).toList();

        // Tickets by Category
        Aggregation ticketCategoryAgg = Aggregation.newAggregation(
                Aggregation.group("category").count().as("value"));
        List<AdminAnalyticsResponse.DataPoint> ticketsByCategory = mongoTemplate.aggregate(ticketCategoryAgg, "tickets", AdminAnalyticsResponse.DataPoint.class)
                .getMappedResults().stream().map(dp -> new AdminAnalyticsResponse.DataPoint(dp.get_id() == null ? "OTHERS" : dp.get_id(), dp.getValue())).toList();

        // Tickets by Status
        Aggregation ticketStatusAgg = Aggregation.newAggregation(
                Aggregation.group("status").count().as("value"));
        List<AdminAnalyticsResponse.DataPoint> ticketsByStatus = mongoTemplate.aggregate(ticketStatusAgg, "tickets", AdminAnalyticsResponse.DataPoint.class)
                .getMappedResults().stream().map(dp -> new AdminAnalyticsResponse.DataPoint(dp.get_id() == null ? "UNKNOWN" : dp.get_id(), dp.getValue())).toList();

        // Bookings by Status
        Aggregation bookingStatusAgg = Aggregation.newAggregation(
                Aggregation.group("status").count().as("value"));
        List<AdminAnalyticsResponse.DataPoint> bookingsByStatus = mongoTemplate.aggregate(bookingStatusAgg, "bookings", AdminAnalyticsResponse.DataPoint.class)
                .getMappedResults().stream().map(dp -> new AdminAnalyticsResponse.DataPoint(dp.get_id() == null ? "UNKNOWN" : dp.get_id(), dp.getValue())).toList();

        // Users by Role
        Aggregation userRoleAgg = Aggregation.newAggregation(
                Aggregation.group("role").count().as("value"));
        List<AdminAnalyticsResponse.DataPoint> usersByRole = mongoTemplate.aggregate(userRoleAgg, "users", AdminAnalyticsResponse.DataPoint.class)
                .getMappedResults().stream().map(dp -> new AdminAnalyticsResponse.DataPoint(dp.get_id() == null ? "UNKNOWN" : dp.get_id(), dp.getValue())).toList();

        return AdminAnalyticsResponse.builder()
                .resourcesByType(resByType)
                .resourcesByStatus(resByStatus)
                .ticketsByPriority(ticketsByPriority)
                .ticketsByCategory(ticketsByCategory)
                .ticketsByStatus(ticketsByStatus)
                .bookingsByStatus(bookingsByStatus)
                .usersByRole(usersByRole)
                .totalResources(resourceRepository.count())
                .totalTickets(ticketRepository.count())
                .totalBookings(mongoTemplate.count(new Query(), "bookings"))
                .totalUsers(userRepository.count())
                .activityTimeline(getActivityTimeline())
                .build();
    }

    private List<AdminAnalyticsResponse.ActivityPoint> getActivityTimeline() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        
        // 1. Get Booking Activity
        Aggregation bookingActivityAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("createdAt").gte(sevenDaysAgo)),
                Aggregation.project()
                        .andExpression("dateToString('%Y-%m-%d', createdAt)").as("date")
                        .and("requestedByRole").as("role"),
                Aggregation.group("date", "role").count().as("count")
        );

        AggregationResults<Document> bookingResults = mongoTemplate.aggregate(bookingActivityAgg, "bookings", Document.class);
        
        // 2. Get Ticket Activity (Requires Lookup for Role)
        Aggregation ticketActivityAgg = Aggregation.newAggregation(
                Aggregation.match(Criteria.where("createdAt").gte(sevenDaysAgo)),
                Aggregation.lookup("users", "userId", "_id", "user"),
                Aggregation.unwind("user"),
                Aggregation.project()
                        .andExpression("dateToString('%Y-%m-%d', createdAt)").as("date")
                        .and("user.role").as("role"),
                Aggregation.group("date", "role").count().as("count")
        );

        AggregationResults<Document> ticketResults = mongoTemplate.aggregate(ticketActivityAgg, "tickets", Document.class);

        // 3. Combine Results in Java
        Map<String, AdminAnalyticsResponse.ActivityPoint> timelineMap = new TreeMap<>();
        
        // Initialize last 7 days with zeros
        for (int i = 0; i < 7; i++) {
            String date = LocalDate.now().minusDays(i).format(DateTimeFormatter.ISO_LOCAL_DATE);
            timelineMap.put(date, new AdminAnalyticsResponse.ActivityPoint(date, 0, 0, 0, 0));
        }

        processActivityDocs(bookingResults.getMappedResults(), timelineMap);
        processActivityDocs(ticketResults.getMappedResults(), timelineMap);

        log.info("Timeline Map: {}", timelineMap);
        return new ArrayList<>(timelineMap.values());
    }

    private void processActivityDocs(List<Document> docs, Map<String, AdminAnalyticsResponse.ActivityPoint> timelineMap) {
        for (Document doc : docs) {
            log.info("Processing activity doc: {}", doc);
            Object idObj = doc.get("_id");
            if (idObj instanceof Document idDoc) {
                String date = idDoc.getString("date");
                String role = idDoc.getString("role");
                long count = ((Number) doc.get("count")).longValue();

                if (timelineMap.containsKey(date)) {
                    AdminAnalyticsResponse.ActivityPoint point = timelineMap.get(date);
                    if ("STUDENT".equals(role)) point.setStudent(point.getStudent() + count);
                    else if ("LECTURER".equals(role)) point.setLecturer(point.getLecturer() + count);
                    else if ("ADMIN".equals(role)) point.setAdmin(point.getAdmin() + count);
                    else if ("TECHNICIAN".equals(role)) point.setTechnician(point.getTechnician() + count);
                }
            } else {
                log.warn("Unexpected _id format in activity aggregation: {}", idObj);
            }
        }
    }

    public List<User> getPendingRegistrations() {
        return userRepository.findByStatus(AccountStatus.PENDING);
    }

    public List<ApprovedRegistrationDto> getApprovedRegistrations() {
        List<RegistrationRequest> approved = registrationRequestRepository.findByRequestStatus("APPROVED");
        return approved.stream()
                .sorted(Comparator.comparing(RegistrationRequest::getReviewedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(r -> ApprovedRegistrationDto.builder()
                        .userId(r.getUserId())
                        .requestType(r.getRequestType())
                        .fullName(r.getFullName())
                        .email(r.getEmail())
                        .faculty(r.getFaculty())
                        .position(r.getPosition())
                        .phoneNumber(r.getPhoneNumber())
                        .requestedAt(r.getCreatedAt())
                        .approvedAt(r.getReviewedAt())
                        .build())
                .collect(Collectors.toList());
    }

    public List<AdminUserDto> getTechnicians() {
        log.info("Fetching all assignable staff (non-students) for technician pool");
        Query query = new Query();
        query.addCriteria(Criteria.where("role").ne("STUDENT"));
        List<Document> docs = mongoTemplate.find(query, Document.class, "users");
        log.info("Found {} technicians", docs.size());
        return docs.stream()
                .map(this::toAdminUserDto)
                .sorted(Comparator.comparing(AdminUserDto::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public List<AdminUserDto> getAllUsers(String search) {
        log.info("Fetching all users with search: {}", search);

        // Read raw documents instead of mapping to `User` to avoid failures if legacy/unknown
        // enum values are present (e.g. role = "STAFF_MEMBER").
        Query query = new Query();
        if (search != null && !search.trim().isEmpty()) {
            String s = search.trim();
            Pattern pattern = Pattern.compile(Pattern.quote(s), Pattern.CASE_INSENSITIVE);
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("email").regex(pattern),
                    Criteria.where("firstName").regex(pattern),
                    Criteria.where("lastName").regex(pattern),
                    Criteria.where("phoneNumber").regex(pattern)
            ));
            log.info("Searching users with pattern: {}", s);
        } else {
            log.info("Fetching all users without search filter");
        }

        List<Document> docs = mongoTemplate.find(query, Document.class, "users");
        log.info("Found {} users", docs.size());

        return docs.stream()
                .map(this::toAdminUserDto)
                .sorted(Comparator.comparing(AdminUserDto::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public void disableUser(String userId) {
        String normalized = normalizeUserId(userId);
        User user = userRepository.findById(normalized).orElse(null);
        Query q = buildIdQuery(userId);
        Update update = new Update()
                .set("active", false)
                .set("status", AccountStatus.SUSPENDED.name());
        UpdateResult result = mongoTemplate.updateFirst(q, update, "users");
        if (result.getMatchedCount() == 0) {
            throw new RuntimeException("User not found.");
        }
        log.info("User {} disabled (suspended)", normalized);

        if (user != null) {
            notificationService.notifyUser(
                    user.getId(),
                    NotificationType.ACCOUNT_DISABLED,
                    "Account disabled",
                    "Your account has been disabled by the admin.",
                    "/notifications"
            );
            notificationService.notifyAdmin("Disabled account for: " + user.getEmail());
        }
    }

    public void enableUser(String userId) {
        String normalized = normalizeUserId(userId);
        User user = userRepository.findById(normalized).orElse(null);
        Query q = buildIdQuery(userId);
        Update update = new Update()
                .set("active", true)
                .set("status", AccountStatus.ACTIVE.name());
        UpdateResult result = mongoTemplate.updateFirst(q, update, "users");
        if (result.getMatchedCount() == 0) {
            throw new RuntimeException("User not found.");
        }
        log.info("User {} enabled (active)", normalized);

        if (user != null) {
            notificationService.notifyUser(
                    user.getId(),
                    NotificationType.ACCOUNT_ENABLED,
                    "Account enabled",
                    "Your account has been enabled by the admin.",
                    "/notifications"
            );
            notificationService.notifyAdmin("Enabled account for: " + user.getEmail());
        }
    }

    public void deleteUser(String userId) {
        Query q = buildIdQuery(userId);
        DeleteResult result = mongoTemplate.remove(q, "users");
        if (result.getDeletedCount() == 0) {
            throw new RuntimeException("User not found.");
        }
        log.info("User {} deleted", normalizeUserId(userId));
    }

    private String normalizeUserId(String rawUserId) {
        if (rawUserId == null || rawUserId.isBlank()) {
            throw new RuntimeException("User id is required.");
        }
        String s = rawUserId.trim();
        if (s.regionMatches(true, 0, "ObjectId", 0, 8)) {
            Matcher m = OBJECT_ID_IN_QUOTES.matcher(s);
            if (m.find()) {
                return m.group(1);
            }
        }
        return s;
    }

    /**
     * Match {@code _id} whether Mongo stores it as BSON ObjectId or as a String (Spring Data can use either).
     */
    private Query buildIdQuery(String rawUserId) {
        String id = normalizeUserId(rawUserId);
        List<Criteria> ors = new ArrayList<>();
        ors.add(Criteria.where("_id").is(id));
        if (ObjectId.isValid(id)) {
            try {
                ors.add(Criteria.where("_id").is(new ObjectId(id)));
            } catch (IllegalArgumentException ignored) {
                // ignore invalid ObjectId construction edge cases
            }
        }
        if (ors.size() == 1) {
            return new Query(ors.get(0));
        }
        return new Query(new Criteria().orOperator(ors));
    }

    private AdminUserDto toAdminUserDto(Document d) {
        String role = d.getString("role");
        String status = d.getString("status");

        return AdminUserDto.builder()
                .id(extractId(d))
                .title(d.getString("title"))
                .firstName(d.getString("firstName"))
                .lastName(d.getString("lastName"))
                .email(d.getString("email"))
                .phoneNumber(d.getString("phoneNumber"))
                .faculty(d.getString("faculty"))
                .role(role)
                .status(status)
                .active(Boolean.TRUE.equals(d.getBoolean("active")))
                .createdAt(coerceToLocalDateTime(d.get("createdAt")))
                .updatedAt(coerceToLocalDateTime(d.get("updatedAt")))
                .build();
    }

    private static String extractId(Document d) {
        Object id = d.get("_id");
        if (id == null) {
            return null;
        }
        if (id instanceof ObjectId oid) {
            return oid.toHexString();
        }
        return String.valueOf(id);
    }

    private static LocalDateTime coerceToLocalDateTime(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDateTime ldt) return ldt;
        if (value instanceof Date date) {
            return LocalDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault());
        }
        return null;
    }
}
