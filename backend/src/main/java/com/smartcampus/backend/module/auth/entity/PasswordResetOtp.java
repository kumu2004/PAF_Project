package com.smartcampus.backend.module.auth.entity;

import com.smartcampus.backend.common.BaseDocument;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "password_reset_otps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class PasswordResetOtp extends BaseDocument {

    @Indexed
    private String email;

    /** BCrypt hash of the 6-digit OTP */
    private String otpHash;

    private LocalDateTime expiresAt;
    private LocalDateTime verifiedAt;
}

