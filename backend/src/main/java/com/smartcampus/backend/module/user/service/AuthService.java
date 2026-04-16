package com.smartcampus.backend.module.user.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartcampus.backend.common.enums.AccountStatus;
import com.smartcampus.backend.common.enums.NotificationType;
import com.smartcampus.backend.common.enums.UserRole;
import com.smartcampus.backend.module.auth.entity.RegistrationRequest;
import com.smartcampus.backend.module.auth.repository.RegistrationRequestRepository;
import com.smartcampus.backend.module.notification.service.NotificationService;
import com.smartcampus.backend.module.user.dto.AdminLoginRequest;
import com.smartcampus.backend.module.user.dto.ApproveRegistrationRequest;
import com.smartcampus.backend.module.user.dto.AuthResponse;
import com.smartcampus.backend.module.user.dto.LecturerRegisterRequest;
import com.smartcampus.backend.module.user.dto.LoginRequest;
import com.smartcampus.backend.module.user.dto.RegistrationRequestDto;
import com.smartcampus.backend.module.user.dto.StudentRegisterRequest;
import com.smartcampus.backend.module.user.dto.TechnicianRegisterRequest;
import com.smartcampus.backend.module.auth.entity.PasswordResetOtp;
import com.smartcampus.backend.module.auth.repository.PasswordResetOtpRepository;
import com.smartcampus.backend.module.user.entity.User;
import com.smartcampus.backend.module.user.repository.UserRepository;
import com.smartcampus.backend.security.JwtTokenProvider;
import com.smartcampus.backend.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RegistrationRequestRepository registrationRequestRepository;
    private final PasswordResetOtpRepository passwordResetOtpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final NotificationService notificationService;

    // Admin access code removed per request

    private String generateStudentId() {
        // Simple generation: ST + 8 random digits
        return "ST" + (int)(Math.random() * 90000000 + 10000000);
    }

    public AuthResponse registerStudent(StudentRegisterRequest request) {
        validateEmail(request.getEmail());
        validatePassword(request.getPassword(), request.getConfirmPassword());

        String studentId = generateStudentId();


        
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .gender(request.getGender())
                .studentId(studentId)
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .faculty(request.getFaculty())
                .academicYear(request.getAcademicYear())
                .semester(request.getSemester())
                .role(UserRole.STUDENT)
                .status(AccountStatus.ACTIVE)
                .active(true)
                .build();

        user = userRepository.save(user);
        log.info("Student registered: {} with ID: {}", user.getEmail(), user.getStudentId());

        emailService.sendWelcomeEmail(user.getEmail(), user.getFirstName() + " " + user.getLastName(), "STUDENT");

        notificationService.notifyUser(
                user.getId(),
                NotificationType.STUDENT_REGISTERED,
                "Welcome to SmartCampus",
                "Your student account has been created successfully.",
                "/notifications"
        );

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return buildResponse(user, token);
    }

    public void registerLecturer(LecturerRegisterRequest request) {
        validateEmail(request.getEmail());
        validatePassword(request.getPassword(), request.getConfirmPassword());

        User user = User.builder()
                .title(request.getTitle())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .faculty(request.getFaculty())
                .lecturerPosition(request.getPosition())
                .role(UserRole.PENDING_LECTURER)
                .status(AccountStatus.PENDING)
                .active(false)
                .build();

        user = userRepository.save(user);

        RegistrationRequest regRequest = RegistrationRequest.builder()
                .userId(user.getId())
                .requestType("LECTURER")
                .requestStatus("PENDING")
                .fullName(user.getTitle() + " " + user.getFirstName() + " " + user.getLastName())
                .email(user.getEmail())
                .faculty(user.getFaculty())
                .position(user.getLecturerPosition())
                .phoneNumber(user.getPhoneNumber())
                .build();

        registrationRequestRepository.save(regRequest);
        notificationService.notifyAdmin("New Lecturer registration request from: " + user.getEmail());
        log.info("Lecturer registered (Pending Approval): {}", user.getEmail());
    }

    public void registerTechnician(TechnicianRegisterRequest request) {
        validateEmail(request.getEmail());
        validatePassword(request.getPassword(), request.getConfirmPassword());

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .password(passwordEncoder.encode(request.getPassword()))
                .technicianPosition(request.getTechnicianPosition())
                .role(UserRole.PENDING_TECHNICIAN)
                .status(AccountStatus.PENDING)
                .active(false)
                .build();

        user = userRepository.save(user);

        RegistrationRequest regRequest = RegistrationRequest.builder()
                .userId(user.getId())
                .requestType("TECHNICIAN")
                .requestStatus("PENDING")
                .fullName(user.getFirstName() + " " + user.getLastName())
                .email(user.getEmail())
                .position(user.getTechnicianPosition())
                .phoneNumber(user.getPhoneNumber())
                .build();

        registrationRequestRepository.save(regRequest);
        notificationService.notifyAdmin("New Technician registration request from: " + user.getEmail());
        log.info("Technician registered (Pending Approval): {}", user.getEmail());
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email."));

        if (user.getPassword() == null) {
            throw new RuntimeException("This account was created with Google Sign-In.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password.");
        }

        if (user.getStatus() == AccountStatus.PENDING) {
            throw new RuntimeException("Your registration is pending admin approval.");
        }

        if (user.getStatus() == AccountStatus.REJECTED) {
            throw new RuntimeException("Your registration was rejected. Reason: " + user.getRejectionReason());
        }

        if (user.getStatus() == AccountStatus.SUSPENDED || !user.isActive()) {
            throw new RuntimeException("Your account has been deactivated.");
        }

        log.info("User logged in: {}", user.getEmail());
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return buildResponse(user, token);
    }

    public AuthResponse adminLogin(AdminLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email."));

        if (user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Access denied. Admin role required.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect password.");
        }

        if (user.getStatus() == AccountStatus.SUSPENDED || !user.isActive()) {
            throw new RuntimeException("Your account has been deactivated.");
        }

        log.info("Admin logged in: {}", user.getEmail());
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return buildResponse(user, token);
    }

    // ── Admin Approval ──────────────────────────────────────────────────────────────

    public void approveOrRejectRegistration(String userId, ApproveRegistrationRequest request, String adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        RegistrationRequest regRequest = registrationRequestRepository.findByUserId(userId).stream()
                .filter(r -> "PENDING".equals(r.getRequestStatus()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Pending registration request not found"));

        boolean isApproved = false;
        if (request.getApproved() != null) {
            isApproved = request.getApproved();
        } else if (request.getAction() != null) {
            isApproved = "APPROVE".equalsIgnoreCase(request.getAction());
        }

        if (isApproved) {
            user.setStatus(AccountStatus.ACTIVE);
            user.setActive(true);
            if (user.getRole() == UserRole.PENDING_LECTURER) user.setRole(UserRole.LECTURER);
            else if (user.getRole() == UserRole.PENDING_TECHNICIAN) user.setRole(UserRole.TECHNICIAN);
            
            regRequest.setRequestStatus("APPROVED");
            emailService.sendApprovalEmail(user.getEmail(), user.getTitle() + " " + user.getFirstName() + " " + user.getLastName());

            notificationService.notifyUser(
                    user.getId(),
                    NotificationType.USER_APPROVED,
                    "Account approved",
                    "Your account has been approved by the admin. You can now log in.",
                    "/notifications"
            );

            notificationService.notifyAdmin("Approved account for: " + user.getEmail());
        } else {
            user.setStatus(AccountStatus.REJECTED);
            user.setRejectionReason(request.getRejectionReason());
            regRequest.setRequestStatus("REJECTED");
            regRequest.setRejectionReason(request.getRejectionReason());
            emailService.sendRejectionEmail(user.getEmail(), user.getTitle() + " " + user.getFirstName() + " " + user.getLastName(), request.getRejectionReason());
        }

        regRequest.setReviewedByAdmin(adminId);
        regRequest.setReviewedAt(LocalDateTime.now());
        user.setApprovedByAdminId(adminId);

        userRepository.save(user);
        registrationRequestRepository.save(regRequest);
    }

    public java.util.List<RegistrationRequestDto> getPendingRegistrations() {
        return userRepository.findByStatus(AccountStatus.PENDING).stream()
                .map(user -> RegistrationRequestDto.builder()
                        .userId(user.getId())
                        .role(user.getRole().name())
                        .title(user.getTitle())
                        .firstName(user.getFirstName())
                        .lastName(user.getLastName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .faculty(user.getFaculty())
                        .position(user.getLecturerPosition())
                        .technicianPosition(user.getTechnicianPosition())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private void validateEmail(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("An account with this email already exists.");
        }
    }

    private void validatePassword(String password, String confirmPassword) {
        if (!password.equals(confirmPassword)) {
            throw new RuntimeException("Passwords do not match.");
        }
    }

    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }

    // ── Password Reset (OTP) ───────────────────────────────────────────────────

    public void requestPasswordResetOtp(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required.");
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("No account found with this email."));

        // Google-only accounts cannot reset password (no password set)
        if (user.getPassword() == null) {
            throw new RuntimeException("This account uses Google Sign-In. Please sign in with Google.");
        }

        passwordResetOtpRepository.deleteByEmail(user.getEmail());

        String otp = String.format("%06d", (int) (Math.random() * 1_000_000));
        PasswordResetOtp entity = PasswordResetOtp.builder()
                .email(user.getEmail())
                .otpHash(passwordEncoder.encode(otp))
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .verifiedAt(null)
                .build();

        passwordResetOtpRepository.save(entity);
        emailService.sendPasswordResetOtp(user.getEmail(), otp);
    }

    public void verifyPasswordResetOtp(String email, String otp) {
        if (email == null || email.trim().isEmpty()) throw new RuntimeException("Email is required.");
        if (otp == null || otp.trim().isEmpty()) throw new RuntimeException("OTP is required.");

        PasswordResetOtp entity = passwordResetOtpRepository
                .findFirstByEmailOrderByCreatedAtDesc(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("OTP not found. Please request a new OTP."));

        if (entity.getExpiresAt() != null && entity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired. Please request a new OTP.");
        }

        if (!passwordEncoder.matches(otp.trim(), entity.getOtpHash())) {
            throw new RuntimeException("Invalid OTP.");
        }

        entity.setVerifiedAt(LocalDateTime.now());
        passwordResetOtpRepository.save(entity);
    }

    public void resetPassword(String email, String newPassword, String confirmPassword) {
        if (email == null || email.trim().isEmpty()) throw new RuntimeException("Email is required.");
        validatePassword(newPassword, confirmPassword);

        PasswordResetOtp entity = passwordResetOtpRepository
                .findFirstByEmailOrderByCreatedAtDesc(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("OTP not found. Please request a new OTP."));

        if (entity.getVerifiedAt() == null) {
            throw new RuntimeException("OTP not verified.");
        }

        if (entity.getExpiresAt() != null && entity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired. Please request a new OTP.");
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("No account found with this email."));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordResetOtpRepository.deleteByEmail(user.getEmail());
    }
}