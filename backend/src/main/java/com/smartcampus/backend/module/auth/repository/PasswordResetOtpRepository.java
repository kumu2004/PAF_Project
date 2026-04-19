package com.smartcampus.backend.module.auth.repository;

import com.smartcampus.backend.module.auth.entity.PasswordResetOtp;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetOtpRepository extends MongoRepository<PasswordResetOtp, String> {
    Optional<PasswordResetOtp> findFirstByEmailOrderByCreatedAtDesc(String email);
    long deleteByEmail(String email);
}

