# 🌿 SMART CAMPUS — GITHUB WORKFLOW GUIDE
## Step-by-Step for All 4 Members | IT3030 PAF 2026

> **Branch naming:** `feature/<member-name>/<task-name>`
> **Base workflow:** GitHub Flow — branch off `main`, PR back to `main`
> **Golden rule:** Commit every day. Small commits. Meaningful messages.

---

## ⚙️ ONE-TIME REPO SETUP (All Members Together — Day 1)

**One person (Team Lead) does this once:**

```bash
# 1. Create the repo on GitHub
# Repo name: it3030-paf-2026-smart-campus-groupXX
# Visibility: Public

# 2. Clone and set up base structure
git clone https://github.com/your-org/it3030-paf-2026-smart-campus-groupXX.git
cd it3030-paf-2026-smart-campus-groupXX

# 3. Create the two project folders
mkdir smart-campus-api        # Spring Boot backend
mkdir smart-campus-client     # React frontend

# 4. Add base README
touch README.md

# 5. Add .gitignore
cat > .gitignore << 'EOF'
# Java
target/
*.class
*.jar
*.war

# Node
node_modules/
dist/
.env
.env.local

# IDE
.idea/
.vscode/
*.iml

# OS
.DS_Store
Thumbs.db
EOF

# 6. First commit
git add .
git commit -m "chore: initial project structure with backend and frontend folders"
git push origin main
```

**Every other member clones:**
```bash
git clone https://github.com/your-org/it3030-paf-2026-smart-campus-groupXX.git
cd it3030-paf-2026-smart-campus-groupXX
```

---

## 🔐 SHARED SETUP FIRST (Member 4 leads — ALL depend on this)

> Before anyone can test their endpoints, auth must work.
> Member 4 builds OAuth + JWT first. Others can mock auth in the meantime.

**While Member 4 builds auth, Members 1–3 build their entities + repos + service skeletons (no security needed yet).**

---

---

# 👤 MEMBER 1 — Facilities & Assets Catalogue

## Responsibility Summary
Build and manage campus resources: lecture halls, labs, meeting rooms, equipment. Search, filter, CRUD, availability.

## Branch & Feature Order

### 📌 STEP 1 — Entity + Repository (Day 2–3)

```bash
git checkout main && git pull origin main
git checkout -b feature/member1/resource-entity-and-repo
```

**What to do:**
- Create `CampusResource.java` document class with all fields
- Create `AvailabilityWindow.java` embedded class
- Create `ResourceRepository.java` extending `MongoRepository`
- Create `ResourceStatus.java` and `ResourceType.java` enums
- Add `@Document`, `@Id`, `@Indexed` annotations correctly

**Files to create:**
```
src/main/java/com/smartcampus/api/module/resource/
  entity/CampusResource.java
  entity/AvailabilityWindow.java
  repository/ResourceRepository.java
common/enums/ResourceStatus.java
common/enums/ResourceType.java
```

**Commit messages (commit after each file):**
```bash
git add src/main/java/com/smartcampus/api/common/enums/ResourceStatus.java
git commit -m "feat(resource): add ResourceStatus and ResourceType enums"

git add src/main/java/com/smartcampus/api/module/resource/entity/
git commit -m "feat(resource): add CampusResource MongoDB document with availability windows"

git add src/main/java/com/smartcampus/api/module/resource/repository/
git commit -m "feat(resource): add ResourceRepository with search query methods"
```

**Push and open PR:**
```bash
git push origin feature/member1/resource-entity-and-repo
# GitHub → New Pull Request → title: "feat: Resource entity and repository"
# Request review from 1 teammate → merge when approved
```

---

### 📌 STEP 2 — DTOs + Service Layer (Day 3–4)

```bash
git checkout main && git pull origin main
git checkout -b feature/member1/resource-service
```

**What to do:**
- Create `CreateResourceRequest.java` with `@Valid` annotations
- Create `UpdateResourceRequest.java`
- Create `ResourceResponse.java` with HATEOAS links map
- Create `ResourceService.java` interface
- Create `ResourceServiceImpl.java` with all business logic:
  - `getAllResources(filters, pageable)` — search + filter
  - `getResourceById(id)` — throws `ResourceNotFoundException` if not found
  - `createResource(request)` — admin only
  - `updateResource(id, request)` — admin only
  - `deleteResource(id)` — admin only, check no active bookings first
  - `checkAvailability(id, startTime, endTime)` — checks bookings

**Files to create:**
```
module/resource/dto/CreateResourceRequest.java
module/resource/dto/UpdateResourceRequest.java
module/resource/dto/ResourceResponse.java
module/resource/service/ResourceService.java
module/resource/service/ResourceServiceImpl.java
```

**Commit messages:**
```bash
git commit -m "feat(resource): add CreateResourceRequest and UpdateResourceRequest DTOs with validation"
git commit -m "feat(resource): add ResourceResponse DTO with HATEOAS links"
git commit -m "feat(resource): implement ResourceService interface and full CRUD logic"
git commit -m "feat(resource): add availability checking logic in ResourceServiceImpl"
```

**Push and open PR:**
```bash
git push origin feature/member1/resource-service
# PR title: "feat: Resource service layer with CRUD and availability checking"
```

---

### 📌 STEP 3 — REST Controller (Day 4–5)

```bash
git checkout main && git pull origin main
git checkout -b feature/member1/resource-controller
```

**What to do:**
- Create `ResourceController.java` with ALL 8 endpoints
- Add `@Valid` on request bodies
- Return correct HTTP status codes (200, 201, 204, 400, 404)
- Add `@PreAuthorize` on admin endpoints
- Add Swagger `@Operation` annotations for documentation
- Add `Cache-Control` headers on GET endpoints

**8 endpoints to implement:**
```
GET    /api/resources                    → 200 (paginated list with filters)
GET    /api/resources/{id}               → 200 or 404
POST   /api/resources                    → 201 (admin only)
PUT    /api/resources/{id}               → 200 (admin only)
PATCH  /api/resources/{id}/status        → 200 (admin only)
DELETE /api/resources/{id}               → 204 (admin only)
GET    /api/resources/{id}/availability  → 200
GET    /api/resources/types              → 200 (public, returns enum list)
```

**Commit messages:**
```bash
git commit -m "feat(resource): add GET /api/resources with search and pagination"
git commit -m "feat(resource): add GET /api/resources/{id} with 404 handling"
git commit -m "feat(resource): add POST /api/resources with admin authorization"
git commit -m "feat(resource): add PUT, PATCH status, DELETE resource endpoints"
git commit -m "feat(resource): add GET availability and types endpoints"
git commit -m "feat(resource): add Swagger annotations and cache-control headers"
```

**Push and open PR:**
```bash
git push origin feature/member1/resource-controller
# PR title: "feat: Resource REST controller with 8 endpoints and authorization"
```

---

### 📌 STEP 4 — Unit Tests (Day 5–6)

```bash
git checkout main && git pull origin main
git checkout -b feature/member1/resource-tests
```

**What to do:**
- Create `ResourceServiceTest.java`
- Test: create resource success, create resource with duplicate name, get resource not found, delete resource with active bookings (should fail)
- Create `ResourceControllerIntegrationTest.java`
- Test: GET /api/resources returns 200, POST without admin role returns 403

**Commit messages:**
```bash
git commit -m "test(resource): add unit tests for ResourceServiceImpl"
git commit -m "test(resource): add integration tests for ResourceController"
```

---

### 📌 STEP 5 — React Frontend (Day 6–9)

```bash
git checkout main && git pull origin main
git checkout -b feature/member1/resource-frontend
```

**Build in this exact order:**

**Day 6 — Service + Hook:**
```bash
# Create resourceService.js with all API calls
# Create useResources.js and useResource.js hooks
git commit -m "feat(resource-ui): add resourceService and React Query hooks"
```

**Day 7 — ResourceCard + ResourceFilters:**
```bash
# Build ResourceCard.jsx — shows name, type, capacity, status badge, "Book Now" button
# Build ResourceFilters.jsx — dropdowns for type, capacity, location
git commit -m "feat(resource-ui): add ResourceCard and ResourceFilters components"
```

**Day 8 — ResourceListPage:**
```bash
# Build full list page: filters + grid of cards + pagination + loading skeletons + empty state
git commit -m "feat(resource-ui): add ResourceListPage with search, filter, pagination"
```

**Day 9 — ResourceDetailPage + ResourceForm (Admin):**
```bash
# ResourceDetailPage: full details + availability calendar + Book Now button
# ResourceForm: create/edit form for admin (react-hook-form + zod validation)
# ResourceManagePage: admin table with edit/delete actions
git commit -m "feat(resource-ui): add ResourceDetailPage with availability view"
git commit -m "feat(resource-ui): add admin ResourceForm and ResourceManagePage"
```

**Push and open PR:**
```bash
git push origin feature/member1/resource-frontend
# PR title: "feat: Full resource management UI — list, detail, admin CRUD"
```

---

### 📌 STEP 6 — Polish & Integration (Day 10–11)

```bash
git checkout main && git pull origin main
git checkout -b feature/member1/resource-polish
```

**What to do:**
- Connect frontend to real backend (replace any mock data)
- Test all 8 API endpoints with Postman → save collection
- Fix any CORS or auth issues
- Add responsive styles for mobile

```bash
git commit -m "fix(resource): connect frontend to live API and fix CORS config"
git commit -m "fix(resource): improve mobile responsiveness on ResourceListPage"
git commit -m "docs(resource): add Postman collection for resource endpoints"
```

---

## Member 1 — Feature Branch Summary

| Order | Branch Name | What It Covers | PR Title |
|-------|------------|----------------|----------|
| 1st | `feature/member1/resource-entity-and-repo` | MongoDB document, enums, repository | feat: Resource entity and repository |
| 2nd | `feature/member1/resource-service` | DTOs, service layer, business logic | feat: Resource service with CRUD |
| 3rd | `feature/member1/resource-controller` | All 8 REST endpoints | feat: Resource controller with 8 endpoints |
| 4th | `feature/member1/resource-tests` | Unit + integration tests | test: Resource service and controller tests |
| 5th | `feature/member1/resource-frontend` | Full React UI | feat: Resource management UI |
| 6th | `feature/member1/resource-polish` | Integration, fixes, Postman | fix: Resource integration and polish |

---

---

# 👤 MEMBER 2 — Booking Workflow & Conflict Detection

## Responsibility Summary
Full booking lifecycle: create, approve, reject, cancel. Overlap/conflict detection. Admin approval flow.

## Branch & Feature Order

### 📌 STEP 1 — Booking Entity + Repository (Day 2–3)

```bash
git checkout main && git pull origin main
git checkout -b feature/member2/booking-entity-and-repo
```

**What to do:**
- Create `Booking.java` document with all workflow fields
- Create `BookingStatus.java` enum: `PENDING, APPROVED, REJECTED, CANCELLED`
- Create `BookingRepository.java` — MOST IMPORTANT: write the conflict detection query
- Add `@CompoundIndex` on `resourceId + startTime + endTime + status`

**The conflict detection query (write this carefully):**
```java
@Query("{ 'resourceId': ?0, 'status': { $in: ['PENDING','APPROVED'] }, " +
       "'startTime': { $lt: ?2 }, 'endTime': { $gt: ?1 } }")
List<Booking> findConflicts(String resourceId, LocalDateTime start, LocalDateTime end);
```

**Commit messages:**
```bash
git commit -m "feat(booking): add BookingStatus enum with all workflow states"
git commit -m "feat(booking): add Booking MongoDB document with compound index"
git commit -m "feat(booking): add BookingRepository with conflict detection query"
```

---

### 📌 STEP 2 — DTOs + Service Layer (Day 3–4)

```bash
git checkout main && git pull origin main
git checkout -b feature/member2/booking-service
```

**What to do:**
- Create `CreateBookingRequest.java` — date/time, purpose, attendees, resourceId
- Create `ApproveBookingRequest.java` — empty (just the action)
- Create `RejectBookingRequest.java` — reason field
- Create `BookingResponse.java` — with HATEOAS links (self, cancel, resource)
- Create `BookingServiceImpl.java` — implement:
  - `createBooking()` → validate resource active → check conflicts → save PENDING → notify admins
  - `approveBooking()` → admin only → change to APPROVED → notify user
  - `rejectBooking()` → admin only → save reason → notify user
  - `cancelBooking()` → user owns it → must be PENDING or APPROVED → change to CANCELLED
  - `getMyBookings()` → filter by current user
  - `getAllBookings()` → admin only, filter by status/date

**The most important method — conflict check:**
```java
// In createBooking():
List<Booking> conflicts = bookingRepository.findConflicts(
    request.getResourceId(),
    request.getStartTime(),
    request.getEndTime()
);
if (!conflicts.isEmpty()) {
    throw new BookingConflictException(
        "This resource is already booked for the selected time"
    );
}
```

**Commit messages:**
```bash
git commit -m "feat(booking): add CreateBookingRequest, ApproveBookingRequest, RejectBookingRequest DTOs"
git commit -m "feat(booking): add BookingResponse with HATEOAS links"
git commit -m "feat(booking): implement createBooking with conflict detection and PENDING status"
git commit -m "feat(booking): implement approveBooking and rejectBooking for admin"
git commit -m "feat(booking): implement cancelBooking with ownership check"
git commit -m "feat(booking): implement getMyBookings and getAllBookings with filters"
```

---

### 📌 STEP 3 — REST Controller + Exception (Day 4–5)

```bash
git checkout main && git pull origin main
git checkout -b feature/member2/booking-controller
```

**8 endpoints to implement:**
```
POST   /api/bookings                     → 201 or 409 (conflict)
GET    /api/bookings                     → 200 (admin only, paginated)
GET    /api/bookings/my                  → 200 (own bookings)
GET    /api/bookings/{id}               → 200 or 404
PATCH  /api/bookings/{id}/approve        → 200 (admin only)
PATCH  /api/bookings/{id}/reject         → 200 (admin only)
PATCH  /api/bookings/{id}/cancel         → 200 (own booking)
GET    /api/resources/{id}/bookings      → 200 (public calendar feed)
```

- Add `BookingConflictException.java` → mapped to 409 in GlobalExceptionHandler
- Add calendar endpoint (feeds Option B innovation feature)

**Commit messages:**
```bash
git commit -m "feat(booking): add BookingConflictException mapped to HTTP 409"
git commit -m "feat(booking): add POST /api/bookings with conflict detection"
git commit -m "feat(booking): add GET endpoints for bookings list and my bookings"
git commit -m "feat(booking): add PATCH approve, reject, cancel booking endpoints"
git commit -m "feat(booking): add GET /api/resources/{id}/bookings for calendar feed"
```

---

### 📌 STEP 4 — Unit Tests (Day 5–6)

```bash
git checkout main && git pull origin main
git checkout -b feature/member2/booking-tests
```

**Test scenarios to cover:**
- Create booking success → status is PENDING
- Create booking with time conflict → throws BookingConflictException → 409
- Create booking in the past → throws exception → 400
- Approve booking as admin → status changes to APPROVED
- Cancel booking as non-owner → throws UnauthorizedException → 403

```bash
git commit -m "test(booking): add unit tests for createBooking including conflict scenarios"
git commit -m "test(booking): add tests for approveBooking, rejectBooking, cancelBooking"
```

---

### 📌 STEP 5 — React Frontend (Day 6–9)

```bash
git checkout main && git pull origin main
git checkout -b feature/member2/booking-frontend
```

**Build in this order:**

**Day 6 — Service + Hooks:**
```bash
git commit -m "feat(booking-ui): add bookingService and useBookings, useCreateBooking hooks"
```

**Day 7 — BookingForm + ConflictWarning:**
```bash
# BookingForm: date picker, time inputs, purpose, attendees
# Show ConflictWarning component when 409 returned from API
# Real-time: when user picks resource + time, call availability endpoint
git commit -m "feat(booking-ui): add BookingForm with date-time picker"
git commit -m "feat(booking-ui): add ConflictWarning component shown on 409 response"
```

**Day 8 — BookingListPage + BookingCard:**
```bash
# 3 tabs: Pending / Approved / Rejected
# BookingCard with status badge + action buttons (cancel for user)
git commit -m "feat(booking-ui): add BookingListPage with status tabs and BookingCard"
```

**Day 9 — AdminBookingsPage + ApproveRejectPanel:**
```bash
# Admin sees all bookings
# ApproveRejectPanel: approve button + reject with reason textarea
# BookingTimeline: visual workflow status indicator
git commit -m "feat(booking-ui): add AdminBookingsPage with approve/reject panel"
git commit -m "feat(booking-ui): add BookingTimeline workflow status component"
```

**Push and open PR:**
```bash
git push origin feature/member2/booking-frontend
```

---

### 📌 STEP 6 — Innovation Option B (QR or Calendar) (Day 10)

```bash
git checkout main && git pull origin main
git checkout -b feature/member2/booking-calendar-and-qr
```

```bash
# Add AvailabilityCalendar.jsx using FullCalendar
# Add BookingQRCode.jsx shown on approved booking detail
# Add GET /api/bookings/calendar endpoint on backend
git commit -m "feat(booking): add GET /api/bookings/calendar endpoint for resource calendar feed"
git commit -m "feat(booking-ui): add AvailabilityCalendar with FullCalendar integration"
git commit -m "feat(booking-ui): add BookingQRCode component on approved booking detail"
```

---

## Member 2 — Feature Branch Summary

| Order | Branch Name | What It Covers | PR Title |
|-------|------------|----------------|----------|
| 1st | `feature/member2/booking-entity-and-repo` | Document, enum, conflict query | feat: Booking entity with conflict detection query |
| 2nd | `feature/member2/booking-service` | DTOs, full service logic | feat: Booking service with conflict checking |
| 3rd | `feature/member2/booking-controller` | All 8 REST endpoints, 409 | feat: Booking controller with approve/reject/cancel |
| 4th | `feature/member2/booking-tests` | Conflict + workflow tests | test: Booking service conflict and workflow tests |
| 5th | `feature/member2/booking-frontend` | Full React booking UI | feat: Booking UI with form, list, admin panel |
| 6th | `feature/member2/booking-calendar-and-qr` | Calendar + QR innovation | feat: Booking calendar view and QR check-in |

---

---

# 👤 MEMBER 3 — Incident Tickets, Attachments & Technician Updates

## Responsibility Summary
Full ticket lifecycle: create, assign technician, status workflow, image attachments (max 3), comments with ownership.

## Branch & Feature Order

### 📌 STEP 1 — Ticket Document (Embedded Design) (Day 2–3)

```bash
git checkout main && git pull origin main
git checkout -b feature/member3/ticket-document
```

**What to do:**
- Create `Ticket.java` — with embedded `List<TicketAttachment>` and `List<TicketComment>`
- Create `TicketAttachment.java` — embedded POJO (not a separate document)
- Create `TicketComment.java` — embedded POJO (not a separate document)
- Create `TicketStatus.java` enum: `OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED`
- Create `TicketPriority.java` enum: `LOW, MEDIUM, HIGH, CRITICAL`
- Create `TicketRepository.java`

**Key MongoDB design decision:**
```java
// Attachments and comments are EMBEDDED inside the ticket document
// This means one MongoDB query fetches everything — very efficient
@Document(collection = "tickets")
public class Ticket extends BaseDocument {
    // ...
    private List<TicketAttachment> attachments = new ArrayList<>();  // max 3
    private List<TicketComment> comments = new ArrayList<>();
}
```

**Commit messages:**
```bash
git commit -m "feat(ticket): add TicketStatus and TicketPriority enums"
git commit -m "feat(ticket): add TicketAttachment and TicketComment embedded POJOs"
git commit -m "feat(ticket): add Ticket MongoDB document with embedded attachments and comments"
git commit -m "feat(ticket): add TicketRepository with filter query methods"
```

---

### 📌 STEP 2 — DTOs + Service Layer (Day 3–5)

```bash
git checkout main && git pull origin main
git checkout -b feature/member3/ticket-service
```

**DTOs to create:**
- `CreateTicketRequest.java` — title, description, category, priority, resourceId, preferredContact
- `UpdateTicketRequest.java` — for user editing their own OPEN ticket
- `UpdateTicketStatusRequest.java` — admin/tech changing status + resolution notes
- `AssignTechnicianRequest.java` — admin assigns a technician
- `CreateCommentRequest.java` — comment content
- `TicketResponse.java` — full ticket with attachments + comments lists
- `CommentResponse.java`

**Service methods to implement in `TicketServiceImpl.java`:**
```
createTicket()            → user creates, sets OPEN status
getTicketById()           → check ownership (user sees own, admin sees all)
getAllTickets()            → admin/tech only, filter by status/priority/assigned
getMyTickets()            → filter by current userId
updateTicket()            → user can edit own OPEN ticket only
updateTicketStatus()      → admin/tech only, validate workflow transitions
assignTechnician()        → admin only, set assignedTechnicianId
deleteTicket()            → admin only
addComment()              → any authenticated, set userId on comment
editComment()             → only comment owner
deleteComment()           → comment owner or admin
uploadAttachment()        → user, max 3 check, save file, add to embedded list
deleteAttachment()        → uploader or admin
```

**Commit messages:**
```bash
git commit -m "feat(ticket): add all ticket and comment DTOs with validation annotations"
git commit -m "feat(ticket): implement createTicket with OPEN status and SLA deadline"
git commit -m "feat(ticket): implement ticket read methods with ownership checks"
git commit -m "feat(ticket): implement updateTicketStatus with workflow validation"
git commit -m "feat(ticket): implement assignTechnician for admin role"
git commit -m "feat(ticket): implement addComment, editComment, deleteComment with ownership"
git commit -m "feat(ticket): implement uploadAttachment with 3-file limit and type validation"
```

---

### 📌 STEP 3 — File Storage Service (Day 5)

```bash
git checkout main && git pull origin main
git checkout -b feature/member3/file-storage
```

**What to do:**
- Create `StorageService.java` interface
- Create `LocalStorageServiceImpl.java` — saves files to `./uploads/tickets/{ticketId}/`
- Validate file type (jpeg, png, webp only)
- Validate file size (max 5MB)
- Generate unique filename to prevent overwrite collisions
- Add static resource mapping so files are served over HTTP

```java
// StorageService.java
public interface StorageService {
    String store(MultipartFile file, String subDirectory);
    void delete(String filePath);
    String getFileUrl(String filePath);
}
```

**Commit messages:**
```bash
git commit -m "feat(storage): add StorageService interface and LocalStorageServiceImpl"
git commit -m "feat(storage): add file type and size validation in storage service"
git commit -m "feat(storage): add static resource mapping to serve uploaded files over HTTP"
```

---

### 📌 STEP 4 — REST Controllers (Day 5–6)

```bash
git checkout main && git pull origin main
git checkout -b feature/member3/ticket-controller
```

**Two controllers to create:**

**TicketController.java** (9 endpoints):
```
POST   /api/tickets                              → 201
GET    /api/tickets                              → 200 (admin/tech)
GET    /api/tickets/my                           → 200
GET    /api/tickets/{id}                         → 200 or 404
PUT    /api/tickets/{id}                         → 200 (owner, OPEN only)
PATCH  /api/tickets/{id}/status                  → 200 (admin/tech)
PATCH  /api/tickets/{id}/assign                  → 200 (admin)
DELETE /api/tickets/{id}                         → 204 (admin)
POST   /api/tickets/{id}/attachments             → 201 (multipart/form-data)
GET    /api/tickets/{id}/attachments             → 200
DELETE /api/tickets/{id}/attachments/{attachId}  → 204
```

**CommentController.java** (4 endpoints):
```
POST   /api/tickets/{id}/comments                         → 201
GET    /api/tickets/{id}/comments                         → 200
PUT    /api/tickets/{id}/comments/{commentId}             → 200 (owner)
DELETE /api/tickets/{id}/comments/{commentId}             → 204 (owner or admin)
```

**Commit messages:**
```bash
git commit -m "feat(ticket): add POST and GET ticket endpoints"
git commit -m "feat(ticket): add PUT update, PATCH status, PATCH assign, DELETE endpoints"
git commit -m "feat(ticket): add POST /api/tickets/{id}/attachments with multipart upload"
git commit -m "feat(ticket): add GET and DELETE attachment endpoints"
git commit -m "feat(ticket): add CommentController with CRUD and ownership validation"
```

---

### 📌 STEP 5 — Unit Tests (Day 6–7)

```bash
git checkout main && git pull origin main
git checkout -b feature/member3/ticket-tests
```

**Test scenarios:**
- Create ticket → status is OPEN, attachments list is empty
- Upload 4th attachment → throws exception → 400
- Upload non-image file → throws exception → 400
- Edit comment as non-owner → throws 403
- Change ticket status invalid transition (OPEN → CLOSED) → throws exception

```bash
git commit -m "test(ticket): add unit tests for ticket creation and status transitions"
git commit -m "test(ticket): add tests for attachment upload limit and type validation"
git commit -m "test(ticket): add tests for comment ownership enforcement"
```

---

### 📌 STEP 6 — React Frontend (Day 7–10)

```bash
git checkout main && git pull origin main
git checkout -b feature/member3/ticket-frontend
```

**Build in this order:**

**Day 7 — Service + Hooks:**
```bash
git commit -m "feat(ticket-ui): add ticketService and useTickets, useTicketActions hooks"
```

**Day 8 — TicketCard + TicketStatusFlow + TicketListPage:**
```bash
# TicketCard: title, category, priority badge, status badge, SLA badge, assigned technician
# TicketStatusFlow: horizontal stepper showing OPEN→IN_PROGRESS→RESOLVED→CLOSED
# TicketListPage: filter by status/priority, list of cards, Create button
git commit -m "feat(ticket-ui): add TicketCard with status and priority badges"
git commit -m "feat(ticket-ui): add TicketStatusFlow visual workflow stepper"
git commit -m "feat(ticket-ui): add TicketListPage with priority and status filters"
```

**Day 9 — TicketDetailPage + AttachmentUploader + CommentThread:**
```bash
# TicketDetailPage: full ticket view + status flow + attachments + comments
# AttachmentUploader: drag-and-drop, image preview, max 3 enforcement
# CommentThread: scrollable list with edit/delete own comments
git commit -m "feat(ticket-ui): add TicketDetailPage with full ticket information"
git commit -m "feat(ticket-ui): add AttachmentUploader with drag-drop and 3-file limit"
git commit -m "feat(ticket-ui): add CommentThread with edit/delete and ownership checks"
```

**Day 10 — CreateTicketPage + Admin features:**
```bash
# CreateTicketPage: form with all fields + attachment upload
# TechnicianAssign: admin dropdown to assign technician
# AdminTicketsPage: all tickets table with bulk filters
git commit -m "feat(ticket-ui): add CreateTicketPage with form and attachment upload"
git commit -m "feat(ticket-ui): add TechnicianAssign component for admin"
git commit -m "feat(ticket-ui): add AdminTicketsPage with technician assignment"
```

---

### 📌 STEP 7 — Innovation Option E (SLA Timer) (Day 11)

```bash
git checkout main && git pull origin main
git checkout -b feature/member3/ticket-sla-timer
```

```bash
git commit -m "feat(ticket): add slaDeadline and slaBreached fields to Ticket document"
git commit -m "feat(ticket): add @Scheduled SLA breach checker running every hour"
git commit -m "feat(ticket-ui): add SlaBadge component with countdown and breach indicator"
```

---

## Member 3 — Feature Branch Summary

| Order | Branch Name | What It Covers | PR Title |
|-------|------------|----------------|----------|
| 1st | `feature/member3/ticket-document` | Document, embedded POJOs, enums, repo | feat: Ticket document with embedded comments and attachments |
| 2nd | `feature/member3/ticket-service` | All DTOs, service logic, ownership | feat: Ticket service with full workflow and comment ownership |
| 3rd | `feature/member3/file-storage` | File upload/delete/serve | feat: Local storage service for ticket attachments |
| 4th | `feature/member3/ticket-controller` | 13 REST endpoints across 2 controllers | feat: Ticket and Comment REST controllers |
| 5th | `feature/member3/ticket-tests` | Upload limits, ownership, status tests | test: Ticket service and attachment validation tests |
| 6th | `feature/member3/ticket-frontend` | Full React ticket UI | feat: Full ticket management UI with attachments and comments |
| 7th | `feature/member3/ticket-sla-timer` | SLA innovation feature | feat: Ticket SLA timer with scheduled breach detection |

---

---

# 👤 MEMBER 4 — Notifications, Roles & OAuth

## ⚠️ MOST CRITICAL MEMBER — BUILD FIRST, OTHERS DEPEND ON YOU

> OAuth + JWT must work before anyone else can properly test their endpoints.
> Complete Steps 1 and 2 before the rest of the team starts their service layers.

## Branch & Feature Order

### 📌 STEP 1 — User Document + Enums (Day 1–2) 🔴 URGENT

```bash
git checkout main && git pull origin main
git checkout -b feature/member4/user-document
```

**What to do:**
- Create `User.java` MongoDB document
- Create `UserRole.java` enum: `USER, ADMIN, TECHNICIAN`
- Create `UserRepository.java` with `findByEmail()`
- Create `BaseDocument.java` abstract class (ALL members' documents extend this)
- Add `@EnableMongoAuditing` to main application class

```java
// ⚠️ SHARE THIS WITH ALL MEMBERS — they all need BaseDocument
@Data
public abstract class BaseDocument {
    @Id
    private String id;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

**Commit messages:**
```bash
git commit -m "feat(user): add BaseDocument abstract class for all MongoDB documents"
git commit -m "feat(user): add UserRole enum with USER, ADMIN, TECHNICIAN"
git commit -m "feat(user): add User MongoDB document with email unique index"
git commit -m "feat(user): add UserRepository with findByEmail method"
git commit -m "feat(app): add @EnableMongoAuditing and @EnableScheduling to main class"
```

**Notify team:** Post in your group chat — "BaseDocument is ready, please use it for your entities"

---

### 📌 STEP 2 — Security Config + OAuth + JWT (Day 2–4) 🔴 URGENT

```bash
git checkout main && git pull origin main
git checkout -b feature/member4/oauth-jwt-security
```

**What to do (build in this exact order):**

**Part A — JWT:**
- `JwtTokenProvider.java` — generate and validate JWT
- `JwtAuthenticationFilter.java` — extract JWT from request header

**Part B — OAuth:**
- `OAuth2SuccessHandler.java` — handle Google callback, create/find user, issue JWT, redirect to frontend
- `OAuth2UserInfoFactory.java` — extract email/name/picture from Google token
- `CustomUserDetails.java` — implements UserDetails with our User fields
- `CustomUserDetailsService.java` — loads user by ID from MongoDB

**Part C — Security:**
- `SecurityConfig.java` — full configuration wiring everything together
- `CorsConfig.java` — allow frontend origin

```bash
git commit -m "feat(security): add JwtTokenProvider with generate and validate methods"
git commit -m "feat(security): add JwtAuthenticationFilter for stateless JWT extraction"
git commit -m "feat(security): add CustomUserDetails and CustomUserDetailsService"
git commit -m "feat(security): add OAuth2SuccessHandler that issues JWT on Google login"
git commit -m "feat(security): add SecurityConfig with stateless session and OAuth2 flow"
git commit -m "feat(security): add CorsConfig allowing React frontend origin"
```

**Test it works:**
```bash
# Start the backend
# Visit: http://localhost:8080/oauth2/authorization/google
# Should redirect to Google login
# After login should redirect to: http://localhost:5173/oauth2/callback?token=eyJ...
```

**Notify team:** "OAuth + JWT is working. You can now test your endpoints with Bearer tokens."

---

### 📌 STEP 3 — Notification Document + Service (Day 4–5)

```bash
git checkout main && git pull origin main
git checkout -b feature/member4/notification-service
```

**What to do:**
- Create `Notification.java` MongoDB document
- Create `NotificationRepository.java`
- Create `NotificationService.java` interface — other services call this
- Create `NotificationServiceImpl.java`:
  - `createNotification(type, message, userId)` — called by Booking + Ticket services
  - `getNotificationsForUser(userId)` — latest first
  - `getUnreadCount(userId)` — for bell badge
  - `markAsRead(notificationId, userId)`
  - `markAllAsRead(userId)`
  - `deleteNotification(notificationId, userId)`

```bash
git commit -m "feat(notification): add Notification MongoDB document and repository"
git commit -m "feat(notification): add NotificationService interface for cross-module use"
git commit -m "feat(notification): implement NotificationServiceImpl with full CRUD"
git commit -m "feat(notification): implement getUnreadCount for bell badge endpoint"
```

**Share the interface** with Members 2 and 3 so they can call it from their services.

---

### 📌 STEP 4 — User + Notification Controllers (Day 5–6)

```bash
git checkout main && git pull origin main
git checkout -b feature/member4/user-notification-controllers
```

**NotificationController.java** (5 endpoints):
```
GET    /api/notifications                    → 200 (own, paginated)
GET    /api/notifications/unread-count       → 200 { "count": 3 }
PATCH  /api/notifications/{id}/read          → 200
PATCH  /api/notifications/read-all           → 200
DELETE /api/notifications/{id}               → 204
```

**UserController.java** (4 endpoints):
```
GET    /api/users                            → 200 (admin only)
GET    /api/users/{id}                       → 200 (admin only)
PATCH  /api/users/{id}/role                  → 200 (admin only)
GET    /api/users/me                         → 200 (any authenticated)
```

**AuthController.java** (optional):
```
GET    /api/config                           → 200 (public, Code-on-Demand constraint)
```

**Commit messages:**
```bash
git commit -m "feat(notification): add NotificationController with 5 endpoints"
git commit -m "feat(user): add UserController with admin user management endpoints"
git commit -m "feat(user): add GET /api/users/me for authenticated user profile"
git commit -m "feat(auth): add GET /api/config for Code-on-Demand REST constraint"
```

---

### 📌 STEP 5 — GitHub Actions CI Pipeline (Day 6) 🔴 DO THIS EARLY

```bash
git checkout main && git pull origin main
git checkout -b feature/member4/github-actions-ci
```

**Create `.github/workflows/ci.yml`** — use the full pipeline from the master prompt.

Key requirements for full marks:
- Triggers on push to `main` and `develop`, and on PRs to `main`
- Backend job: compile → run tests → package
- Frontend job: npm install → build
- Upload test results as artifacts
- Use embedded MongoDB for backend tests (no external DB needed in CI)

```bash
git commit -m "ci: add GitHub Actions pipeline for Spring Boot build and test"
git commit -m "ci: add frontend npm build job to CI pipeline"
git commit -m "ci: add embedded MongoDB service for backend integration tests"
```

---

### 📌 STEP 6 — React Frontend — Auth + Notifications (Day 6–9)

```bash
git checkout main && git pull origin main
git checkout -b feature/member4/auth-notifications-frontend
```

**Build in this order:**

**Day 6 — Auth:**
```bash
# LoginPage.jsx — Google sign-in button → redirects to backend OAuth
# OAuthCallbackPage.jsx — extracts token, stores in Zustand, redirects to dashboard
# authStore.js — Zustand store for user + token + isAuthenticated
# ProtectedRoute.jsx — redirects to /login if not authenticated
git commit -m "feat(auth-ui): add LoginPage with Google sign-in button"
git commit -m "feat(auth-ui): add OAuthCallbackPage handling JWT from URL params"
git commit -m "feat(auth-ui): add Zustand authStore with persist middleware"
git commit -m "feat(auth-ui): add ProtectedRoute with role-based redirect"
```

**Day 7 — Notification Bell + Panel:**
```bash
# NotificationBell.jsx — bell icon in header + unread count badge
# NotificationList.jsx — dropdown panel with list of notifications
# NotificationItem.jsx — single notification with mark-read + navigate to reference
# useNotifications.js — React Query hook with 30s polling interval
git commit -m "feat(notification-ui): add NotificationBell with unread count badge"
git commit -m "feat(notification-ui): add NotificationList dropdown panel"
git commit -m "feat(notification-ui): add useNotifications hook with polling"
```

**Day 8 — Admin: User Management + Role Change:**
```bash
# UserManagePage.jsx — table with all users, role dropdown per row
# UserTable.jsx — sortable table with search by name/email
git commit -m "feat(admin-ui): add UserManagePage with role assignment table"
```

**Day 9 — Innovation Option A (Admin Dashboard):**
```bash
# AdminDashboard.jsx — stat cards + recharts charts from aggregation API
git commit -m "feat(admin-ui): add AdminDashboard with stats cards and charts"
git commit -m "feat(admin-ui): add recharts bookings donut chart and top resources bar chart"
```

---

### 📌 STEP 7 — Innovation Option F (Dark Mode) (Day 10 — 30 mins)

```bash
git checkout main && git pull origin main
git checkout -b feature/member4/dark-mode
```

```bash
git commit -m "feat(ui): add dark mode toggle using next-themes in app header"
```

---

## Member 4 — Feature Branch Summary

| Order | Branch Name | What It Covers | PR Title |
|-------|------------|----------------|----------|
| 1st 🔴 | `feature/member4/user-document` | User doc, BaseDocument, UserRole | feat: User document and BaseDocument shared class |
| 2nd 🔴 | `feature/member4/oauth-jwt-security` | Full OAuth2 + JWT + Security config | feat: Complete OAuth2 Google login with JWT |
| 3rd | `feature/member4/notification-service` | Notification doc, service, interface | feat: Notification service for cross-module use |
| 4th | `feature/member4/user-notification-controllers` | 9 REST endpoints | feat: User and Notification REST controllers |
| 5th | `feature/member4/github-actions-ci` | Full CI pipeline | ci: GitHub Actions build and test pipeline |
| 6th | `feature/member4/auth-notifications-frontend` | Login, OAuth callback, bell, admin | feat: Auth flow, notification bell, admin UI |
| 7th | `feature/member4/dark-mode` | Dark/light toggle | feat: Dark mode toggle with next-themes |

---

---

# 📋 FULL TEAM TIMELINE

```
Week 1 — Foundation (24–31 Mar)
────────────────────────────────────────────────────────────────
Day 1   ALL     → Repo setup, clone, project scaffold
Day 1–2 M4      → User doc + BaseDocument (URGENT — share with team)
Day 2–3 M4      → OAuth + JWT + Security (URGENT)
Day 2–3 M1      → Resource entity + repo
Day 2–3 M2      → Booking entity + repo (conflict query)
Day 2–3 M3      → Ticket document (embedded design)

Week 2 — Core Build (1–7 Apr)
────────────────────────────────────────────────────────────────
Day 3–4 M1      → Resource service + DTOs
Day 3–5 M2      → Booking service + DTOs
Day 3–5 M3      → Ticket service + DTOs + file storage
Day 3–5 M4      → Notification service + share interface
Day 4–5 M1      → Resource controller (8 endpoints)
Day 4–6 M2      → Booking controller + BookingConflictException
Day 5–6 M3      → Ticket + Comment controllers (13 endpoints)
Day 5–6 M4      → User + Notification controllers
Day 6   M4      → GitHub Actions CI pipeline ← Do this early!
Day 5–6 ALL     → Unit tests for own service

Week 3 — Viva Prep (8–11 Apr)
────────────────────────────────────────────────────────────────
Day 6–7 M1      → Resource frontend
Day 6–8 M2      → Booking frontend
Day 7–9 M3      → Ticket frontend
Day 6–8 M4      → Auth + Notification + Admin frontend
Day 10  ALL     → Integration testing (frontend ↔ backend)
Day 10  M2      → Calendar + QR innovation
Day 10  M3      → SLA timer innovation
Day 10  M4      → Admin dashboard + dark mode

Week 4–5 — Report & Submit (12–27 Apr)
────────────────────────────────────────────────────────────────
Day 1   ALL     → Final integration pass + bug fixes
Day 2–3 ALL     → Postman collections + screenshots
Day 2–5 ALL     → Write final report (architecture diagrams, endpoint table, test evidence)
Day 6   ALL     → Update README, final zip check
Day 7   ALL     → Submit via Courseweb by 11:45 PM 27 Apr
```

---

# ✅ PR CHECKLIST (Every Pull Request)

Before requesting review, check every item:

```
□ Branch is up to date with main (git pull origin main && git merge main)
□ Code compiles without errors (mvn compile / npm run build)
□ All new methods have meaningful variable names
□ Input validation added to all request DTOs
□ Correct HTTP status codes returned
□ At least one test added for the new feature
□ No hardcoded secrets or passwords in code
□ No node_modules, target/, .env committed
□ PR title follows format: "feat/fix/test/ci(scope): description"
□ PR description explains what was built and how to test it
```

---

# 🏅 MARKS OPTIMISATION TIPS

| Action | Which Marks It Earns |
|--------|---------------------|
| Commit every day with descriptive messages | Git usage — 5 marks |
| Use feature branches + PRs for everything | GitHub Flow — 5 marks |
| CI pipeline passing (green checkmark) | GitHub Actions — 5 marks |
| Each member has at minimum 4 different HTTP method endpoints | REST API — 35 marks |
| Add HATEOAS links to all response DTOs | REST constraints — 10 marks |
| Add `@Valid` + global exception handler | Code quality — 5 marks |
| Loading skeletons, toasts, empty states in React | UI/UX — 10 marks |
| Implement 2–3 innovation features | Creativity — 10 marks |
| Write the report with architecture diagrams | Documentation — 15 marks |

---

*Smart Campus Operations Hub — GitHub Workflow Guide v1.0*
*IT3030 PAF 2026 | SLIIT Faculty of Computing*
