package com.smartcampus.backend.module.auth.repository;

import com.smartcampus.backend.module.auth.entity.RegistrationRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistrationRequestRepository extends MongoRepository<RegistrationRequest, String> {
    List<RegistrationRequest> findByRequestStatus(String status);
    List<RegistrationRequest> findByUserId(String userId);
}
