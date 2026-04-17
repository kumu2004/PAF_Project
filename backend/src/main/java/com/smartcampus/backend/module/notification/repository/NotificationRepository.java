package com.smartcampus.backend.module.notification.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.smartcampus.backend.module.notification.entity.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByUserId(String userId, Pageable pageable);

    List<Notification> findByUserIdAndReadAtIsNull(String userId, Pageable pageable);

    long countByUserIdAndReadAtIsNull(String userId);

    List<Notification> findByAudienceRole(String audienceRole, Pageable pageable);

    List<Notification> findByAudienceRoleAndReadAtIsNull(String audienceRole, Pageable pageable);

    long countByAudienceRoleAndReadAtIsNull(String audienceRole);
}

