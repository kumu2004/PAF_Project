package com.smartcampus.backend.config;

import com.smartcampus.backend.common.enums.AccountStatus;
import com.smartcampus.backend.common.enums.UserRole;
import com.smartcampus.backend.module.user.entity.User;
import com.smartcampus.backend.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Temporary seeder to create the initial admin account.
 * Once the admin is created, this file can be removed.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "adminpaf@gmail.com";
        String adminPassword = "Admin@1234";
        
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        
        if (admin == null) {
            admin = User.builder()
                    .firstName("Super")
                    .lastName("Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(UserRole.ADMIN)
                    .status(AccountStatus.ACTIVE)
                    .active(true)
                    .build();
            userRepository.save(admin);
            log.info("Admin account created successfully: {}", adminEmail);
        } else {
            // Ensure the admin account has the correct password and role
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(UserRole.ADMIN);
            admin.setStatus(AccountStatus.ACTIVE);
            admin.setActive(true);
            userRepository.save(admin);
            log.info("Admin account updated and verified: {}", adminEmail);
        }
    }
}
