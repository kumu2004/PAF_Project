# 🏛️ SMART CAMPUS OPERATIONS HUB — MASTER PROMPT
## IT3030 PAF 2026 | SLIIT Faculty of Computing
### Comprehensive Architecture, Design & Implementation Guide

> **Perspectives:** Backend Engineer · Frontend Engineer · Software Architect · UI/UX Designer · Software Engineer  
> **Stack:** Spring Boot (Java) · React (JavaScript) · ShadCN UI · Tailwind CSS · **MongoDB** · GitHub Actions  
> **Roles:** USER (Students + Staff) · ADMIN · TECHNICIAN  
> **Marking Weight:** 30% of IT3030 Final Mark | Viva: 11 April | Deadline: 27 April 2026

---

## 📋 TABLE OF CONTENTS

1. [System Overview & Roles](#1-system-overview--roles)
2. [Software Architecture — Clean Architecture Principles](#2-software-architecture--clean-architecture-principles)
3. [Backend — Spring Boot Folder Structure](#3-backend--spring-boot-folder-structure)
4. [REST API Design — All 6 Architectural Constraints](#4-rest-api-design--all-6-architectural-constraints)
5. [Complete API Endpoint Reference (All 4 Members)](#5-complete-api-endpoint-reference-all-4-members)
6. [Backend Implementation Patterns](#6-backend-implementation-patterns)
7. [Frontend — React Architecture](#7-frontend--react-architecture)
8. [Frontend Folder Structure](#8-frontend-folder-structure)
9. [ShadCN UI + Tailwind CSS Integration](#9-shadcn-ui--tailwind-css-integration)
10. [UI/UX Design System](#10-uiux-design-system)
11. [Authentication — OAuth 2.0 + JWT](#11-authentication--oauth-20--jwt)
12. [Database Design](#12-database-design)
13. [GitHub Actions CI/CD Pipeline](#13-github-actions-cicd-pipeline)
14. [Team Member Responsibilities](#14-team-member-responsibilities)
15. [Marking Rubric Alignment](#15-marking-rubric-alignment)
16. [Innovation Features](#16-innovation-features)

---

## 1. System Overview & Roles

### 1.1 What We Are Building

A **production-grade, full-stack web system** for university campus management with two core workflows:

| Workflow | Description |
|----------|-------------|
| **Facilities & Bookings** | Browse, search, and book campus resources (rooms, labs, equipment) with approval workflow |
| **Maintenance & Incidents** | Report faults, attach evidence images, track resolution through technician updates |

### 1.2 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│   React SPA (Vite + ShadCN + Tailwind)  ← Role-based routes    │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTPS  (REST + JSON)
                        │ Authorization: Bearer <JWT>
┌───────────────────────▼─────────────────────────────────────────┐
│                     API GATEWAY LAYER                            │
│         Spring Boot 3.x  (Port 8080)                            │
│         Spring Security · OAuth2 · JWT Filter                    │
└──────┬──────────────────────┬──────────────────────┬────────────┘
       │                      │                      │
┌──────▼──────┐    ┌──────────▼──────┐    ┌─────────▼──────────┐
│ Facilities  │    │    Booking       │    │  Incident Ticket    │
│  Service    │    │    Service       │    │     Service         │
└──────┬──────┘    └──────────┬──────┘    └─────────┬──────────┘
       │                      │                      │
┌──────▼──────────────────────▼──────────────────────▼──────────┐
│                    DATA ACCESS LAYER                             │
│          Spring Data MongoDB · MongoDB Atlas · GridFS (files)   │
└───────────────────────────────────────────────────────────────┘
       │                      │
┌──────▼──────┐    ┌──────────▼──────┐
│  OAuth 2.0  │    │  Notifications   │
│  (Google)   │    │   Service        │
└─────────────┘    └─────────────────┘
```

### 1.3 User Roles

The system has **three roles**. Students and staff share the same `USER` role because they have identical permissions in this system.

| Role | Real-World Users | Permissions |
|------|-----------------|-------------|
| `USER` | Students + Staff members | Browse resources, create bookings, raise tickets, view own records, receive notifications |
| `ADMIN` | Administrators | Everything USER can do + approve/reject bookings, manage resources, assign technicians, manage user roles |
| `TECHNICIAN` | Technicians | View assigned tickets, update ticket status (IN_PROGRESS → RESOLVED), add resolution notes, comment on tickets |

> **Why TECHNICIAN is a separate role:** Module C requires technician assignment. If technicians were ADMIN, your role-based access control would be too coarse — admins and technicians have genuinely different permissions. The assignment brief explicitly suggests this role for "better design."

### 1.4 Team Responsibilities

| Member | Domain | Key Deliverables |
|--------|--------|-----------------|
| **Member 1** | Facilities & Assets Catalogue | Resource CRUD, search/filter, availability management |
| **Member 2** | Booking Workflow & Conflict Detection | Booking lifecycle, overlap detection, admin approval |
| **Member 3** | Incident Tickets, Attachments, Technician | Ticket CRUD, file upload, status workflow, comments |
| **Member 4** | Notifications, Roles & OAuth | Google OAuth, JWT, role management, notification system |

---

## 2. Software Architecture — Clean Architecture Principles

### 2.1 Architecture Philosophy

We follow **Clean Architecture** (Robert C. Martin) adapted for Spring Boot. The key rule:

> **Dependencies point inward.** Outer layers depend on inner layers. Inner layers know nothing about outer layers.

```
         ┌──────────────────────────────────┐
         │   Frameworks & Drivers (Spring)   │  ← Controllers, JPA, Security
         │  ┌────────────────────────────┐   │
         │  │   Interface Adapters       │   │  ← DTOs, Mappers, Repositories Impl
         │  │  ┌──────────────────────┐  │   │
         │  │  │   Application Core   │  │   │  ← Services, Use Cases
         │  │  │  ┌────────────────┐  │  │   │
         │  │  │  │  Domain/Entity │  │  │   │  ← Pure Java models, no Spring
         │  │  │  └────────────────┘  │  │   │
         │  │  └──────────────────────┘  │   │
         │  └────────────────────────────┘   │
         └──────────────────────────────────┘
```

### 2.2 Layered Architecture in Spring Boot

```
HTTP Request
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  CONTROLLER LAYER  (@RestController)                  │
│  • Receives HTTP requests                             │
│  • Validates input (@Valid)                           │
│  • Delegates to service                               │
│  • Returns ResponseEntity<DTO>                        │
└────────────────────────┬─────────────────────────────┘
                         │ calls
┌────────────────────────▼─────────────────────────────┐
│  SERVICE LAYER  (@Service)                            │
│  • Business logic lives here                         │
│  • Orchestrates repository calls                      │
│  • Throws domain exceptions                           │
│  • Handles transactions (@Transactional)              │
└────────────────────────┬─────────────────────────────┘
                         │ calls
┌────────────────────────▼─────────────────────────────┐
│  REPOSITORY LAYER  (JpaRepository)                    │
│  • Data access only                                   │
│  • Custom JPQL queries (@Query)                       │
│  • No business logic                                  │
└────────────────────────┬─────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────┐
│  DATABASE  (PostgreSQL)                               │
└──────────────────────────────────────────────────────┘
```

### 2.3 Cross-Cutting Concerns

| Concern | Implementation |
|---------|---------------|
| Authentication | Spring Security + OAuth2 + JWT Filter |
| Authorization | `@PreAuthorize("hasRole('ADMIN')")` |
| Validation | Bean Validation (`@Valid`, `@NotBlank`) |
| Error Handling | `@RestControllerAdvice` GlobalExceptionHandler |
| Logging | SLF4J + Logback |
| API Documentation | Springdoc OpenAPI (Swagger UI) |
| CORS | CorsConfigurationSource bean |

---

## 3. Backend — Spring Boot Folder Structure

```
smart-campus-api/
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions pipeline
├── src/
│   └── main/
│       ├── java/
│       │   └── com/smartcampus/api/
│       │       │
│       │       ├── SmartCampusApplication.java     # @SpringBootApplication
│       │       │
│       │       ├── config/                         # ALL Spring configuration
│       │       │   ├── SecurityConfig.java          # Spring Security + OAuth2
│       │       │   ├── JwtConfig.java               # JWT properties
│       │       │   ├── CorsConfig.java              # CORS settings
│       │       │   ├── OpenApiConfig.java           # Swagger/OpenAPI
│       │       │   └── StorageConfig.java           # File storage config
│       │       │
│       │       ├── security/                        # Security components
│       │       │   ├── JwtTokenProvider.java        # Generate/validate JWT
│       │       │   ├── JwtAuthenticationFilter.java # JWT filter chain
│       │       │   ├── CustomUserDetails.java       # UserDetails impl
│       │       │   ├── CustomUserDetailsService.java
│       │       │   └── oauth2/
│       │       │       ├── OAuth2SuccessHandler.java
│       │       │       └── OAuth2UserInfoFactory.java
│       │       │
│       │       ├── exception/                       # Global error handling
│       │       │   ├── GlobalExceptionHandler.java  # @RestControllerAdvice
│       │       │   ├── ResourceNotFoundException.java
│       │       │   ├── BookingConflictException.java
│       │       │   ├── UnauthorizedAccessException.java
│       │       │   └── ApiError.java               # Error response DTO
│       │       │
│       │       ├── common/                          # Shared utilities
│       │       │   ├── ApiResponse.java             # Wrapper response class
│       │       │   ├── PageResponse.java            # Paginated response
│       │       │   └── enums/
│       │       │       ├── ResourceStatus.java      # ACTIVE, OUT_OF_SERVICE
│       │       │       ├── BookingStatus.java       # PENDING, APPROVED, etc.
│       │       │       ├── TicketStatus.java        # OPEN, IN_PROGRESS, etc.
│       │       │       ├── TicketPriority.java      # LOW, MEDIUM, HIGH, CRITICAL
│       │       │       └── UserRole.java            # USER, ADMIN, TECHNICIAN
│       │       │
│       │       │
│       │       ├── module/
│       │       │   │
│       │       │   ├── resource/                    # MODULE A — Member 1
│       │       │   │   ├── controller/
│       │       │   │   │   └── ResourceController.java
│       │       │   │   ├── service/
│       │       │   │   │   ├── ResourceService.java         # interface
│       │       │   │   │   └── ResourceServiceImpl.java
│       │       │   │   ├── repository/
│       │       │   │   │   └── ResourceRepository.java
│       │       │   │   ├── entity/
│       │       │   │   │   └── CampusResource.java
│       │       │   │   └── dto/
│       │       │   │       ├── CreateResourceRequest.java
│       │       │   │       ├── UpdateResourceRequest.java
│       │       │   │       └── ResourceResponse.java
│       │       │   │
│       │       │   ├── booking/                     # MODULE B — Member 2
│       │       │   │   ├── controller/
│       │       │   │   │   └── BookingController.java
│       │       │   │   ├── service/
│       │       │   │   │   ├── BookingService.java
│       │       │   │   │   └── BookingServiceImpl.java
│       │       │   │   ├── repository/
│       │       │   │   │   └── BookingRepository.java
│       │       │   │   ├── entity/
│       │       │   │   │   └── Booking.java
│       │       │   │   └── dto/
│       │       │   │       ├── CreateBookingRequest.java
│       │       │   │       ├── ApproveBookingRequest.java
│       │       │   │       └── BookingResponse.java
│       │       │   │
│       │       │   ├── ticket/                      # MODULE C — Member 3
│       │       │   │   ├── controller/
│       │       │   │   │   ├── TicketController.java
│       │       │   │   │   └── CommentController.java
│       │       │   │   ├── service/
│       │       │   │   │   ├── TicketService.java
│       │       │   │   │   ├── TicketServiceImpl.java
│       │       │   │   │   ├── CommentService.java
│       │       │   │   │   └── CommentServiceImpl.java
│       │       │   │   ├── repository/
│       │       │   │   │   ├── TicketRepository.java
│       │       │   │   │   └── CommentRepository.java
│       │       │   │   ├── entity/
│       │       │   │   │   ├── Ticket.java
│       │       │   │   │   ├── TicketAttachment.java
│       │       │   │   │   └── TicketComment.java
│       │       │   │   └── dto/
│       │       │   │       ├── CreateTicketRequest.java
│       │       │   │       ├── UpdateTicketRequest.java
│       │       │   │       ├── TicketResponse.java
│       │       │   │       ├── CreateCommentRequest.java
│       │       │   │       └── CommentResponse.java
│       │       │   │
│       │       │   ├── notification/                # MODULE D — Member 4
│       │       │   │   ├── controller/
│       │       │   │   │   └── NotificationController.java
│       │       │   │   ├── service/
│       │       │   │   │   ├── NotificationService.java
│       │       │   │   │   └── NotificationServiceImpl.java
│       │       │   │   ├── repository/
│       │       │   │   │   └── NotificationRepository.java
│       │       │   │   ├── entity/
│       │       │   │   │   └── Notification.java
│       │       │   │   └── dto/
│       │       │   │       └── NotificationResponse.java
│       │       │   │
│       │       │   └── user/                        # MODULE E — Member 4
│       │       │       ├── controller/
│       │       │       │   └── UserController.java
│       │       │       ├── service/
│       │       │       │   ├── UserService.java
│       │       │       │   └── UserServiceImpl.java
│       │       │       ├── repository/
│       │       │       │   └── UserRepository.java
│       │       │       ├── entity/
│       │       │       │   └── User.java
│       │       │       └── dto/
│       │       │           ├── UserResponse.java
│       │       │           └── UpdateRoleRequest.java
│       │       │
│       │       └── storage/                         # File handling (Member 3)
│       │           ├── StorageService.java
│       │           └── LocalStorageServiceImpl.java
│       │
│       └── resources/
│           ├── application.yml                      # Main configuration
│           ├── application-dev.yml                  # Dev environment
│           ├── application-prod.yml                 # Production environment
│           └── db/
│               └── migration/                       # Flyway migrations (optional)
│                   ├── V1__create_users.sql
│                   ├── V2__create_resources.sql
│                   ├── V3__create_bookings.sql
│                   └── V4__create_tickets.sql
│
└── src/test/
    └── java/com/smartcampus/api/
        ├── resource/
        │   └── ResourceServiceTest.java
        ├── booking/
        │   └── BookingServiceTest.java
        ├── ticket/
        │   └── TicketServiceTest.java
        └── integration/
            └── ResourceControllerIntegrationTest.java
```

### 3.1 application.yml — Complete Configuration

```yaml
server:
  port: 8080

spring:
  application:
    name: smart-campus-api

  # ✅ MongoDB configuration — replaces datasource + jpa blocks
  data:
    mongodb:
      uri: ${MONGODB_URI:mongodb://localhost:27017/smart_campus}
      database: smart_campus
      # For MongoDB Atlas cloud:
      # uri: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smart_campus

  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - email
              - profile
            redirect-uri: "{baseUrl}/oauth2/callback/{registrationId}"
        provider:
          google:
            authorization-uri: https://accounts.google.com/o/oauth2/auth
            token-uri: https://oauth2.googleapis.com/token
            user-info-uri: https://www.googleapis.com/oauth2/v3/userinfo

  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 15MB

app:
  jwt:
    secret: ${JWT_SECRET:your-256-bit-secret-key-here-change-in-production}
    expiration: 86400000         # 24 hours in milliseconds
  frontend:
    url: ${FRONTEND_URL:http://localhost:5173}
  storage:
    upload-dir: ./uploads
    max-attachment-count: 3

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
```

### 3.2 pom.xml — Dependencies

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- ✅ MongoDB — replaces spring-boot-starter-data-jpa + postgresql -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-mongodb</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-client</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Utilities -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- API Documentation -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
    <!-- Embedded MongoDB for tests -->
    <dependency>
        <groupId>de.flapdoodle.embed</groupId>
        <artifactId>de.flapdoodle.embed.mongo.spring31x</artifactId>
        <version>4.12.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## 4. REST API Design — All 6 Architectural Constraints

> **This section is worth 15 marks (10 for constraints + 5 for naming). Study every constraint carefully.**

### Constraint 1: Client-Server Separation ✅

**Definition:** The UI and data storage concerns must be separated. This improves portability of the UI and scalability of the server.

**How we satisfy it:**
- React frontend runs on port `5173` (completely separate process)
- Spring Boot API runs on port `8080` (completely separate process)
- They communicate **only via HTTP/REST** — no shared memory, no templates
- Frontend can be replaced (e.g., with a mobile app) without changing the API
- Backend can scale independently

```
React (5173) ──── HTTP REST ────► Spring Boot (8080) ──── JPA ────► PostgreSQL
    ↑                                      ↑
Can run on                          Can scale horizontally
any CDN                             independently
```

**Mention this in your report:** "Our system achieves Client-Server separation by deploying the React SPA and Spring Boot API as completely independent services communicating exclusively through a well-defined REST API contract."

---

### Constraint 2: Stateless Communication ✅

**Definition:** Each request from client to server must contain ALL information needed to understand the request. The server does NOT store client session state.

**How we satisfy it:**
- No `HttpSession` on the server
- Every API request carries the JWT in the `Authorization: Bearer <token>` header
- The JWT contains: `userId`, `email`, `role`, `issued_at`, `expires_at`
- Server validates the token on every request — no stored sessions

```java
// JwtAuthenticationFilter.java — extracts user from token on EVERY request
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) {
        String jwt = extractTokenFromHeader(request);
        if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
            Authentication auth = jwtTokenProvider.getAuthentication(jwt);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(request, response);
    }
}
```

**Report note:** "Our API is stateless. Every HTTP request includes a JWT containing the authenticated user's identity and role. The server never stores session data between requests, improving scalability and reliability."

---

### Constraint 3: Cacheability ✅

**Definition:** Responses must define themselves as cacheable or non-cacheable. Caching eliminates some client-server interactions.

**How we satisfy it:**

```java
// In ResourceController — GET endpoints return cache headers
@GetMapping
public ResponseEntity<PageResponse<ResourceResponse>> getResources(...) {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.maxAge(5, TimeUnit.MINUTES))   // Cacheable for 5 mins
        .body(resourceService.getAllResources(params));
}

// For user-specific or mutable data — explicitly mark as non-cacheable
@GetMapping("/my-bookings")
public ResponseEntity<List<BookingResponse>> getMyBookings(...) {
    return ResponseEntity.ok()
        .cacheControl(CacheControl.noStore())                     // Never cache private data
        .body(bookingService.getMyBookings(userId));
}
```

| Endpoint Type | Cache Policy | Reason |
|--------------|-------------|--------|
| `GET /api/resources` | `max-age=300` (5 min) | Rarely changes, safe to cache |
| `GET /api/resources/{id}` | `max-age=60` (1 min) | Slightly more dynamic |
| `GET /api/bookings/my` | `no-store` | Private user data |
| `GET /api/notifications` | `no-store` | Always fresh |
| `POST/PUT/DELETE *` | N/A | Mutating — not cached |

---

### Constraint 4: Uniform Interface ✅

**Definition:** The central feature that distinguishes REST. Has four sub-constraints:

#### 4a. Identification of Resources — via URIs

```
CORRECT — Nouns, plural, hierarchical:
  GET  /api/resources              → collection of resources
  GET  /api/resources/{id}         → specific resource
  GET  /api/resources/{id}/bookings → bookings for a resource

WRONG — verbs in URLs:
  GET  /api/getResources           ❌
  POST /api/createBooking          ❌
  GET  /api/getAllBookingsForUser   ❌
```

#### 4b. Manipulation of Resources Through Representations

Clients receive a JSON representation and use it to modify state:
- `GET` returns the resource representation
- Client modifies the representation
- `PUT/PATCH` sends the modified representation back

#### 4c. Self-Descriptive Messages

Every request and response contains enough information to process it:

```json
// Request — self-describing with Content-Type
POST /api/bookings
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

{
  "resourceId": "550e8400-e29b-41d4-a716-446655440000",
  "startTime": "2026-04-01T09:00:00",
  "endTime": "2026-04-01T11:00:00",
  "purpose": "Team meeting for CS project",
  "expectedAttendees": 8
}

// Response — includes status, content-type, and HATEOAS links
HTTP/1.1 201 Created
Content-Type: application/json
Location: /api/bookings/123

{
  "id": "123",
  "status": "PENDING",
  "resourceId": "550e8400-...",
  "links": {
    "self": "/api/bookings/123",
    "cancel": "/api/bookings/123/cancel",
    "resource": "/api/resources/550e8400-..."
  }
}
```

#### 4d. HATEOAS (Hypermedia as the Engine of Application State)

```java
// BookingResponse.java — includes hypermedia links
@Data
@Builder
public class BookingResponse {
    private String id;
    private BookingStatus status;
    private String resourceId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;

    // HATEOAS links — examiner expects this for full marks
    private Map<String, String> links;

    public static BookingResponse from(Booking booking) {
        Map<String, String> links = new HashMap<>();
        links.put("self", "/api/bookings/" + booking.getId());
        links.put("resource", "/api/resources/" + booking.getResourceId());
        if (booking.getStatus() == BookingStatus.APPROVED) {
            links.put("cancel", "/api/bookings/" + booking.getId() + "/cancel");
        }
        return BookingResponse.builder()
            .id(booking.getId())
            .status(booking.getStatus())
            .links(links)
            .build();
    }
}
```

---

### Constraint 5: Layered System ✅

**Definition:** Client cannot tell whether it is connected directly to the end server or to an intermediary. Architecture composed of hierarchical layers.

**How we satisfy it:**

```
React Client
    │
    ▼  (doesn't know what's behind this)
Spring Boot API  ──── Spring Security Layer (validates JWT)
    │               └─ Controller Layer (routes)
    │               └─ Service Layer (business logic)
    │               └─ Repository Layer (data)
    ▼
PostgreSQL
```

- **Spring Security** is a layer — the controller never sees unauthenticated requests
- **Service layer** doesn't know about HTTP — it works with POJOs
- **Repository layer** doesn't know about business logic
- Could add a **load balancer** or **API gateway** in front without changing React

```java
// Service has NO knowledge of HTTP — pure business logic
@Service
public class BookingServiceImpl implements BookingService {
    // No HttpServletRequest, no @RequestParam, no ResponseEntity
    // Pure Java logic only
    public BookingResponse createBooking(CreateBookingRequest request, String userId) {
        checkForConflicts(request);  // Business rule
        Booking booking = buildBooking(request, userId);
        Booking saved = bookingRepository.save(booking);
        notificationService.notifyAdmins(saved);  // Cross-service call
        return BookingResponse.from(saved);
    }
}
```

---

### Constraint 6: Code on Demand (Optional) ✅

**Definition:** Servers can extend client functionality by transferring executable code.

**How we satisfy it (optional but earns marks):**
- Our API can return JavaScript snippets for dynamic form validation rules
- Or serve configuration that drives client-side behavior

```java
// Optional endpoint — dynamic config for frontend
@GetMapping("/config")
public ResponseEntity<Map<String, Object>> getClientConfig() {
    Map<String, Object> config = new HashMap<>();
    config.put("maxAttachments", 3);
    config.put("allowedFileTypes", List.of("image/jpeg", "image/png", "image/webp"));
    config.put("maxFileSizeMB", 5);
    config.put("bookingAdvanceDays", 30);
    return ResponseEntity.ok(config);
}
```

**Report note:** "While Code-on-Demand is optional, our API exposes a `/config` endpoint that delivers dynamic configuration rules to the React client, allowing server-driven validation constraints without client redeployment."

---

### 4.1 URL Naming Conventions

```
BASE URL: /api/v1/

RESOURCES (plural nouns):
  /api/resources
  /api/bookings
  /api/tickets
  /api/notifications
  /api/users

SUB-RESOURCES:
  /api/resources/{id}/availability     ← resource availability
  /api/tickets/{id}/attachments        ← ticket files
  /api/tickets/{id}/comments           ← ticket comments

ACTIONS (use PATCH with verb as path segment — never in main URL):
  PATCH /api/bookings/{id}/approve     ← admin approves
  PATCH /api/bookings/{id}/reject      ← admin rejects
  PATCH /api/bookings/{id}/cancel      ← user cancels
  PATCH /api/tickets/{id}/assign       ← assign technician
  PATCH /api/tickets/{id}/resolve      ← mark resolved

FILTERING / SEARCHING (query params):
  GET /api/resources?type=LAB&capacity=20&location=Block-A
  GET /api/bookings?status=PENDING&from=2026-04-01&to=2026-04-30
  GET /api/tickets?status=OPEN&priority=HIGH
  GET /api/tickets?assignedTo=me
```

---

### 4.2 HTTP Status Code Reference

```
2xx SUCCESS:
  200 OK           → GET (with body), PUT update, PATCH action
  201 Created      → POST (include Location header)
  204 No Content   → DELETE success, PATCH with no response body

4xx CLIENT ERRORS:
  400 Bad Request  → Validation failed (include field errors)
  401 Unauthorized → No token or invalid token
  403 Forbidden    → Valid token but wrong role
  404 Not Found    → Resource/booking/ticket doesn't exist
  409 Conflict     → Booking time overlap

5xx SERVER ERRORS:
  500 Internal Server Error → Unexpected server error
```

---

### 4.3 Global Exception Handler

```java
// exception/GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 404 — resource not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiError.of("NOT_FOUND", ex.getMessage()));
    }

    // 409 — booking conflict
    @ExceptionHandler(BookingConflictException.class)
    public ResponseEntity<ApiError> handleConflict(BookingConflictException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiError.of("BOOKING_CONFLICT", ex.getMessage()));
    }

    // 400 — validation errors
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
            .forEach(e -> errors.put(e.getField(), e.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ApiError.builder()
                .code("VALIDATION_ERROR")
                .message("Input validation failed")
                .fieldErrors(errors)
                .build());
    }

    // 403 — access denied
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ApiError.of("ACCESS_DENIED", "You don't have permission to access this resource"));
    }

    // 500 — catch-all
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiError.of("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}
```

```java
// ApiError.java — Standard error response
@Data @Builder
public class ApiError {
    private String code;
    private String message;
    private Map<String, String> fieldErrors;
    private LocalDateTime timestamp = LocalDateTime.now();

    public static ApiError of(String code, String message) {
        return ApiError.builder().code(code).message(message).build();
    }
}
```

---

## 5. Complete API Endpoint Reference (All 4 Members)

### Member 1 — Facilities & Assets Catalogue

| Method | Endpoint | Auth | Role | Description | Status Codes |
|--------|----------|------|------|-------------|-------------|
| `GET` | `/api/resources` | Optional | ANY | List all resources with search/filter | 200 |
| `GET` | `/api/resources/{id}` | Optional | ANY | Get single resource details | 200, 404 |
| `POST` | `/api/resources` | Required | ADMIN | Create new resource | 201, 400, 403 |
| `PUT` | `/api/resources/{id}` | Required | ADMIN | Full update of resource | 200, 400, 404 |
| `PATCH` | `/api/resources/{id}/status` | Required | ADMIN | Change status (ACTIVE/OUT_OF_SERVICE) | 200, 404 |
| `DELETE` | `/api/resources/{id}` | Required | ADMIN | Delete resource | 204, 404 |
| `GET` | `/api/resources/{id}/availability` | Required | USER | Check availability for date range | 200, 404 |
| `GET` | `/api/resources/types` | Optional | ANY | Get all resource types (enum) | 200 |

**Query params for `GET /api/resources`:**
```
?type=LAB&capacity=20&location=Block-A&status=ACTIVE&page=0&size=10&sort=name,asc
```

**CreateResourceRequest.java:**
```java
@Data
public class CreateResourceRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 3, max = 100)
    private String name;

    @NotNull(message = "Type is required")
    private ResourceType type;            // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    private String description;

    @NotNull
    private ResourceStatus status;        // ACTIVE, OUT_OF_SERVICE

    // Availability windows e.g. [{"dayOfWeek":"MONDAY","startTime":"08:00","endTime":"18:00"}]
    private List<AvailabilityWindow> availabilityWindows;
}
```

---

### Member 2 — Booking Workflow & Conflict Detection

| Method | Endpoint | Auth | Role | Description | Status Codes |
|--------|----------|------|------|-------------|-------------|
| `POST` | `/api/bookings` | Required | USER | Create booking request | 201, 400, 409 |
| `GET` | `/api/bookings` | Required | ADMIN | Get ALL bookings (with filters) | 200, 403 |
| `GET` | `/api/bookings/my` | Required | USER | Get current user's bookings | 200 |
| `GET` | `/api/bookings/{id}` | Required | USER/ADMIN | Get single booking | 200, 403, 404 |
| `PATCH` | `/api/bookings/{id}/approve` | Required | ADMIN | Approve booking | 200, 403, 404 |
| `PATCH` | `/api/bookings/{id}/reject` | Required | ADMIN | Reject booking with reason | 200, 400, 403 |
| `PATCH` | `/api/bookings/{id}/cancel` | Required | USER | Cancel own approved booking | 200, 403, 404 |
| `GET` | `/api/resources/{id}/bookings` | Optional | ANY | Get bookings for a resource (public calendar) | 200 |

**Conflict Detection Logic:**
```java
// BookingRepository.java — ✅ MongoRepository instead of JpaRepository
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // MongoDB conflict query using @Query with JSON syntax
    @Query("""
        {
          'resourceId': ?0,
          'status': { $in: ['PENDING', 'APPROVED'] },
          'startTime': { $lt: ?2 },
          'endTime':   { $gt: ?1 }
        }
    """)
    List<Booking> findConflictingBookings(
        String resourceId,
        LocalDateTime startTime,
        LocalDateTime endTime
    );

    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Booking> findByResourceIdAndStatusIn(String resourceId, List<BookingStatus> statuses);
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);
}
```

```java
// BookingServiceImpl.java — conflict check before save
public BookingResponse createBooking(CreateBookingRequest request, String userId) {
    // 1. Validate resource exists and is ACTIVE
    CampusResource resource = resourceRepository.findById(request.getResourceId())
        .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

    if (resource.getStatus() != ResourceStatus.ACTIVE) {
        throw new IllegalStateException("Resource is not available for booking");
    }

    // 2. Check for time conflicts — return 409 if conflict found
    boolean hasConflict = bookingRepository.existsConflict(
        request.getResourceId(),
        request.getStartTime(),
        request.getEndTime(),
        null
    );
    if (hasConflict) {
        throw new BookingConflictException(
            "The resource is already booked for this time period"
        );
    }

    // 3. Validate booking time is in future
    if (request.getStartTime().isBefore(LocalDateTime.now())) {
        throw new IllegalArgumentException("Booking start time must be in the future");
    }

    // 4. Create booking with PENDING status
    Booking booking = Booking.builder()
        .id(UUID.randomUUID().toString())
        .resourceId(request.getResourceId())
        .userId(userId)
        .startTime(request.getStartTime())
        .endTime(request.getEndTime())
        .purpose(request.getPurpose())
        .expectedAttendees(request.getExpectedAttendees())
        .status(BookingStatus.PENDING)
        .createdAt(LocalDateTime.now())
        .build();

    Booking saved = bookingRepository.save(booking);

    // 5. Send notification to admins
    notificationService.createNotification(
        NotificationEvent.BOOKING_REQUESTED,
        "New booking request for " + resource.getName(),
        userId
    );

    return BookingResponse.from(saved);
}
```

---

### Member 3 — Incident Tickets, Attachments & Technician Updates

| Method | Endpoint | Auth | Role | Description | Status Codes |
|--------|----------|------|------|-------------|-------------|
| `POST` | `/api/tickets` | Required | USER | Create incident ticket | 201, 400 |
| `GET` | `/api/tickets` | Required | ADMIN/TECH | Get all tickets (with filters) | 200, 403 |
| `GET` | `/api/tickets/my` | Required | USER | Get own tickets | 200 |
| `GET` | `/api/tickets/{id}` | Required | USER/ADMIN | Get single ticket | 200, 403, 404 |
| `PUT` | `/api/tickets/{id}` | Required | USER | Update own OPEN ticket | 200, 400, 403 |
| `PATCH` | `/api/tickets/{id}/status` | Required | ADMIN/TECH | Change ticket status | 200, 400 |
| `PATCH` | `/api/tickets/{id}/assign` | Required | ADMIN | Assign technician | 200, 404 |
| `DELETE` | `/api/tickets/{id}` | Required | ADMIN | Delete ticket | 204, 403 |
| `POST` | `/api/tickets/{id}/attachments` | Required | USER | Upload image attachment (max 3) | 201, 400 |
| `GET` | `/api/tickets/{id}/attachments` | Required | USER | List ticket attachments | 200, 404 |
| `DELETE` | `/api/tickets/{id}/attachments/{attachId}` | Required | USER/ADMIN | Delete attachment | 204, 403 |
| `POST` | `/api/tickets/{id}/comments` | Required | USER/TECH | Add comment | 201, 400 |
| `GET` | `/api/tickets/{id}/comments` | Required | USER | Get all comments | 200 |
| `PUT` | `/api/tickets/{id}/comments/{commentId}` | Required | USER | Edit own comment | 200, 403 |
| `DELETE` | `/api/tickets/{id}/comments/{commentId}` | Required | USER/ADMIN | Delete comment | 204, 403 |

**File Upload Controller:**
```java
// TicketController.java — attachment upload
@PostMapping("/{id}/attachments")
public ResponseEntity<AttachmentResponse> uploadAttachment(
        @PathVariable String id,
        @RequestParam("file") MultipartFile file,
        @AuthenticationPrincipal CustomUserDetails userDetails) {

    // Validate file type — only images allowed
    String contentType = file.getContentType();
    if (!List.of("image/jpeg", "image/png", "image/webp").contains(contentType)) {
        throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are allowed");
    }

    // Max 3 attachments per ticket
    long currentCount = attachmentRepository.countByTicketId(id);
    if (currentCount >= 3) {
        throw new IllegalStateException("Maximum 3 attachments allowed per ticket");
    }

    AttachmentResponse response = ticketService.uploadAttachment(id, file, userDetails.getId());
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}
```

---

### Member 4 — Notifications, Roles & OAuth

| Method | Endpoint | Auth | Role | Description | Status Codes |
|--------|----------|------|------|-------------|-------------|
| `GET` | `/api/notifications` | Required | USER | Get own notifications | 200 |
| `GET` | `/api/notifications/unread-count` | Required | USER | Get unread count | 200 |
| `PATCH` | `/api/notifications/{id}/read` | Required | USER | Mark single notification read | 200, 404 |
| `PATCH` | `/api/notifications/read-all` | Required | USER | Mark all as read | 200 |
| `DELETE` | `/api/notifications/{id}` | Required | USER | Delete notification | 204, 403 |
| `GET` | `/api/users` | Required | ADMIN | List all users | 200, 403 |
| `GET` | `/api/users/{id}` | Required | ADMIN | Get user details | 200, 403 |
| `PATCH` | `/api/users/{id}/role` | Required | ADMIN | Change user role | 200, 400, 403 |
| `GET` | `/api/users/me` | Required | ANY | Get own profile | 200 |
| `GET` | `/oauth2/callback/google` | — | — | Google OAuth callback | — |
| `POST` | `/api/auth/refresh` | Required | ANY | Refresh JWT token | 200, 401 |
| `GET` | `/api/config` | Optional | ANY | Get client config (Code on Demand) | 200 |

---

## 6. Backend Implementation Patterns

### 6.1 Document Base Class (MongoDB)

```java
// common/BaseDocument.java — all MongoDB documents extend this
// ✅ MongoDB uses @Document instead of @Entity, @Id is String (ObjectId)
@Data
public abstract class BaseDocument {

    @Id
    private String id;                    // MongoDB ObjectId as String

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

> **Key MongoDB differences from JPA:**
> - Use `@Document` instead of `@Entity`
> - Use `@Id` on a `String` field — MongoDB generates ObjectId automatically
> - Use `MongoRepository` instead of `JpaRepository`
> - No `@Column`, no `@Table` — use `@Field("field_name")` to rename fields
> - Embed sub-documents with `@DBRef` (reference) or directly (embedded)
> - Use `@Indexed` for fields you query frequently

### 6.2 CampusResource Document (Member 1)

```java
// ✅ @Document replaces @Entity — collection name = MongoDB collection
@Document(collection = "campus_resources")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CampusResource extends BaseDocument {

    @Indexed                                  // Fast search by name
    private String name;

    @Indexed
    private String type;                      // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT

    private Integer capacity;

    @Indexed
    private String location;

    private String description;

    private ResourceStatus status = ResourceStatus.ACTIVE;

    // ✅ MongoDB embeds sub-documents natively — no join table needed
    private List<AvailabilityWindow> availabilityWindows = new ArrayList<>();
}
```

### 6.3 Booking Document (Member 2)

```java
@Document(collection = "bookings")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Booking extends BaseDocument {

    @Indexed
    private String resourceId;               // Reference to CampusResource._id

    @Indexed
    private String userId;                   // Reference to User._id

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private Integer expectedAttendees;

    private BookingStatus status = BookingStatus.PENDING;

    private String rejectionReason;
    private String approvedByUserId;
    private LocalDateTime approvedAt;
}
```

### 6.4 Ticket Document (Member 3)

```java
@Document(collection = "tickets")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Ticket extends BaseDocument {

    @Indexed
    private String userId;                   // Reporter

    private String resourceId;              // Affected resource (optional)

    private String title;
    private String description;
    private String category;               // ELECTRICAL, PLUMBING, IT, FURNITURE, OTHER

    private TicketPriority priority = TicketPriority.MEDIUM;

    @Indexed
    private TicketStatus status = TicketStatus.OPEN;

    private String assignedTechnicianId;
    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private String rejectionReason;
    private String preferredContact;

    // ✅ Attachments and comments embedded directly — no join tables
    private List<TicketAttachment> attachments = new ArrayList<>();
    private List<TicketComment> comments = new ArrayList<>();
}
```
    @OrderBy("createdAt ASC")
    private List<TicketComment> comments = new ArrayList<>();
}
```

### 6.5 Notification Document (Member 4)

```java
@Document(collection = "notifications")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Notification extends BaseDocument {

    @Indexed
    private String userId;                   // Recipient

    private String title;
    private String message;

    private String type;                     // BOOKING_APPROVED, TICKET_UPDATED, etc.
    private String referenceId;              // bookingId or ticketId
    private String referenceType;            // "BOOKING" or "TICKET"
    private boolean read = false;
    private LocalDateTime readAt;
}
```

### 6.6 Paginated Response Wrapper

```java
// common/PageResponse.java
@Data @Builder
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean last;

    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
            .content(page.getContent())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .build();
    }
}
```

---

## 7. Frontend — React Architecture

### 7.1 Architecture Overview

We use a **feature-based architecture** (also called domain-driven structure). Each module owns its components, hooks, services, and types.

```
Pattern: Feature-Sliced Design
──────────────────────────────
Each feature (resource, booking, ticket, notification) is self-contained:
  feature/
    ├── components/     ← UI components for this feature
    ├── hooks/          ← Custom React hooks (data fetching, logic)
    ├── services/       ← API calls for this feature
    ├── types/          ← TypeScript-style prop types
    └── pages/          ← Full page components
```

### 7.2 State Management Strategy

| Layer | Tool | Purpose |
|-------|------|---------|
| Server State | `React Query (TanStack Query)` | API data fetching, caching, sync |
| Global Client State | `Zustand` | Auth state, user info, notifications |
| Local Component State | `useState / useReducer` | Forms, UI toggles |
| URL State | `React Router v6` | Page navigation, filters in URL |

### 7.3 Data Flow

```
User Interaction
      │
      ▼
React Component
      │ calls
      ▼
Custom Hook (useBookings, useTickets)
      │ uses
      ▼
React Query (useQuery / useMutation)
      │ calls
      ▼
API Service (bookingService.js)
      │ axios request
      ▼
Spring Boot API (:8080)
      │ response
      ▼
React Query Cache ──── auto-updates UI
```

---

## 8. Frontend Folder Structure

```
smart-campus-client/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.jsx                           # React entry point
│   ├── App.jsx                            # Root with Router + QueryClient
│   │
│   ├── config/
│   │   ├── axios.js                       # Axios instance with JWT interceptor
│   │   └── queryClient.js                 # React Query configuration
│   │
│   ├── lib/
│   │   └── utils.js                       # ShadCN utility (cn function)
│   │
│   ├── store/
│   │   └── authStore.js                   # Zustand auth state
│   │
│   ├── components/
│   │   ├── ui/                            # ShadCN generated components
│   │   │   ├── button.jsx
│   │   │   ├── input.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── table.jsx
│   │   │   ├── select.jsx
│   │   │   ├── textarea.jsx
│   │   │   ├── toast.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   ├── avatar.jsx
│   │   │   └── skeleton.jsx
│   │   │
│   │   └── shared/                        # Shared layout/UI components
│   │       ├── Layout.jsx                 # App shell with sidebar + header
│   │       ├── Sidebar.jsx                # Navigation sidebar
│   │       ├── Header.jsx                 # Top bar with notifications + avatar
│   │       ├── NotificationBell.jsx       # Bell icon + dropdown panel
│   │       ├── ProtectedRoute.jsx         # Role-based route guard
│   │       ├── LoadingSpinner.jsx
│   │       ├── EmptyState.jsx
│   │       ├── ErrorBoundary.jsx
│   │       ├── StatusBadge.jsx            # Reusable status badge (PENDING, etc.)
│   │       ├── ConfirmDialog.jsx          # Reusable confirm modal
│   │       └── PageHeader.jsx             # Page title + action buttons
│   │
│   ├── features/
│   │   │
│   │   ├── auth/                          # Member 4 — Authentication
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.jsx          # Google OAuth login page
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.js
│   │   │   └── services/
│   │   │       └── authService.js
│   │   │
│   │   ├── resources/                     # Member 1 — Facilities
│   │   │   ├── pages/
│   │   │   │   ├── ResourceListPage.jsx   # Browse + search resources
│   │   │   │   ├── ResourceDetailPage.jsx # Single resource + book button
│   │   │   │   └── ResourceManagePage.jsx # Admin CRUD (admin only)
│   │   │   ├── components/
│   │   │   │   ├── ResourceCard.jsx       # Resource card in grid
│   │   │   │   ├── ResourceForm.jsx       # Create/Edit form
│   │   │   │   ├── ResourceFilters.jsx    # Type, capacity, location filters
│   │   │   │   ├── AvailabilityCalendar.jsx
│   │   │   │   └── ResourceStatusBadge.jsx
│   │   │   ├── hooks/
│   │   │   │   ├── useResources.js        # useQuery for list
│   │   │   │   └── useResource.js         # useQuery for single
│   │   │   └── services/
│   │   │       └── resourceService.js
│   │   │
│   │   ├── bookings/                      # Member 2 — Bookings
│   │   │   ├── pages/
│   │   │   │   ├── BookingListPage.jsx    # User: my bookings
│   │   │   │   ├── BookingDetailPage.jsx  # Booking details
│   │   │   │   ├── CreateBookingPage.jsx  # Booking form
│   │   │   │   └── AdminBookingsPage.jsx  # Admin: all bookings
│   │   │   ├── components/
│   │   │   │   ├── BookingCard.jsx
│   │   │   │   ├── BookingForm.jsx        # Date, time, purpose form
│   │   │   │   ├── BookingTimeline.jsx    # Status workflow visual
│   │   │   │   ├── ConflictWarning.jsx    # Shown when time conflict detected
│   │   │   │   └── ApproveRejectPanel.jsx # Admin action panel
│   │   │   ├── hooks/
│   │   │   │   ├── useBookings.js
│   │   │   │   └── useCreateBooking.js
│   │   │   └── services/
│   │   │       └── bookingService.js
│   │   │
│   │   ├── tickets/                       # Member 3 — Incident Tickets
│   │   │   ├── pages/
│   │   │   │   ├── TicketListPage.jsx     # User: my tickets
│   │   │   │   ├── TicketDetailPage.jsx   # Full ticket + comments + attachments
│   │   │   │   ├── CreateTicketPage.jsx   # New ticket form
│   │   │   │   └── AdminTicketsPage.jsx   # Admin/Tech: all tickets
│   │   │   ├── components/
│   │   │   │   ├── TicketCard.jsx
│   │   │   │   ├── TicketForm.jsx
│   │   │   │   ├── TicketStatusFlow.jsx   # Visual workflow steps
│   │   │   │   ├── AttachmentUploader.jsx # Drag & drop image upload
│   │   │   │   ├── AttachmentGallery.jsx  # Image preview grid
│   │   │   │   ├── CommentThread.jsx      # Comments with edit/delete
│   │   │   │   ├── CommentInput.jsx       # New comment input
│   │   │   │   └── TechnicianAssign.jsx   # Admin: assign dropdown
│   │   │   ├── hooks/
│   │   │   │   ├── useTickets.js
│   │   │   │   └── useTicketActions.js
│   │   │   └── services/
│   │   │       └── ticketService.js
│   │   │
│   │   ├── notifications/                 # Member 4 — Notifications
│   │   │   ├── components/
│   │   │   │   ├── NotificationList.jsx
│   │   │   │   └── NotificationItem.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useNotifications.js
│   │   │   └── services/
│   │   │       └── notificationService.js
│   │   │
│   │   └── admin/                         # Member 4 — Admin features
│   │       ├── pages/
│   │       │   ├── AdminDashboard.jsx     # Analytics + quick stats
│   │       │   └── UserManagePage.jsx     # User role management
│   │       └── components/
│   │           ├── StatsCard.jsx
│   │           └── UserTable.jsx
│   │
│   └── routes/
│       └── index.jsx                      # All route definitions
│
├── index.html
├── vite.config.js
├── tailwind.config.js
├── components.json                        # ShadCN config
└── package.json
```

---

## 9. ShadCN UI + Tailwind CSS Integration

### 9.1 Setup

```bash
# 1. Create React app with Vite
npm create vite@latest smart-campus-client -- --template react
cd smart-campus-client

# 2. Install dependencies
npm install

# 3. Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Install ShadCN prerequisites
npm install class-variance-authority clsx tailwind-merge lucide-react

# 5. Initialize ShadCN
npx shadcn@latest init
# Choose: Default style, Slate base color, CSS variables: Yes

# 6. Install ShadCN components you need
npx shadcn@latest add button card input label select textarea
npx shadcn@latest add badge dialog alert-dialog
npx shadcn@latest add table dropdown-menu avatar
npx shadcn@latest add toast skeleton tabs
npx shadcn@latest add form  # For react-hook-form integration

# 7. Install React ecosystem
npm install react-router-dom @tanstack/react-query axios
npm install zustand
npm install react-hook-form @hookform/resolvers zod
npm install date-fns react-day-picker   # For date picking
```

### 9.2 tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### 9.3 Axios Instance with JWT Interceptor

```javascript
// config/axios.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT automatically
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 9.4 Auth Store (Zustand)

```javascript
// store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),

      isAdmin: () => useAuthStore.getState().user?.role === 'ADMIN',
      isTechnician: () => useAuthStore.getState().user?.role === 'TECHNICIAN',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

### 9.5 Protected Route Component

```jsx
// components/shared/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
```

### 9.6 React Query Setup

```javascript
// config/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 9.7 Example Feature Hook (Resources)

```javascript
// features/resources/hooks/useResources.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../services/resourceService';
import { toast } from '../../../components/ui/use-toast';

export const RESOURCE_KEYS = {
  all: ['resources'],
  list: (filters) => ['resources', 'list', filters],
  detail: (id) => ['resources', id],
};

export function useResources(filters = {}) {
  return useQuery({
    queryKey: RESOURCE_KEYS.list(filters),
    queryFn: () => resourceService.getAll(filters),
  });
}

export function useResource(id) {
  return useQuery({
    queryKey: RESOURCE_KEYS.detail(id),
    queryFn: () => resourceService.getById(id),
    enabled: !!id,
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resourceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESOURCE_KEYS.all });
      toast({ title: "Resource created successfully!" });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create resource",
        variant: "destructive",
      });
    },
  });
}
```

### 9.8 Example Page Component

```jsx
// features/resources/pages/ResourceListPage.jsx
import { useState } from 'react';
import { useResources } from '../hooks/useResources';
import { ResourceCard } from '../components/ResourceCard';
import { ResourceFilters } from '../components/ResourceFilters';
import { PageHeader } from '../../../components/shared/PageHeader';
import { Button } from '../../../components/ui/button';
import { Skeleton } from '../../../components/ui/skeleton';
import { EmptyState } from '../../../components/shared/EmptyState';
import { useAuthStore } from '../../../store/authStore';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ResourceListPage() {
  const [filters, setFilters] = useState({});
  const { data, isLoading, isError } = useResources(filters);
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Resources"
        description="Browse and book available facilities and equipment"
        action={
          isAdmin && (
            <Button onClick={() => navigate('/admin/resources/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          )
        }
      />

      <ResourceFilters value={filters} onChange={setFilters} />

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          title="Failed to load resources"
          description="Please try again later"
        />
      )}

      {data?.content?.length === 0 && (
        <EmptyState
          title="No resources found"
          description="Try adjusting your filters"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.content?.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </div>
  );
}
```

---

## 10. UI/UX Design System

### 10.1 Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Clarity** | Clear labels, helper text, immediate feedback |
| **Consistency** | Same patterns for all CRUD operations |
| **Feedback** | Toast notifications for every action |
| **Accessibility** | ARIA labels, keyboard nav, focus management |
| **Responsiveness** | Mobile-first with Tailwind breakpoints |

### 10.2 Colour Semantic System

```jsx
// Status badge colours — use consistently everywhere
const STATUS_STYLES = {
  // Booking statuses
  PENDING:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  APPROVED:  "bg-green-100 text-green-800 border-green-200",
  REJECTED:  "bg-red-100 text-red-800 border-red-200",
  CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",

  // Ticket statuses
  OPEN:        "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-200",
  RESOLVED:    "bg-green-100 text-green-800 border-green-200",
  CLOSED:      "bg-gray-100 text-gray-800 border-gray-200",

  // Resource statuses
  ACTIVE:          "bg-green-100 text-green-800 border-green-200",
  OUT_OF_SERVICE:  "bg-red-100 text-red-800 border-red-200",
};

// Priority badge colours
const PRIORITY_STYLES = {
  LOW:      "bg-gray-100 text-gray-700",
  MEDIUM:   "bg-blue-100 text-blue-700",
  HIGH:     "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};
```

### 10.3 Reusable StatusBadge Component

```jsx
// components/shared/StatusBadge.jsx
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

const STATUS_STYLES = {
  PENDING:        "bg-yellow-100 text-yellow-800 border border-yellow-200",
  APPROVED:       "bg-green-100 text-green-800 border border-green-200",
  REJECTED:       "bg-red-100 text-red-800 border border-red-200",
  CANCELLED:      "bg-slate-100 text-slate-700 border border-slate-200",
  OPEN:           "bg-blue-100 text-blue-800 border border-blue-200",
  IN_PROGRESS:    "bg-violet-100 text-violet-800 border border-violet-200",
  RESOLVED:       "bg-emerald-100 text-emerald-800 border border-emerald-200",
  CLOSED:         "bg-slate-100 text-slate-600 border border-slate-200",
  ACTIVE:         "bg-green-100 text-green-800 border border-green-200",
  OUT_OF_SERVICE: "bg-red-100 text-red-700 border border-red-200",
};

export function StatusBadge({ status, className }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      STATUS_STYLES[status] || "bg-gray-100 text-gray-700",
      className
    )}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}
```

### 10.4 Page Layout Pattern

```jsx
// components/shared/Layout.jsx
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from '../ui/toaster';

export function Layout({ children }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
```

### 10.5 UX Patterns to Score 7-10 Marks in UI/UX

1. **Loading skeletons** — never show empty screens while loading
2. **Optimistic updates** — immediately update UI before API confirms
3. **Inline validation** — show field errors as user types (react-hook-form + zod)
4. **Toast notifications** — every create/update/delete action has feedback
5. **Confirmation dialogs** — before destructive actions (delete, reject)
6. **Empty states** — informative messages when lists are empty
7. **Error boundaries** — graceful error screens, not white crashes
8. **Responsive design** — works on mobile, tablet, desktop

---

## 11. Authentication — OAuth 2.0 + JWT

### 11.1 Spring Security Configuration (Member 4)

```java
// config/SecurityConfig.java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final OAuth2SuccessHandler oAuth2SuccessHandler;
    private final CustomUserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/oauth2/**", "/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/resources", "/api/resources/**").permitAll()
                .requestMatchers("/api/config", "/api-docs/**", "/swagger-ui/**").permitAll()
                // Protected endpoints
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/resources").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/resources/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/resources/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oAuth2SuccessHandler)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
```

### 11.2 OAuth2 Success Handler

```java
// security/oauth2/OAuth2SuccessHandler.java
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        DefaultOidcUser oidcUser = (DefaultOidcUser) authentication.getPrincipal();

        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        String picture = oidcUser.getPicture();

        // Find or create user in our DB
        User user = userService.findOrCreateOAuthUser(email, name, picture);

        // Generate our own JWT with user's role
        String jwt = jwtTokenProvider.generateToken(
            user.getId(),
            user.getEmail(),
            user.getRole().name()
        );

        // Redirect to frontend with token
        String redirectUrl = frontendUrl + "/oauth2/callback?token=" + jwt;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
```

### 11.3 JWT Token Provider

```java
// security/JwtTokenProvider.java
@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration}")
    private long jwtExpiration;

    public String generateToken(String userId, String email, String role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpiration);

        return Jwts.builder()
            .subject(userId)
            .claim("email", email)
            .claim("role", role)
            .issuedAt(now)
            .expiration(expiry)
            .signWith(getSigningKey())
            .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUserIdFromToken(String token) {
        return Jwts.parser().verifyWith(getSigningKey()).build()
            .parseSignedClaims(token).getPayload().getSubject();
    }

    public String getRoleFromToken(String token) {
        return (String) Jwts.parser().verifyWith(getSigningKey()).build()
            .parseSignedClaims(token).getPayload().get("role");
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }
}
```

### 11.4 React OAuth Callback Handler

```jsx
// features/auth/pages/OAuthCallbackPage.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { authService } from '../services/authService';
import { LoadingSpinner } from '../../../components/shared/LoadingSpinner';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Decode the JWT to get user info (payload is base64 encoded)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    setAuth(user, token);
    navigate('/dashboard');
  }, []);

  return <LoadingSpinner message="Signing you in..." />;
}
```

---

## 12. Database Design — MongoDB

### 12.1 Why MongoDB for This Project

| Feature | MongoDB Advantage |
|---------|-----------------|
| Ticket with embedded comments + attachments | Store as one document — no joins needed |
| Flexible resource metadata | Add new fields (e.g., `equipmentSerialNo`) without schema migration |
| Availability windows | Native array of sub-documents |
| Notification feed | Simple append-only collection, perfect for document store |
| Development speed | No migrations, schema evolves naturally |

### 12.2 MongoDB Collections Overview

```
Database: smart_campus
│
├── users                     ← Member 4
│     { _id, email, name, role, picture, active, createdAt }
│
├── campus_resources          ← Member 1
│     { _id, name, type, capacity, location, description,
│       status, availabilityWindows: [...], createdAt }
│
├── bookings                  ← Member 2
│     { _id, resourceId, userId, startTime, endTime,
│       purpose, expectedAttendees, status,
│       rejectionReason, approvedByUserId, approvedAt, createdAt }
│
├── tickets                   ← Member 3
│     { _id, userId, resourceId, title, description,
│       category, priority, status,
│       assignedTechnicianId, resolutionNotes, resolvedAt,
│       attachments: [{ fileName, filePath, fileSize, contentType, uploadedBy }],
│       comments:    [{ commentId, userId, content, createdAt, updatedAt }],
│       createdAt }
│
└── notifications             ← Member 4
      { _id, userId, title, message, type,
        referenceId, referenceType, read, readAt, createdAt }
```

> **Key design decision:** Ticket `attachments` and `comments` are **embedded arrays** inside the ticket document — not separate collections. This is the MongoDB way. It means one query fetches the full ticket with all its comments and attachments — great for performance. The limit of 3 attachments is enforced in the service layer.

### 12.3 Sample MongoDB Documents

**campus_resources collection:**
```json
{
  "_id": "64a7f3b2c1d2e3f4a5b6c7d8",
  "name": "Lab A - Block 3",
  "type": "LAB",
  "capacity": 30,
  "location": "Block 3, Level 2",
  "description": "Computer lab with 30 workstations",
  "status": "ACTIVE",
  "availabilityWindows": [
    { "dayOfWeek": "MONDAY",    "startTime": "08:00", "endTime": "18:00" },
    { "dayOfWeek": "TUESDAY",   "startTime": "08:00", "endTime": "18:00" },
    { "dayOfWeek": "WEDNESDAY", "startTime": "08:00", "endTime": "18:00" }
  ],
  "createdAt": "2026-03-24T08:00:00",
  "updatedAt": "2026-03-24T08:00:00"
}
```

**tickets collection (with embedded arrays):**
```json
{
  "_id": "64b8g4c3d2e1f5a6b7c8d9e0",
  "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
  "resourceId": "64a7f3b2c1d2e3f4a5b6c7d8",
  "title": "Projector not working in Lab A",
  "description": "The projector fails to display output after 10 minutes of use.",
  "category": "IT",
  "priority": "HIGH",
  "status": "IN_PROGRESS",
  "assignedTechnicianId": "64c9d0e1f2a3b4c5d6e7f8a9",
  "resolutionNotes": null,
  "attachments": [
    {
      "attachmentId": "att001",
      "fileName": "projector-error.jpg",
      "filePath": "./uploads/tickets/64b8g4c3/projector-error.jpg",
      "fileSize": 245760,
      "contentType": "image/jpeg",
      "uploadedBy": "64a1b2c3d4e5f6a7b8c9d0e1",
      "uploadedAt": "2026-03-24T09:15:00"
    }
  ],
  "comments": [
    {
      "commentId": "cmt001",
      "userId": "64a1b2c3d4e5f6a7b8c9d0e1",
      "content": "This issue started after the last maintenance window.",
      "createdAt": "2026-03-24T09:20:00",
      "updatedAt": "2026-03-24T09:20:00"
    },
    {
      "commentId": "cmt002",
      "userId": "64c9d0e1f2a3b4c5d6e7f8a9",
      "content": "Investigating. Likely a thermal issue with the lamp.",
      "createdAt": "2026-03-24T10:05:00",
      "updatedAt": "2026-03-24T10:05:00"
    }
  ],
  "createdAt": "2026-03-24T09:10:00",
  "updatedAt": "2026-03-24T10:05:00"
}
```

### 12.4 MongoDB Indexes (Create These for Performance)

```java
// Add to your Spring Boot main class or a @Configuration
@Configuration
public class MongoIndexConfig {
    @Bean
    public MongoCustomConversions mongoCustomConversions() {
        return new MongoCustomConversions(Collections.emptyList());
    }
}

// OR define indexes directly on your @Document classes:

@Document(collection = "bookings")
@CompoundIndex(name = "resource_time_idx",
    def = "{'resourceId': 1, 'startTime': 1, 'endTime': 1, 'status': 1}")
public class Booking extends BaseDocument { ... }

@Document(collection = "tickets")
@CompoundIndex(name = "user_status_idx", def = "{'userId': 1, 'status': 1}")
public class Ticket extends BaseDocument { ... }

@Document(collection = "notifications")
@CompoundIndex(name = "user_read_idx", def = "{'userId': 1, 'read': 1}")
public class Notification extends BaseDocument { ... }
```

### 12.5 User Document (Member 4)

```java
@Document(collection = "users")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class User extends BaseDocument {

    @Indexed(unique = true)
    private String email;

    private String name;
    private String picture;                   // Google profile photo URL

    private UserRole role = UserRole.USER;    // USER, ADMIN, TECHNICIAN
    private boolean active = true;
}
```

### 12.6 Conflict Detection with MongoDB (Member 2)

```java
// BookingRepository.java
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    // MongoDB overlap query — finds any booking that overlaps the requested time window
    @Query("""
        {
          'resourceId': ?0,
          'status': { $in: ['PENDING', 'APPROVED'] },
          'startTime': { $lt: ?2 },
          'endTime':   { $gt: ?1 }
        }
    """)
    List<Booking> findConflicts(String resourceId,
                                LocalDateTime startTime,
                                LocalDateTime endTime);
}

// In BookingServiceImpl.java
boolean hasConflict = !bookingRepository
    .findConflicts(request.getResourceId(), request.getStartTime(), request.getEndTime())
    .isEmpty();

if (hasConflict) {
    throw new BookingConflictException(
        "Resource is already booked for the requested time period"
    );
}
```

---

## 13. GitHub Actions CI/CD Pipeline

### 13.1 `.github/workflows/ci.yml`

```yaml
name: Smart Campus CI Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # ── Backend Tests ───────────────────────────────────────────
  backend-test:
    name: Build & Test Spring Boot API
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: smart_campus_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: password
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: maven

      - name: Build with Maven
        working-directory: ./smart-campus-api
        run: mvn clean compile -q

      - name: Run unit tests
        working-directory: ./smart-campus-api
        run: mvn test
        env:
          SPRING_DATASOURCE_URL: jdbc:postgresql://localhost:5432/smart_campus_test
          SPRING_DATASOURCE_USERNAME: postgres
          SPRING_DATASOURCE_PASSWORD: password
          JWT_SECRET: test-secret-key-for-ci-pipeline-only
          GOOGLE_CLIENT_ID: test-client-id
          GOOGLE_CLIENT_SECRET: test-client-secret

      - name: Package application
        working-directory: ./smart-campus-api
        run: mvn package -DskipTests -q

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: backend-test-results
          path: smart-campus-api/target/surefire-reports/

  # ── Frontend Build ──────────────────────────────────────────
  frontend-build:
    name: Build React Application
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: smart-campus-client/package-lock.json

      - name: Install dependencies
        working-directory: ./smart-campus-client
        run: npm ci

      - name: Build React app
        working-directory: ./smart-campus-client
        run: npm run build
        env:
          VITE_API_URL: http://localhost:8080/api

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: frontend-build
          path: smart-campus-client/dist/
```

### 13.2 Branch Protection Rules (Set in GitHub Settings)

```
Protect branch: main
✅ Require pull request reviews before merging (1 reviewer)
✅ Require status checks to pass (backend-test, frontend-build)
✅ Require branches to be up to date before merging
✅ Require linear history
```

---

## 14. Team Member Responsibilities

### Member 1 — Facilities & Assets Catalogue

**Backend tasks:**
- `CampusResource` entity with all fields + `AvailabilityWindow` embedded entity
- `ResourceRepository` with custom JPQL for search/filter + `Specification` API
- `ResourceService` with full CRUD + availability checking
- `ResourceController` with 8 endpoints, proper status codes, pagination
- Input validation on all request DTOs

**Frontend tasks:**
- `ResourceListPage` with search, filter, sort, pagination
- `ResourceCard` component with status indicator
- `ResourceDetailPage` with availability calendar
- `ResourceForm` for admin create/edit
- `ResourceFilters` sidebar component
- `useResources` and `useResource` hooks

**Individual REST endpoints (minimum 4):**
1. `GET /api/resources` — search and filter
2. `POST /api/resources` — create resource
3. `PUT /api/resources/{id}` — update resource
4. `DELETE /api/resources/{id}` — delete resource

---

### Member 2 — Booking Workflow & Conflict Detection

**Backend tasks:**
- `Booking` entity with full workflow fields
- `BookingRepository` with conflict detection JPQL query
- `BookingService` with conflict checking, status transitions, validation
- `BookingController` with 8 endpoints including approve/reject/cancel actions
- Send notifications on status changes (call NotificationService)

**Frontend tasks:**
- `BookingListPage` with tab for pending/approved/rejected
- `CreateBookingPage` with date/time picker, real-time conflict feedback
- `BookingCard` with workflow status timeline
- `AdminBookingsPage` with approve/reject panel
- `ConflictWarning` component
- `useBookings` and `useCreateBooking` hooks

**Individual REST endpoints (minimum 4):**
1. `POST /api/bookings` — create booking (with conflict check)
2. `GET /api/bookings/my` — my bookings
3. `PATCH /api/bookings/{id}/approve` — approve
4. `PATCH /api/bookings/{id}/reject` — reject with reason

---

### Member 3 — Incident Tickets, Attachments & Technician Updates

**Backend tasks:**
- `Ticket`, `TicketAttachment`, `TicketComment` entities
- `TicketRepository`, `CommentRepository`, `AttachmentRepository`
- `TicketService` with status workflow, file upload, comment ownership
- `StorageService` for saving/deleting image files
- `TicketController` with 9 endpoints
- `CommentController` with 4 endpoints (CRUD with ownership check)

**Frontend tasks:**
- `TicketListPage` with priority and status filters
- `TicketDetailPage` with full thread view (comments + attachments + status)
- `AttachmentUploader` with drag-and-drop, preview, max 3 validation
- `CommentThread` with edit/delete own comments
- `TicketStatusFlow` visual progress indicator
- `TechnicianAssign` dropdown for admin
- `useTickets` and `useTicketActions` hooks

**Individual REST endpoints (minimum 4):**
1. `POST /api/tickets` — create ticket
2. `PATCH /api/tickets/{id}/status` — update status
3. `POST /api/tickets/{id}/attachments` — upload image
4. `POST /api/tickets/{id}/comments` — add comment
5. `DELETE /api/tickets/{id}/comments/{commentId}` — delete comment

---

### Member 4 — Notifications, Roles & OAuth

**Backend tasks:**
- `User`, `Notification` entities
- Full OAuth 2.0 Google login flow (SecurityConfig, OAuth2SuccessHandler)
- JWT generation, validation, and filter chain
- `NotificationService` with create/read/mark-read/delete
- `NotificationController` with 5 endpoints
- `UserController` for admin role management (4 endpoints)
- `NotificationService` integration called by other services

**Frontend tasks:**
- `LoginPage` with Google sign-in button
- `OAuthCallbackPage` handling the JWT redirect
- `NotificationBell` in header with unread count badge
- `NotificationList` dropdown panel
- `UserManagePage` for admin (table with role change)
- `AdminDashboard` with stats cards (total resources, pending bookings, open tickets)
- `useNotifications` hook with polling or refetch interval

**Individual REST endpoints (minimum 4):**
1. `GET /api/notifications` — get own notifications
2. `PATCH /api/notifications/{id}/read` — mark read
3. `PATCH /api/users/{id}/role` — change user role
4. `GET /api/users/me` — own profile

---

## 15. Marking Rubric Alignment

### How to Score "Excellent" in Every Category

#### Documentation (15 marks — Group)
✅ Include in report:
- System Architecture Diagram (the full stack diagram)
- REST API Architecture Diagram (layered: Controller→Service→Repository)
- React Component Tree Diagram
- Database ERD
- Endpoint Table (all endpoints with method, URL, auth, response codes)
- Test Evidence (Postman collection screenshots or JUnit test results)
- Team Contribution Table (who did what)
- Non-functional requirements (security, scalability, performance)

#### REST API (35 marks — Individual)
✅ Endpoint Naming (5): Use exact pattern `/api/resources`, `/api/resources/{id}`, PATCH actions
✅ 6 Constraints (10): Demonstrate all 6 in code AND explain in report
✅ HTTP Methods (10): GET, POST, PUT, PATCH, DELETE all used correctly with right status codes
✅ Code Quality (5): Lombok, proper naming, JavaDoc on service methods, clean indentation
✅ Requirements (5): Auth working, CRUD complete, validation on all inputs

#### React App (20 marks — Individual)
✅ Architecture (5): Feature-based structure, custom hooks, no logic in components
✅ Requirements (5): All module features working and connected to real API
✅ UI/UX (10): Loading states, error states, toast feedback, mobile responsive, status badges

#### Version Control (10 marks — Group)
✅ Git (5): Feature branches named `feature/<member>/<task>`, meaningful commit messages, PRs
✅ GitHub Actions (5): CI pipeline running, tests passing, build succeeding

#### Authentication (10 marks — Group)
✅ OAuth (10): Google login working, JWT issued, role-based access on both frontend and backend

#### Creativity (10 marks — Group)
✅ Choose 2-3 from Section 16

---

## 16. 🚀 Innovation Features (Optional Enhancements)

> **Marking:** Innovation is worth **10 marks (Group)**. Implementing 2–3 of these well scores 8–10.  
> Every option below is **fully optional** — complete your core requirements first, then pick what your team has time for.  
> Each option is self-contained: backend changes, frontend changes, and wiring instructions are all included.

---

### 🏆 Recommended Combination for Maximum Marks
Pick these three for the best effort-to-marks ratio:

| Priority | Option | Why |
|----------|--------|-----|
| ⭐ Must do | **A — Admin Dashboard** | Directly mentioned in assignment brief, visually impressive |
| ⭐ Must do | **B — Booking Calendar** | Solves a real UX problem, interviewers love it |
| ✨ Nice to have | **C — QR Check-in** | Unique, memorable, mentioned explicitly in assignment |

---

<details>
<summary><strong>✅ Option A — Admin Analytics Dashboard</strong> &nbsp;|&nbsp; Effort: Medium &nbsp;|&nbsp; Impact: High</summary>

### What It Is
A dedicated `/admin/dashboard` page showing live statistics pulled from MongoDB aggregation pipelines. Gives admins an instant overview without browsing individual lists.

### What to Show
| Card / Chart | Data | Type |
|-------------|------|------|
| Total resources | Count by status (Active / Out of Service) | Stat cards |
| Bookings this month | Count by status (Pending / Approved / Rejected) | Donut chart |
| Most booked resources | Top 5 resources by booking count | Horizontal bar chart |
| Open tickets | Count by priority (Low / Medium / High / Critical) | Stacked bar |
| Booking trend | Bookings per day last 30 days | Line chart |
| Pending approvals | Live count with link to list | Stat card + badge |

### Backend — New Endpoint

```java
// admin/AdminStatsController.java
@RestController
@RequestMapping("/api/admin/stats")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminStatsController {

    private final MongoTemplate mongoTemplate;

    @GetMapping
    public ResponseEntity<AdminStatsResponse> getStats() {

        // Booking counts by status
        Aggregation bookingAgg = Aggregation.newAggregation(
            Aggregation.group("status").count().as("count")
        );
        AggregationResults<StatusCount> bookingCounts =
            mongoTemplate.aggregate(bookingAgg, "bookings", StatusCount.class);

        // Ticket counts by priority
        Aggregation ticketAgg = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("status").ne("CLOSED")),
            Aggregation.group("priority").count().as("count")
        );
        AggregationResults<StatusCount> ticketCounts =
            mongoTemplate.aggregate(ticketAgg, "tickets", StatusCount.class);

        // Top 5 most booked resources
        Aggregation topResourcesAgg = Aggregation.newAggregation(
            Aggregation.match(Criteria.where("status").is("APPROVED")),
            Aggregation.group("resourceId").count().as("bookingCount"),
            Aggregation.sort(Sort.by(Sort.Direction.DESC, "bookingCount")),
            Aggregation.limit(5)
        );
        AggregationResults<ResourceBookingCount> topResources =
            mongoTemplate.aggregate(topResourcesAgg, "bookings", ResourceBookingCount.class);

        // Total counts
        long totalResources  = mongoTemplate.count(new Query(), "campus_resources");
        long pendingBookings = mongoTemplate.count(
            Query.query(Criteria.where("status").is("PENDING")), "bookings");
        long openTickets     = mongoTemplate.count(
            Query.query(Criteria.where("status").in("OPEN", "IN_PROGRESS")), "tickets");

        return ResponseEntity.ok(AdminStatsResponse.builder()
            .totalResources(totalResources)
            .pendingBookings(pendingBookings)
            .openTickets(openTickets)
            .bookingsByStatus(bookingCounts.getMappedResults())
            .ticketsByPriority(ticketCounts.getMappedResults())
            .topBookedResources(topResources.getMappedResults())
            .build());
    }
}
```

### Frontend — Dashboard Page

```bash
npm install recharts
```

```jsx
// features/admin/pages/AdminDashboard.jsx
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
         XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import api from '../../../config/axios';

const COLORS = {
  PENDING: '#f59e0b', APPROVED: '#10b981', REJECTED: '#ef4444',
  OPEN: '#3b82f6', IN_PROGRESS: '#8b5cf6', RESOLVED: '#10b981',
  LOW: '#94a3b8', MEDIUM: '#3b82f6', HIGH: '#f97316', CRITICAL: '#ef4444',
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
    refetchInterval: 30000,   // Refresh every 30 seconds
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Resources"  value={stats.totalResources}  color="blue" />
        <StatCard label="Pending Bookings" value={stats.pendingBookings} color="amber" />
        <StatCard label="Open Tickets"     value={stats.openTickets}     color="red" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookings by Status — Donut */}
        <Card>
          <CardHeader><CardTitle>Bookings by Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats.bookingsByStatus} dataKey="count" nameKey="_id"
                     innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {stats.bookingsByStatus.map((entry) => (
                    <Cell key={entry._id} fill={COLORS[entry._id] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Booked Resources — Horizontal Bar */}
        <Card>
          <CardHeader><CardTitle>Top 5 Most Booked</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.topBookedResources} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="_id" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="bookingCount" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = { blue: 'text-blue-600 bg-blue-50', amber: 'text-amber-600 bg-amber-50',
                   red: 'text-red-600 bg-red-50' };
  return (
    <Card>
      <CardContent className="pt-6">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 ${colors[color]}`}>
          <span className="text-xl font-bold">{value}</span>
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
```

### Route to Add
```jsx
// In routes/index.jsx — protected ADMIN only
<Route path="/admin/dashboard" element={
  <ProtectedRoute requiredRole="ADMIN">
    <AdminDashboard />
  </ProtectedRoute>
} />
```

</details>

---

<details>
<summary><strong>✅ Option B — Booking Calendar View</strong> &nbsp;|&nbsp; Effort: Low–Medium &nbsp;|&nbsp; Impact: High</summary>

### What It Is
A visual monthly/weekly calendar on each resource's detail page showing approved bookings as coloured blocks. Users can see at a glance when a resource is free before submitting a booking request.

### Backend — New Endpoint (Member 2 adds this)

```java
// Add to BookingController.java
@GetMapping("/calendar")
public ResponseEntity<List<CalendarEventResponse>> getCalendarEvents(
        @RequestParam String resourceId,
        @RequestParam @DateTimeFormat(iso = ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = ISO.DATE) LocalDate to) {

    List<Booking> bookings = bookingRepository.findByResourceIdAndStatusInAndStartTimeBetween(
        resourceId,
        List.of(BookingStatus.APPROVED, BookingStatus.PENDING),
        from.atStartOfDay(),
        to.plusDays(1).atStartOfDay()
    );

    List<CalendarEventResponse> events = bookings.stream()
        .map(b -> CalendarEventResponse.builder()
            .id(b.getId())
            .title(b.getStatus() == BookingStatus.APPROVED ? "Booked" : "Pending")
            .start(b.getStartTime().toString())
            .end(b.getEndTime().toString())
            .backgroundColor(b.getStatus() == BookingStatus.APPROVED ? "#10b981" : "#f59e0b")
            .build())
        .toList();

    return ResponseEntity.ok(events);
}
```

### Frontend — Calendar Component

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

```jsx
// features/resources/components/AvailabilityCalendar.jsx
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useQuery } from '@tanstack/react-query';
import api from '../../../config/axios';

export function AvailabilityCalendar({ resourceId, onDateSelect }) {
  const { data: events = [] } = useQuery({
    queryKey: ['calendar', resourceId],
    queryFn: () => {
      const from = new Date();
      const to   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return api.get('/bookings/calendar', {
        params: {
          resourceId,
          from: from.toISOString().split('T')[0],
          to:   to.toISOString().split('T')[0],
        }
      }).then(r => r.data);
    },
  });

  return (
    <div className="rounded-xl border bg-white p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left:   'prev,next today',
          center: 'title',
          right:  'dayGridMonth,timeGridWeek',
        }}
        events={events}
        selectable={true}
        selectMirror={true}
        select={(info) => onDateSelect?.(info.startStr, info.endStr)}
        height="auto"
        slotMinTime="07:00:00"
        slotMaxTime="21:00:00"
        businessHours={{ daysOfWeek: [1, 2, 3, 4, 5], startTime: '08:00', endTime: '18:00' }}
      />
      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"/> Approved
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"/> Pending
        </span>
      </div>
    </div>
  );
}
```

### Wire Into ResourceDetailPage

```jsx
// In ResourceDetailPage.jsx — add below the resource info card
<AvailabilityCalendar
  resourceId={resource.id}
  onDateSelect={(start, end) => {
    navigate(`/bookings/new?resourceId=${resource.id}&start=${start}&end=${end}`);
  }}
/>
```

</details>

---

<details>
<summary><strong>✅ Option C — QR Code Check-in for Bookings</strong> &nbsp;|&nbsp; Effort: Low &nbsp;|&nbsp; Impact: High (Mentioned in assignment brief)</summary>

### What It Is
When a booking is approved, a QR code is generated linking to a public verification page. At the resource location, a user or security staff scans the QR on their phone and sees the booking details — confirming the booking is valid.

### Backend — QR Endpoint (Member 2 adds this)

```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>core</artifactId>
    <version>3.5.2</version>
</dependency>
<dependency>
    <groupId>com.google.zxing</groupId>
    <artifactId>javase</artifactId>
    <version>3.5.2</version>
</dependency>
```

```java
// Add to BookingController.java
@GetMapping("/{id}/qr")
public ResponseEntity<byte[]> getBookingQrCode(@PathVariable String id) throws Exception {
    Booking booking = bookingRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

    if (booking.getStatus() != BookingStatus.APPROVED) {
        return ResponseEntity.badRequest().build();
    }

    // QR code points to frontend verification page
    String verifyUrl = frontendUrl + "/verify/booking/" + id;

    QRCodeWriter qrCodeWriter = new QRCodeWriter();
    BitMatrix bitMatrix = qrCodeWriter.encode(verifyUrl, BarcodeFormat.QR_CODE, 300, 300);

    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);

    return ResponseEntity.ok()
        .contentType(MediaType.IMAGE_PNG)
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"booking-qr.png\"")
        .body(outputStream.toByteArray());
}

// Public endpoint — no auth needed (for scanning at the door)
@GetMapping("/{id}/verify")
public ResponseEntity<BookingVerifyResponse> verifyBooking(@PathVariable String id) {
    Booking booking = bookingRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

    return ResponseEntity.ok(BookingVerifyResponse.builder()
        .bookingId(id)
        .status(booking.getStatus())
        .resourceId(booking.getResourceId())
        .startTime(booking.getStartTime())
        .endTime(booking.getEndTime())
        .purpose(booking.getPurpose())
        .isValid(booking.getStatus() == BookingStatus.APPROVED
              && booking.getStartTime().isBefore(LocalDateTime.now().plusMinutes(30))
              && booking.getEndTime().isAfter(LocalDateTime.now()))
        .build());
}
```

### Frontend — QR Display + Verify Page

```bash
npm install qrcode.react
```

```jsx
// features/bookings/components/BookingQRCode.jsx
import { QRCodeSVG } from 'qrcode.react';

export function BookingQRCode({ bookingId }) {
  const verifyUrl = `${window.location.origin}/verify/booking/${bookingId}`;

  return (
    <div className="flex flex-col items-center gap-3 p-6 border rounded-xl bg-white">
      <p className="text-sm font-medium text-muted-foreground">Scan at the door to check in</p>
      <QRCodeSVG value={verifyUrl} size={180} level="M"
                 imageSettings={{ src: '/favicon.ico', height: 24, width: 24, excavate: true }} />
      <p className="text-xs text-muted-foreground break-all text-center max-w-[200px]">
        {verifyUrl}
      </p>
    </div>
  );
}
```

```jsx
// features/bookings/pages/BookingVerifyPage.jsx — public page, no login required
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../config/axios';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function BookingVerifyPage() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['verify-booking', id],
    queryFn: () => api.get(`/bookings/${id}/verify`).then(r => r.data),
  });

  if (isLoading) return <div className="flex justify-center p-10"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-sm w-full text-center">
        {data.isValid ? (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-emerald-700 mb-2">Valid Booking</h1>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-red-600 mb-2">Invalid / Expired</h1>
          </>
        )}
        <div className="text-left mt-4 space-y-2 text-sm text-muted-foreground border-t pt-4">
          <p><span className="font-medium">Status:</span> {data.status}</p>
          <p><span className="font-medium">Start:</span> {new Date(data.startTime).toLocaleString()}</p>
          <p><span className="font-medium">End:</span>   {new Date(data.endTime).toLocaleString()}</p>
          <p><span className="font-medium">Purpose:</span> {data.purpose}</p>
        </div>
      </div>
    </div>
  );
}
```

### Add to BookingDetailPage

```jsx
// Show QR only for APPROVED bookings
{booking.status === 'APPROVED' && (
  <BookingQRCode bookingId={booking.id} />
)}
```

### Route to Add (Public — No ProtectedRoute)
```jsx
<Route path="/verify/booking/:id" element={<BookingVerifyPage />} />
```

</details>

---

<details>
<summary><strong>Option D — Email Notifications</strong> &nbsp;|&nbsp; Effort: Low &nbsp;|&nbsp; Impact: Medium</summary>

### What It Is
Sends an email to the user when their booking is approved/rejected or their ticket status changes. Uses Gmail SMTP via Spring Mail.

### Backend Setup (Member 4 adds this)

```xml
<!-- Add to pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

```yaml
# Add to application.yml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_APP_PASSWORD}    # Gmail App Password (not your real password)
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true
```

```java
// notification/EmailService.java
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendBookingApproved(String toEmail, String userName, Booking booking) {
        sendEmail(toEmail,
            "✅ Booking Approved — Smart Campus",
            buildBookingEmail(userName, booking, "APPROVED", null));
    }

    public void sendBookingRejected(String toEmail, String userName,
                                    Booking booking, String reason) {
        sendEmail(toEmail,
            "❌ Booking Rejected — Smart Campus",
            buildBookingEmail(userName, booking, "REJECTED", reason));
    }

    public void sendTicketStatusChanged(String toEmail, String userName,
                                        Ticket ticket, String newStatus) {
        sendEmail(toEmail,
            "🔔 Ticket Update — Smart Campus",
            String.format("Hi %s,\n\nYour ticket \"%s\" status changed to: %s\n\nSmart Campus",
                userName, ticket.getTitle(), newStatus));
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(fromEmail);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception e) {
            // Log but don't fail the main operation if email fails
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildBookingEmail(String name, Booking b,
                                     String status, String reason) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hi ").append(name).append(",\n\n");
        sb.append("Your booking request has been ").append(status).append(".\n\n");
        sb.append("Resource: ").append(b.getResourceId()).append("\n");
        sb.append("Time: ").append(b.getStartTime()).append(" → ").append(b.getEndTime()).append("\n");
        if (reason != null) sb.append("Reason: ").append(reason).append("\n");
        sb.append("\nSmart Campus Operations Hub");
        return sb.toString();
    }
}
```

### Wire Into Services

```java
// In BookingServiceImpl — after status change
if (newStatus == BookingStatus.APPROVED) {
    User user = userRepository.findById(booking.getUserId()).orElseThrow();
    emailService.sendBookingApproved(user.getEmail(), user.getName(), booking);
}
```

</details>

---

<details>
<summary><strong>Option E — Ticket SLA Timer</strong> &nbsp;|&nbsp; Effort: Medium &nbsp;|&nbsp; Impact: Medium (Mentioned in assignment brief)</summary>

### What It Is
Each ticket priority has a Service Level Agreement (SLA) — a maximum time within which it should be resolved. The system tracks whether a ticket has breached its SLA and displays a visual countdown/status badge.

### SLA Rules

| Priority | Response SLA | Resolution SLA |
|----------|-------------|----------------|
| CRITICAL | 1 hour      | 4 hours        |
| HIGH     | 4 hours     | 24 hours       |
| MEDIUM   | 24 hours    | 72 hours       |
| LOW      | 72 hours    | 168 hours (7d) |

### Backend — Add Fields to Ticket Document (Member 3)

```java
// Add to Ticket.java document
private LocalDateTime firstResponseAt;      // Set when status first changes from OPEN
private boolean slaBreached = false;        // Set when resolution time exceeded
private LocalDateTime slaDeadline;          // Calculated on creation

// Computed on ticket creation in TicketServiceImpl:
public Ticket createTicket(CreateTicketRequest request, String userId) {
    LocalDateTime deadline = LocalDateTime.now().plusHours(
        switch (request.getPriority()) {
            case CRITICAL -> 4;
            case HIGH     -> 24;
            case MEDIUM   -> 72;
            case LOW      -> 168;
        }
    );
    Ticket ticket = Ticket.builder()
        // ... other fields ...
        .slaDeadline(deadline)
        .build();
    return ticketRepository.save(ticket);
}

// Scheduled check — runs every hour to flag breached SLAs
@Scheduled(fixedRate = 3600000)   // every hour
public void checkSlaBreaches() {
    List<Ticket> activeTickets = ticketRepository
        .findByStatusInAndSlaBreachedFalse(
            List.of(TicketStatus.OPEN, TicketStatus.IN_PROGRESS));

    activeTickets.stream()
        .filter(t -> t.getSlaDeadline() != null
                  && LocalDateTime.now().isAfter(t.getSlaDeadline()))
        .forEach(t -> {
            t.setSlaBreached(true);
            ticketRepository.save(t);
            notificationService.createNotification(
                "SLA_BREACH",
                "Ticket \"" + t.getTitle() + "\" has breached its SLA",
                t.getAssignedTechnicianId() != null
                    ? t.getAssignedTechnicianId() : "ADMIN"
            );
        });
}
```

### Frontend — SLA Badge Component

```jsx
// features/tickets/components/SlaBadge.jsx
import { differenceInHours, differenceInMinutes } from 'date-fns';
import { Clock, AlertTriangle } from 'lucide-react';

export function SlaBadge({ slaDeadline, slaBreached, status }) {
  // Don't show on resolved/closed tickets
  if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(status)) return null;

  if (slaBreached) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                       text-xs font-medium bg-red-100 text-red-700 border border-red-200">
        <AlertTriangle className="w-3 h-3" />
        SLA Breached
      </span>
    );
  }

  const deadline = new Date(slaDeadline);
  const now = new Date();
  const hoursLeft = differenceInHours(deadline, now);
  const minutesLeft = differenceInMinutes(deadline, now) % 60;

  const isWarning = hoursLeft < 2;
  const style = isWarning
    ? 'bg-orange-100 text-orange-700 border-orange-200'
    : 'bg-blue-100 text-blue-700 border-blue-200';

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                      text-xs font-medium border ${style}`}>
      <Clock className="w-3 h-3" />
      {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m left` : `${minutesLeft}m left`}
    </span>
  );
}
```

```jsx
// Use in TicketCard.jsx
<SlaBadge
  slaDeadline={ticket.slaDeadline}
  slaBreached={ticket.slaBreached}
  status={ticket.status}
/>
```

### Enable @Scheduled in Spring Boot

```java
// SmartCampusApplication.java
@SpringBootApplication
@EnableScheduling          // ← Add this
@EnableMongoAuditing       // ← For createdAt/updatedAt
public class SmartCampusApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartCampusApplication.class, args);
    }
}
```

</details>

---

<details>
<summary><strong>Option F — Dark Mode Toggle</strong> &nbsp;|&nbsp; Effort: Very Low &nbsp;|&nbsp; Impact: Medium (UI/UX marks)</summary>

### What It Is
A dark/light mode toggle in the header. ShadCN is already built for this — it just needs wiring up. Takes under 30 minutes and visually impresses examiners.

### Setup

```bash
npm install next-themes
```

```jsx
// main.jsx — wrap with ThemeProvider
import { ThemeProvider } from 'next-themes';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </ThemeProvider>
);
```

```jsx
// components/shared/ThemeToggle.jsx
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      <Sun  className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

```jsx
// Add to Header.jsx
import { ThemeToggle } from './ThemeToggle';

// Inside the header JSX:
<ThemeToggle />
```

```js
// tailwind.config.js — ensure darkMode is set
module.exports = {
  darkMode: ['class'],   // ← This must be 'class'
  // ...
}
```

</details>

---

## 📌 Quick Reference — Git Commands

```bash
# Daily workflow (every team member)
git checkout main
git pull origin main
git checkout -b feature/<your-name>/<task>    # e.g. feature/john/booking-conflict
# ... code ...
git add .
git commit -m "feat: implement booking conflict detection with MongoDB query"
git push origin feature/<your-name>/<task>
# → Open Pull Request on GitHub → get teammate review → merge

# Good commit message format:
feat: add resource availability endpoint
fix: resolve booking overlap edge case
test: add unit tests for BookingService
docs: update README with setup instructions
refactor: extract conflict check to separate method
```

---

## 📌 README Template

Your repo must have a clear README. Include:

```markdown
# Smart Campus Operations Hub — IT3030 PAF 2026

## Team
| Member | Student ID | Module |
|--------|-----------|--------|
| Member 1 | 22XXXXXX | Facilities & Assets |
| Member 2 | 22XXXXXX | Booking Management |
| Member 3 | 22XXXXXX | Incident Ticketing |
| Member 4 | 22XXXXXX | Auth & Notifications |

## Tech Stack
- Backend: Java 21, Spring Boot 3.x, MongoDB
- Frontend: React 18, Vite, ShadCN UI, Tailwind CSS
- Auth: OAuth 2.0 (Google) + JWT
- CI/CD: GitHub Actions

## Prerequisites
- Java 21
- Node.js 20+
- MongoDB 7+ (or MongoDB Atlas free tier)
- Maven 3.9+

## Setup — Backend
1. Clone the repository
2. Install and start MongoDB: `mongod --dbpath /data/db`  
   *(or use MongoDB Atlas — paste connection string into application.yml)*
3. Copy `application.yml.example` to `application.yml`
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `MONGODB_URI`
5. Run: `cd smart-campus-api && mvn spring-boot:run`
6. API available at: `http://localhost:8080`
7. Swagger UI: `http://localhost:8080/swagger-ui.html`

## Setup — Frontend
1. `cd smart-campus-client`
2. `npm install`
3. Copy `.env.example` to `.env`
4. `npm run dev`
5. App available at: `http://localhost:5173`

## AI Tool Disclosure
This project used GitHub Copilot for code completion and ChatGPT for brainstorming.
All generated code was reviewed, understood, and modified by team members.
```

---

*Smart Campus Operations Hub — Master Prompt v2.0*  
*IT3030 PAF 2026 | SLIIT Faculty of Computing*  
*Stack: Spring Boot · React · MongoDB · ShadCN · Tailwind · GitHub Actions*  
*Roles: USER (Students + Staff) · ADMIN · TECHNICIAN*  
*Perspectives: Backend Engineer · Frontend Engineer · Software Architect · UI/UX Designer · Software Engineer*
