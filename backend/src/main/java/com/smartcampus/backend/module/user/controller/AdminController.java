package com.smartcampus.backend.module.user.controller;

import com.smartcampus.backend.common.dto.ApiResponse;
import com.smartcampus.backend.module.user.dto.AdminAnalyticsResponse;
import com.smartcampus.backend.module.user.dto.AdminStatsResponse;
import com.smartcampus.backend.module.user.dto.AdminUserDto;
import com.smartcampus.backend.module.user.dto.ApprovedRegistrationDto;
import com.smartcampus.backend.module.user.entity.User;
import com.smartcampus.backend.module.user.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Admin stats retrieved", adminService.getStats()));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminAnalyticsResponse>> getAnalytics() {
        try {
            log.info("Fetching admin analytics...");
            AdminAnalyticsResponse response = adminService.getAnalytics();
            log.info("Successfully retrieved analytics data");
            return ResponseEntity.ok(ApiResponse.success("Admin detailed analytics retrieved", response));
        } catch (Exception e) {
            log.error("Error fetching admin analytics: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch analytics: " + e.getMessage()));
        }
    }

    @GetMapping("/registrations/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getPendingRegistrations() {
        return ResponseEntity.ok(ApiResponse.success("Pending registrations retrieved", adminService.getPendingRegistrations()));
    }

    @GetMapping("/registrations/approved")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ApprovedRegistrationDto>>> getApprovedRegistrations() {
        return ResponseEntity.ok(ApiResponse.success("Approved registrations retrieved", adminService.getApprovedRegistrations()));
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminUserDto>>> getTechnicians() {
        try {
            log.info("Admin request to get all technicians");
            List<AdminUserDto> technicians = adminService.getTechnicians();
            log.info("Successfully retrieved {} technicians", technicians.size());
            return ResponseEntity.ok(ApiResponse.success("Technicians retrieved successfully", technicians));
        } catch (Exception e) {
            log.error("Error retrieving technicians", e);
            return ResponseEntity.status(500).body(
                    ApiResponse.error("Failed to retrieve technicians: " + e.getMessage())
            );
        }
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminUserDto>>> getUsers(
            @RequestParam(value = "search", required = false) String search
    ) {
        try {
            log.info("Admin request to get users with search: {}", search);
            List<AdminUserDto> users = adminService.getAllUsers(search);
            log.info("Successfully retrieved {} users", users.size());
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
        } catch (Exception e) {
            log.error("Error retrieving users", e);
            return ResponseEntity.status(500).body(
                    ApiResponse.error("Failed to retrieve users: " + e.getMessage())
            );
        }
    }

    @RequestMapping(path = "/users/{userId}/disable", method = {RequestMethod.PATCH, RequestMethod.POST})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> disableUser(@PathVariable String userId) {
        try {
            adminService.disableUser(userId);
            return ResponseEntity.ok(ApiResponse.success("User disabled successfully.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @RequestMapping(path = "/users/{userId}/enable", method = {RequestMethod.PATCH, RequestMethod.POST})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> enableUser(@PathVariable String userId) {
        try {
            adminService.enableUser(userId);
            return ResponseEntity.ok(ApiResponse.success("User enabled successfully.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String userId) {
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully.", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
