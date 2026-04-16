git add .gitignore *.md
git commit -m "docs: Initial project documentation and guides"

git add backend/.env.example backend/build.gradle backend/settings.gradle backend/gradlew* backend/gradle/
git commit -m "build(backend): Initial Gradle setup and environment config"

git add backend/src/main/resources/
git commit -m "chore(backend): Add application properties and resources"

git add backend/src/main/java/com/smartcampus/backend/common/
git commit -m "feat(backend): Define UserRole enums and constants"

git add backend/src/main/java/com/smartcampus/backend/config/
git commit -m "feat(backend): Setup MongoDB and Security configuration files"

git add backend/src/main/java/com/smartcampus/backend/module/user/entity/
git add backend/src/main/java/com/smartcampus/backend/module/user/repository/
git commit -m "feat(backend): Create User entity and repository"

git add backend/src/main/java/com/smartcampus/backend/module/user/dto/
git commit -m "feat(backend): Implement DTOs for user registration and login requests"

git add backend/src/main/java/com/smartcampus/backend/security/
git commit -m "feat(backend): Implement JWT authentication provider and OAuth handlers"

git add backend/src/main/java/com/smartcampus/backend/module/user/service/
git commit -m "feat(backend): Implement core authentication and user management services"

git add backend/src/main/java/com/smartcampus/backend/module/user/controller/
git commit -m "feat(backend): Create user and admin REST endpoints"

git add backend/src/main/java/com/smartcampus/backend/module/notification/
git commit -m "feat(backend): Implement notification module and services"

git add backend/src/main/java/com/smartcampus/backend/module/booking/
git commit -m "feat(backend): Setup resource booking backend logic"

git add backend/src/main/java/com/smartcampus/backend/module/ticket/
git commit -m "feat(backend): Add ticket status management endpoints"

git add backend/src/main/java/com/smartcampus/backend/module/resource/
git add backend/src/test/
git commit -m "feat(backend): Add resource management APIs and tests"

git add backend/
git commit -m "fix(backend): Finalize backend setup and missing components"

git add frontend/package* frontend/vite* frontend/tailwind* frontend/postcss* frontend/jsconfig.* frontend/eslint* frontend/index.html frontend/public/
git commit -m "build(frontend): Initialize Vite + React project configuration"

git add frontend/src/hooks/ frontend/src/store/ frontend/src/services/
git commit -m "feat(frontend): Add global state management and API client logic"

git add frontend/src/pages/AuthPage.jsx
git commit -m "feat(frontend): Setup AuthPage with validation and Google Login"

git add frontend/src/components/
git add frontend/src/pages/landing/
git commit -m "feat(frontend): Create shared UI components and landing page"

git add frontend/src/pages/admin/ frontend/src/pages/student/ frontend/src/pages/lecturer/ frontend/src/pages/technician/
git commit -m "feat(frontend): Implement role-specific dashboards"

git add frontend/src/features/
git add frontend/src/pages/
git commit -m "feat(frontend): Integrate tickets, bookings, and notifications view"

git add frontend/
git commit -m "style(frontend): Polish UI aesthetics and finalize components"

git add .
git commit -m "chore: Final project cleanup for Authentication and Authorization modules"
