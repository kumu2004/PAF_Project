package com.smartcampus.backend.module.user.controller;

import com.smartcampus.backend.module.user.dto.*;
import com.smartcampus.backend.module.user.service.AuthService;
import com.smartcampus.backend.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody StudentRegisterRequest request) {
        try {
            AuthResponse response = authService.registerStudent(request);
            log.info("Student registration successful: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.warn("Student registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register/lecturer")
    public ResponseEntity<?> registerLecturer(@Valid @RequestBody LecturerRegisterRequest request) {
        try {
            authService.registerLecturer(request);
            log.info("Lecturer registration submitted: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Registration pending admin approval."));
        } catch (RuntimeException e) {
            log.warn("Lecturer registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register/technician")
    public ResponseEntity<?> registerTechnician(@Valid @RequestBody TechnicianRegisterRequest request) {
        try {
            authService.registerTechnician(request);
            log.info("Technician registration submitted: {}", request.getEmail());
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Registration pending admin approval."));
        } catch (RuntimeException e) {
            log.warn("Technician registration failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            log.info("Login successful for: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.warn("Login failed for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        try {
            AuthResponse response = authService.adminLogin(request);
            log.info("Admin login successful for: {}", request.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.warn("Admin login failed for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/approve-registration/{userId}")
    public ResponseEntity<?> approveRegistration(
            @PathVariable String userId,
            @RequestBody ApproveRegistrationRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            // Extract admin identity from the JWT-authenticated security context
            String adminId = (userDetails != null) ? userDetails.getId() : SecurityContextHolder.getContext().getAuthentication().getName();
            authService.approveOrRejectRegistration(userId, request, adminId);
            return ResponseEntity.ok(Map.of("message", "Registration processed successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    // ── Password reset (OTP) ─────────────────────────────────────────────────

    @PostMapping("/password-reset/request-otp")
    public ResponseEntity<?> requestPasswordResetOtp(@RequestBody Map<String, String> body) {
        try {
            authService.requestPasswordResetOtp(body.get("email"));
            return ResponseEntity.ok(Map.of("message", "OTP sent to email."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/password-reset/verify-otp")
    public ResponseEntity<?> verifyPasswordResetOtp(@RequestBody Map<String, String> body) {
        try {
            authService.verifyPasswordResetOtp(body.get("email"), body.get("otp"));
            return ResponseEntity.ok(Map.of("message", "OTP verified."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/password-reset/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            authService.resetPassword(body.get("email"), body.get("newPassword"), body.get("confirmPassword"));
            return ResponseEntity.ok(Map.of("message", "Password reset successful."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/admin/pending-registrations")
    public ResponseEntity<?> getPendingRegistrations() {
        try {
            return ResponseEntity.ok(authService.getPendingRegistrations());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }
}