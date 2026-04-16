package com.smartcampus.backend.module.ticket.repository;

import com.smartcampus.backend.module.ticket.entity.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByUserId(String userId);
    List<Ticket> findByStatus(String status);
    List<Ticket> findByAssignedTechnicianId(String technicianId);
    long countByStatusIn(java.util.Collection<String> statuses);
}
