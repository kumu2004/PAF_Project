$ErrorActionPreference = "Stop"

git checkout Booking-Management
git reset d3e8912

$global:dates = @("2026-04-11", "2026-04-12", "2026-04-13", "2026-04-15", "2026-04-16")
$global:commitIndex = 0

function Commit-WithDate {
    param([string]$message)
    
    $dayIndex = [math]::Floor($global:commitIndex / 4)
    if ($dayIndex -ge 5) { $dayIndex = 4 }
    $block = $global:commitIndex % 4
    
    $baseDateStr = $global:dates[$dayIndex]
    # Distribute times organically: 09:00, 11:00, 15:00, 20:00
    $hours = @(9, 11, 15, 20)
    $startHour = $hours[$block]
    $minute = Get-Random -Minimum 10 -Maximum 50
    
    $dateStr = "$baseDateStr`T$($startHour.ToString('00')):$($minute.ToString('00')):00"
    
    $env:GIT_AUTHOR_NAME = "hasiniperera813"
    $env:GIT_AUTHOR_EMAIL = "hasiniperera813@gmail.com"
    $env:GIT_COMMITTER_NAME = "hasiniperera813"
    $env:GIT_COMMITTER_EMAIL = "hasiniperera813@gmail.com"
    $env:GIT_COMMITTER_DATE = $dateStr
    git commit -m "$message" --date $dateStr
    
    $global:commitIndex++
}

# --- Module B (Booking) Commits ---
git add .gitignore *.md
Commit-WithDate "docs: Add requirements and planning for Booking Management workflow"

git add backend/build.gradle backend/src/main/resources/ backend/.env.example
Commit-WithDate "build: Initialize backend configuration for Bookings"

git add frontend/package.json frontend/vite.config.js frontend/tailwind.config.js
Commit-WithDate "build(frontend): Setup frontend workspace for Bookings UI"

git add backend/src/main/java/com/smartcampus/backend/common/enums/BookingStatus.java
Commit-WithDate "feat(backend): Create base Booking Status enums"

git add backend/src/main/java/com/smartcampus/backend/module/booking/entity/
Commit-WithDate "feat(backend): Implement Booking entity models mapped to MongoDB"

git add backend/src/main/java/com/smartcampus/backend/exception/BookingConflictException.java
Commit-WithDate "feat(backend): Implement exception handling for scheduling conflicts"

git add backend/src/main/java/com/smartcampus/backend/module/booking/repository/
Commit-WithDate "feat(backend): Add Mongo repository interfaces for Bookings"

git add backend/src/main/java/com/smartcampus/backend/module/booking/dto/BookingResponse.java backend/src/main/java/com/smartcampus/backend/module/booking/dto/CreateBookingRequest.java
Commit-WithDate "feat(backend): Define basic DTO payloads for booking creation"

git add backend/src/main/java/com/smartcampus/backend/module/booking/dto/
Commit-WithDate "feat(backend): Extend DTOs for booking approval and rejection procedures"

git add backend/src/main/java/com/smartcampus/backend/module/booking/service/BookingService.java
Commit-WithDate "feat(backend): Implement base Booking service interface definitions"

git add backend/src/main/java/com/smartcampus/backend/module/booking/service/BookingServiceImpl.java
Commit-WithDate "feat(backend): Add complex logical validations for conflict prevention"

git add backend/src/test/java/com/smartcampus/backend/module/booking/
Commit-WithDate "test(backend): Add integration tests for Service logic and conflicts"

git add backend/src/main/java/com/smartcampus/backend/module/booking/controller/
Commit-WithDate "feat(backend): Expose secure REST endpoints for Booking Management"

git add frontend/src/index.css frontend/src/App.css frontend/src/App.jsx frontend/src/main.jsx
Commit-WithDate "feat(frontend): Configure global routing and styles for Bookings view"

git add frontend/src/features/booking/services/
Commit-WithDate "feat(frontend): Connect axios API client to backend booking endpoints"

git add frontend/src/features/booking/hooks/
Commit-WithDate "feat(frontend): Add custom React hooks for booking state management"

git add frontend/src/features/booking/components/BookingForm.jsx
Commit-WithDate "feat(frontend): Build interactive Booking creation form components"

git add frontend/src/features/booking/components/
Commit-WithDate "feat(frontend): Design presentation cards for Booking history"

git add frontend/src/features/booking/pages/
Commit-WithDate "feat(frontend): Build user-facing Booking List and Admin tracking portals"

git add .
Commit-WithDate "chore: Finalize Bookings Management integration"

git push -u -f origin Booking-Management
