# 📚 Postman Testing Guide - Smart Campus Booking API

**Last Updated:** April 7, 2026  
**Backend Port:** http://localhost:8080  
**Project:** Smart Campus Operation Hub

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Create Postman Environment](#create-postman-environment)
3. [Test Endpoints](#test-endpoints)
   - [Login](#test-1-login)
   - [Create Booking](#test-2-create-booking)
   - [Approve Booking](#test-3-approve-booking)
   - [Reject Booking](#test-4-reject-booking)
   - [Get My Bookings](#test-5-get-my-bookings)
   - [Get All Bookings (Admin Only)](#test-6-get-all-bookings-admin-only)
   - [Cancel Booking](#test-7-cancel-booking)
   - [Conflict Detection](#test-8-conflict-detection)
4. [Test Credentials](#test-credentials)
5. [Expected Responses](#expected-responses)
6. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Prerequisites
- ✅ Backend running on `http://localhost:8080`
- ✅ Postman installed
- ✅ `.env` file configured with credentials

### Verify Backend is Running
```bash
# In terminal, from root project directory:
cd backend
.\mvnw.cmd spring-boot:run
```

Wait for message: `Started BackendApplication in X seconds`

Check health:
```
GET http://localhost:8080/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

---

## Create Postman Environment

### Step 1: Open Postman
Launch the Postman application on your computer.

### Step 2: Create New Environment
1. Click **Environments** in the left sidebar
2. Click **Create** or **+**
3. Name it: `Smart Campus Dev`
4. Click **Create**

### Step 3: Add Variables

Add these environment variables:

| Variable | Initial Value | Description |
|----------|---|---|
| `BASE_URL` | `http://localhost:8080` | Backend base URL |
| `ADMIN_TOKEN` | *(empty - fill after login)* | JWT token for admin user |
| `USER_TOKEN` | *(empty - fill after login)* | JWT token for regular user |
| `BOOKING_ID` | *(empty - fill after create)* | ID of created booking |
| `RESOURCE_ID` | `507f1f77bcf86cd799439012` | Test resource ID |

Click **Save** (Ctrl+S / Cmd+S)

### Step 4: Activate Environment
- Top right of Postman, click the environment dropdown
- Select **Smart Campus Dev**
- It should show as active (orange/blue highlight)

---

## Test Endpoints

---

### TEST 1: LOGIN

**Purpose:** Obtain JWT token for testing protected endpoints

#### Request Details
```
POST {{BASE_URL}}/api/auth/login
Content-Type: application/json
```

#### Headers
```
Content-Type: application/json
```

(No Authorization header needed for login)

#### Request Body
```json
{
  "email": "adminpaf@gmail.com",
  "password": "admin@123"
}
```

#### Steps in Postman
1. Click **+ New** → **Request**
2. Name: `01 - Login Admin`
3. Method: **POST**
4. URL: `{{BASE_URL}}/api/auth/login`
5. Click **Headers** tab → verify `Content-Type: application/json`
6. Click **Body** tab → select **raw** → select **JSON** from dropdown
7. Paste the request body above
8. Click **Send**

#### Expected Response: 200 OK
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NjBhMjkwOGM4ZDVkMDAwMDAwMDAwMDEiLCJpYXQiOjE3MTE3MDgwMDAsImV4cCI6MTcxMTc5NDQwMH0.aB1cD2e3F4g5h6i7j8k9L0M1n2O3p4Q5r6S7t8U9v0W",
  "user": {
    "id": "660a2908c8d5d000000000012",
    "email": "adminpaf@gmail.com",
    "role": "ADMIN"
  }
}
```

#### Save Token to Environment
1. Copy the entire `token` value (very long string starting with `eyJ...`)
2. Go to **Environments** → **Smart Campus Dev**
3. Find `ADMIN_TOKEN` row
4. Set **Current Value** = paste the token
5. Click **Save**

---

### TEST 2: CREATE BOOKING

**Purpose:** Create a new booking request

#### Request Details
```
POST {{BASE_URL}}/api/bookings
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

#### Headers
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

#### Request Body
```json
{
  "resourceId": "{{RESOURCE_ID}}",
  "startTime": "2026-04-12T10:00:00",
  "endTime": "2026-04-12T11:30:00",
  "purpose": "Weekly team sync meeting",
  "expectedAttendees": 8
}
```

#### Steps in Postman
1. Click **+ New** → **Request**
2. Name: `02 - Create Booking`
3. Method: **POST**
4. URL: `{{BASE_URL}}/api/bookings`
5. **Headers** tab:
   - `Authorization: Bearer {{ADMIN_TOKEN}}`
   - `Content-Type: application/json`
6. **Body** tab → select **raw** → select **JSON**
7. Paste the request body above
8. Click **Send**

#### Expected Response: 201 Created
```json
{
  "id": "660b3a5c9d7e1f00000000ab",
  "resourceId": "507f1f77bcf86cd799439012",
  "userId": "660a2908c8d5d000000000012",
  "startTime": "2026-04-12T10:00:00",
  "endTime": "2026-04-12T11:30:00",
  "purpose": "Weekly team sync meeting",
  "expectedAttendees": 8,
  "status": "PENDING",
  "createdAt": "2026-04-07T15:45:00.000+05:30",
  "links": {
    "self": "/api/bookings/660b3a5c9d7e1f00000000ab",
    "resource": "/api/resources/507f1f77bcf86cd799439012",
    "cancel": "/api/bookings/660b3a5c9d7e1f00000000ab/cancel",
    "approve": "/api/bookings/660b3a5c9d7e1f00000000ab/approve",
    "reject": "/api/bookings/660b3a5c9d7e1f00000000ab/reject"
  }
}
```

#### Save Booking ID to Environment
1. Copy the `id` from response (e.g., `660b3a5c9d7e1f00000000ab`)
2. Go to **Environments** → **Smart Campus Dev**
3. Find `BOOKING_ID` row
4. Set **Current Value** = paste the ID
5. Click **Save**

---

### TEST 3: APPROVE BOOKING

**Purpose:** Admin approves a pending booking

#### Request Details
```
PATCH {{BASE_URL}}/api/bookings/{{BOOKING_ID}}/approve
Authorization: Bearer {{ADMIN_TOKEN}}
```

#### Headers
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

#### Request Body
**LEAVE EMPTY** (no body needed for approve endpoint)

#### Steps in Postman
1. Click **+ New** → **Request**
2. Name: `03 - Approve Booking`
3. Method: **PATCH**
4. URL: `{{BASE_URL}}/api/bookings/{{BOOKING_ID}}/approve`
5. **Headers** tab:
   - `Authorization: Bearer {{ADMIN_TOKEN}}`
6. **Body** tab: Leave empty (don't click Body at all)
7. Click **Send**

#### Expected Response: 200 OK
```json
{
  "id": "660b3a5c9d7e1f00000000ab",
  "resourceId": "507f1f77bcf86cd799439012",
  "userId": "660a2908c8d5d000000000012",
  "startTime": "2026-04-12T10:00:00",
  "endTime": "2026-04-12T11:30:00",
  "purpose": "Weekly team sync meeting",
  "expectedAttendees": 8,
  "status": "APPROVED",
  "approvedAt": "2026-04-07T15:46:22.123+05:30",
  "createdAt": "2026-04-07T15:45:00.000+05:30",
  "links": {
    "self": "/api/bookings/660b3a5c9d7e1f00000000ab",
    "resource": "/api/resources/507f1f77bcf86cd799439012"
  }
}
```

✅ **Status changed from PENDING → APPROVED**

---

### TEST 4: REJECT BOOKING

**Purpose:** Admin rejects a pending booking with reason

#### Create Another Booking First
Repeat TEST 2 but with different time:
```json
{
  "resourceId": "{{RESOURCE_ID}}",
  "startTime": "2026-04-13T14:00:00",
  "endTime": "2026-04-13T15:00:00",
  "purpose": "Training session",
  "expectedAttendees": 15
}
```

Save the new booking ID as `BOOKING_ID_2` in environment.

#### Request Details
```
PATCH {{BASE_URL}}/api/bookings/{{BOOKING_ID_2}}/reject
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

#### Headers
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

#### Request Body
```json
{
  "reason": "Room already reserved by another department"
}
```

#### Steps in Postman
1. Click **+ New** → **Request**
2. Name: `04 - Reject Booking`
3. Method: **PATCH**
4. URL: `{{BASE_URL}}/api/bookings/{{BOOKING_ID_2}}/reject`
5. **Headers** tab:
   - `Authorization: Bearer {{ADMIN_TOKEN}}`
   - `Content-Type: application/json`
6. **Body** tab → select **raw** → select **JSON**
7. Paste the request body above
8. Click **Send**

#### Expected Response: 200 OK
```json
{
  "id": "660b3a5c9d7e1f00000000ac",
  "status": "REJECTED",
  "rejectionReason": "Room already reserved by another department",
  "createdAt": "2026-04-07T15:50:00.000+05:30"
}
```

✅ **Status changed to REJECTED**

---

### TEST 5: GET MY BOOKINGS

**Purpose:** User views their own bookings

#### Request Details
```
GET {{BASE_URL}}/api/bookings/my
Authorization: Bearer {{ADMIN_TOKEN}}
```

#### Headers
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

#### Request Body
**LEAVE EMPTY**

#### Steps in Postman
1. Click **+ New** → **Request**
2. Name: `05 - Get My Bookings`
3. Method: **GET**
4. URL: `{{BASE_URL}}/api/bookings/my`
5. **Headers** tab:
   - `Authorization: Bearer {{ADMIN_TOKEN}}`
6. **Body** tab: Leave empty
7. Click **Send**

#### Expected Response: 200 OK
```json
[
  {
    "id": "660b3a5c9d7e1f00000000ab",
    "resourceId": "507f1f77bcf86cd799439012",
    "userId": "660a2908c8d5d000000000012",
    "status": "APPROVED",
    "startTime": "2026-04-12T10:00:00",
    "endTime": "2026-04-12T11:30:00",
    "purpose": "Weekly team sync meeting"
  },
  {
    "id": "660b3a5c9d7e1f00000000ac",
    "status": "REJECTED",
    "rejectionReason": "Room already reserved"
  }
]
```

✅ **User sees only their own bookings**

---

### TEST 6: GET ALL BOOKINGS (Admin Only)

**Purpose:** Admin views all bookings in system

#### Request Details
```
GET {{BASE_URL}}/api/bookings
Authorization: Bearer {{ADMIN_TOKEN}}
```

#### Headers
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

#### Request Body
**LEAVE EMPTY**

#### Steps in Postman
1. Click **+ New** → **Request**
2. Name: `06 - Get All Bookings (Admin)`
3. Method: **GET**
4. URL: `{{BASE_URL}}/api/bookings`
5. **Headers** tab:
   - `Authorization: Bearer {{ADMIN_TOKEN}}`
6. **Body** tab: Leave empty
7. Click **Send**

#### Expected Response: 200 OK
```json
[
  {
    "id": "660b3a5c9d7e1f00000000ab",
    "status": "APPROVED",
    ...
  },
  {
    "id": "660b3a5c9d7e1f00000000ac",
    "status": "REJECTED",
    ...
  }
]
```

✅ **Admin sees all bookings**

---

### TEST 7: CANCEL BOOKING

**Purpose:** User cancels their own PENDING or APPROVED booking

#### Request Details
```
PATCH {{BASE_URL}}/api/bookings/{{BOOKING_ID}}/cancel
Authorization: Bearer {{ADMIN_TOKEN}}
```

#### Headers
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

#### Request Body
**LEAVE EMPTY**

#### Steps in Postman
1. Click **+ New** → **Request**
2. Name: `07 - Cancel Booking`
3. Method: **PATCH**
4. URL: `{{BASE_URL}}/api/bookings/{{BOOKING_ID}}/cancel`
5. **Headers** tab:
   - `Authorization: Bearer {{ADMIN_TOKEN}}`
6. **Body** tab: Leave empty
7. Click **Send**

#### Expected Response: 200 OK
```json
{
  "id": "660b3a5c9d7e1f00000000ab",
  "status": "CANCELLED",
  "createdAt": "2026-04-07T15:45:00.000+05:30"
}
```

✅ **Booking cancelled successfully**

---

### TEST 8: CONFLICT DETECTION

**Purpose:** Verify booking overlap detection returns 409 Conflict

#### Create First Booking
Same as TEST 2:
```json
{
  "resourceId": "{{RESOURCE_ID}}",
  "startTime": "2026-04-14T09:00:00",
  "endTime": "2026-04-14T10:00:00",
  "purpose": "First booking",
  "expectedAttendees": 5
}
```

#### Try to Create Overlapping Booking
Create another booking that **overlaps** in time:

```json
{
  "resourceId": "{{RESOURCE_ID}}",
  "startTime": "2026-04-14T09:30:00",
  "endTime": "2026-04-14T10:30:00",
  "purpose": "Overlapping booking",
  "expectedAttendees": 3
}
```

#### Steps in Postman
1. Click **+ New** → **Request**
2. Name: `08 - Conflict Detection Test`
3. Method: **POST**
4. URL: `{{BASE_URL}}/api/bookings`
5. **Headers** tab:
   - `Authorization: Bearer {{ADMIN_TOKEN}}`
   - `Content-Type: application/json`
6. **Body** tab → select **raw** → select **JSON**
7. Paste the overlapping booking body above
8. Click **Send**

#### Expected Response: 409 Conflict
```json
{
  "error": "BookingConflictException",
  "message": "The resource is already booked for the selected time range.",
  "status": 409,
  "timestamp": "2026-04-07T15:55:00.000+05:30"
}
```

✅ **Conflict detection working correctly!**

---

## Test Credentials

### Admin Account
```
Email:    adminpaf@gmail.com
Password: admin@123
Role:     ADMIN
```

### User Account (Student)
```
Email:    student@example.com
Password: password123
Role:     USER
```

---

## Expected Responses

### Success Responses

| Endpoint | Status | Meaning |
|----------|--------|---------|
| Login | 200 OK | JWT token generated |
| Create Booking | 201 Created | New booking in PENDING status |
| Approve | 200 OK | Booking status → APPROVED |
| Reject | 200 OK | Booking status → REJECTED |
| Get Bookings | 200 OK | Returns booking list |
| Cancel | 200 OK | Booking status → CANCELLED |

### Error Responses

| Scenario | Status | Message |
|----------|--------|---------|
| Missing JWT token | 401 Unauthorized | "Authorization header is missing" |
| Invalid/expired JWT | 401 Unauthorized | "Token validation failed" |
| User not authorized | 403 Forbidden | "Access Denied" |
| Resource not found | 404 Not Found | "Booking not found with ID" |
| **Time conflict** | **409 Conflict** | "Resource already booked for time range" |
| Invalid request | 400 Bad Request | Validation error details |

---

## Troubleshooting

### Backend not running
```
Error: Connection refused at localhost:8080
```

**Solution:**
```bash
cd backend
.\mvnw.cmd spring-boot:run
```

Wait for: `Started BackendApplication in X seconds`

---

### Port 8080 already in use
```
Error: Port 8080 was already in use
```

**Solution:**
1. Check Windows Task Manager for Tomcat or Java processes
2. Stop them or restart computer

---

### JWT Token Invalid
```
Error: 401 Unauthorized - Token validation failed
```

**Solution:**
1. Generate new token using Login endpoint (TEST 1)
2. Update `ADMIN_TOKEN` in Postman environment
3. Make sure there are no extra spaces in token

---

### Authorization Denied (403)
```
Error: 403 Forbidden - Access Denied
```

**Causes:**
- GET `/api/bookings` (all bookings) requires ADMIN role
- Using USER_TOKEN instead of ADMIN_TOKEN

**Solution:**
- Use ADMIN account to login for admin-only endpoints
- Check user role in login response

---

### Resource Not Found (404)
```
Error: 404 Not Found - Booking not found with ID
```

**Causes:**
- Booking ID doesn't exist in database
- Typo in URL

**Solution:**
- Create a booking first (TEST 2)
- Copy the exact ID from response
- Verify `{{BOOKING_ID}}` environment variable is set

---

### Conflict Detection Not Working
**If overlapping bookings are allowed:**
1. Make sure first booking is in PENDING or APPROVED status
2. Check time ranges actually overlap
3. Make sure using same resourceId

---

## Quick Test Checklist

- [ ] Backend running on http://localhost:8080
- [ ] Postman environment created: `Smart Campus Dev`
- [ ] Environment variables set up
- [ ] TEST 1: Login successful, token saved
- [ ] TEST 2: Booking created in PENDING status
- [ ] TEST 3: Booking approved (status → APPROVED)
- [ ] TEST 4: Booking rejected (status → REJECTED)
- [ ] TEST 5: Get my bookings works
- [ ] TEST 6: Admin can see all bookings
- [ ] TEST 7: Cancel booking works
- [ ] TEST 8: Conflict detection working (409)

---

## Summary

| Test | Endpoint | Method | Expected Status |
|------|----------|--------|-----------------|
| 1 | `/api/auth/login` | POST | 200 |
| 2 | `/api/bookings` | POST | 201 |
| 3 | `/api/bookings/{id}/approve` | PATCH | 200 |
| 4 | `/api/bookings/{id}/reject` | PATCH | 200 |
| 5 | `/api/bookings/my` | GET | 200 |
| 6 | `/api/bookings` | GET | 200 |
| 7 | `/api/bookings/{id}/cancel` | PATCH | 200 |
| 8 | `/api/bookings` (overlap) | POST | 409 |

---

**All tests passing? Your booking backend is production-ready! 🎉**

Next: Build React booking UI components
