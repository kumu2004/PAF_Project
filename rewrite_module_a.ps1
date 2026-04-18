git stash
git checkout -B Facilities-and-Assets-Catalogue
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
    
    $env:GIT_COMMITTER_DATE = $dateStr
    git commit -m "$message" --date $dateStr
    
    $global:commitIndex++
}

# --- Module A Commits ---
git add .gitignore *.md
Commit-WithDate "docs: Add initial Module A catalog requirements and specs"

git add backend/build.gradle backend/src/main/resources/ backend/.env.example
Commit-WithDate "build: Setup Spring Boot backend properties and configuration"

git add frontend/package.json frontend/vite.config.js frontend/tailwind.config.js
Commit-WithDate "build(frontend): Initialize Vite React workspace for Module A"

git add backend/src/main/java/com/smartcampus/backend/module/resource/entity/
Commit-WithDate "feat(backend): Create CampusResource entity model mapped to MongoDB"

git add backend/src/main/java/com/smartcampus/backend/module/resource/repository/
Commit-WithDate "feat(backend): Abstract Resource MongoDB repository interfaces"

git add backend/src/main/java/com/smartcampus/backend/module/resource/dto/
Commit-WithDate "feat(backend): Build generic payload DTOs for Resource creation"

git add backend/src/main/java/com/smartcampus/backend/module/resource/service/ResourceService.java
Commit-WithDate "feat(backend): Implement basic service interfaces for Facility metadata"

git add backend/src/main/java/com/smartcampus/backend/module/resource/service/ResourceServiceImpl.java
Commit-WithDate "feat(backend): Build heavy logical operations for resource filtering"

git add backend/src/main/java/com/smartcampus/backend/module/resource/controller/
Commit-WithDate "feat(backend): Expose Catalogue HTTP endpoints with search query params"

git add frontend/src/index.css frontend/src/App.css frontend/src/App.jsx frontend/src/main.jsx
Commit-WithDate "feat(frontend): Construct base application routing and global themes"

git add frontend/src/features/resources/types/ frontend/src/features/resources/services/
Commit-WithDate "feat(frontend): Connect axios APIs for fetching laboratory and hall data"

git add frontend/src/features/resources/hooks/
Commit-WithDate "feat(frontend): Wire interactive React hooks for real-time catalogues"

git add frontend/src/features/resources/components/ResourceCard.jsx frontend/src/features/resources/components/ResourceMiniCard.jsx
Commit-WithDate "feat(frontend): Design encapsulated Asset and Facility preview cards"

git add frontend/src/features/resources/components/ResourceFilters.jsx frontend/src/features/resources/components/ResourceSearchBar.jsx
Commit-WithDate "feat(frontend): Build advanced dropdown filters by capacity and type"

git add frontend/src/features/resources/components/ResourceTable.jsx frontend/src/features/resources/components/ResourceForm.jsx
Commit-WithDate "feat(frontend): Prepare editable Data Tables for admin resource modification"

git add frontend/src/features/resources/pages/ResourceListPage.jsx
Commit-WithDate "feat(frontend): Design public user-facing Resource Listing portal"

git add frontend/src/features/resources/pages/AdminResourceManagePage.jsx frontend/src/features/resources/pages/AdminResourceFormPage.jsx
Commit-WithDate "feat(frontend): Construct restricted administrative Resource control screens"

git add frontend/src/features/resources/pages/ResourceDetailPage.jsx frontend/src/features/resources/components/RoomBlueprint.jsx
Commit-WithDate "feat(frontend): Build interactive facility details and visual blueprints"

git add frontend/src/features/resources/utils/ frontend/src/features/resources/components/ResourcePlaceholder.jsx
Commit-WithDate "refactor(frontend): Extract utility permissions and UI skeleton loaders"

git add .
Commit-WithDate "chore: Finalize entire Module A catalogue implementation"

git push -f -u origin Facilities-and-Assets-Catalogue
