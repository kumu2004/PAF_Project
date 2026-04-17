package com.smartcampus.backend.module.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.backend.common.enums.AccountStatus;
import com.smartcampus.backend.common.enums.UserRole;
import com.smartcampus.backend.module.user.entity.User;

/**
 * MongoDB repository for User document.
 * Handles all database operations for users.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Find a user by their email address.
     *
     * @param email the user's email
     * @return Optional containing the user if found, empty otherwise
     */
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
    boolean existsByStudentId(String studentId);

    List<User> findByRole(UserRole role);
    List<User> findByStatus(AccountStatus status);

    List<User> findByRoleIn(List<UserRole> roles);
    List<User> findByStatusAndRoleIn(AccountStatus status, List<UserRole> roles);
    long countByStatus(AccountStatus status);
}
