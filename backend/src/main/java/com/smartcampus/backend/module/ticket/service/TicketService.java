package com.smartcampus.backend.module.ticket.service;

import com.smartcampus.backend.common.enums.TicketStatus;
import com.smartcampus.backend.module.notification.service.NotificationService;
import com.smartcampus.backend.module.ticket.dto.CreateTicketRequest;
import com.smartcampus.backend.module.ticket.entity.Ticket;
import com.smartcampus.backend.module.ticket.entity.TicketAttachment;
import com.smartcampus.backend.module.ticket.entity.TicketComment;
import com.smartcampus.backend.module.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private final com.smartcampus.backend.common.service.CloudinaryService cloudinaryService;

    public Ticket createTicket(CreateTicketRequest request, String userId) {
        Ticket ticket = Ticket.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .resourceId(request.getResourceId())
                .preferredContact(request.getPreferredContact())
                .attachments(request.getAttachments() != null ? request.getAttachments() : new ArrayList<>())
                .comments(new ArrayList<>())
                .status(TicketStatus.OPEN.name())
                .build();
        
        return ticketRepository.save(ticket);
    }

    public Ticket createTicketWithFiles(CreateTicketRequest request, List<MultipartFile> files, String userId, String userRole) {
        validateFileTypes(files, userRole);
        List<TicketAttachment> attachments = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            if (files.size() > 3) {
                throw new RuntimeException("Maximum 3 files allowed during creation");
            }
            for (MultipartFile file : files) {
                String fileUrl = cloudinaryService.uploadFile(file, "tickets");
                System.out.println("DEBUG: Uploaded file to Cloudinary: " + fileUrl);
                TicketAttachment attachment = TicketAttachment.builder()
                        .attachmentId(UUID.randomUUID().toString())
                        .fileName(file.getOriginalFilename())
                        .fileUrl(fileUrl)
                        .fileSize(file.getSize())
                        .contentType(file.getContentType())
                        .uploadedBy(userId)
                        .uploadedAt(LocalDateTime.now())
                        .build();
                attachments.add(attachment);
            }
        }
        
        Ticket ticket = Ticket.builder()
                .userId(userId)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .priority(request.getPriority())
                .resourceId(request.getResourceId())
                .preferredContact(request.getPreferredContact())
                .attachments(attachments)
                .comments(new ArrayList<>())
                .status(TicketStatus.OPEN.name())
                .build();
        
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets(String userId, String status, String priority, String search) {
        List<Ticket> tickets;
        
        if (userId != null && !userId.isBlank()) {
            // Strictly fetch only tickets belonging to this user
            tickets = ticketRepository.findByUserId(userId);
        } else {
            // Only admins or internal processes should reach here with null userId
            tickets = ticketRepository.findAll();
        }

        return tickets.stream()
                .filter(t -> status == null || status.isEmpty() || status.equals(t.getStatus()))
                .filter(t -> priority == null || priority.isEmpty() || priority.equals(t.getPriority()))
                .filter(t -> search == null || search.isEmpty()
                        || (t.getTitle() != null && t.getTitle().toLowerCase().contains(search.toLowerCase()))
                        || (t.getDescription() != null && t.getDescription().toLowerCase().contains(search.toLowerCase())))
                .collect(Collectors.toList());
    }

    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    public Ticket updateTicketStatus(String id, String status, String notes) {
        Ticket ticket = getTicketById(id);
        ticket.setStatus(status);
        if (status.equals(TicketStatus.RESOLVED.name())) {
            ticket.setResolutionNotes(notes);
            ticket.setResolvedAt(LocalDateTime.now());
        } else if (status.equals(TicketStatus.REJECTED.name())) {
            ticket.setRejectionReason(notes);
        }
        return ticketRepository.save(ticket);
    }

    public Ticket assignTechnician(String id, String technicianId) {
        Ticket ticket = getTicketById(id);
        ticket.setAssignedTechnicianId(technicianId);
        // Automatically move to IN_PROGRESS if it was OPEN
        if (ticket.getStatus().equals(TicketStatus.OPEN.name())) {
            ticket.setStatus(TicketStatus.ASSIGNED.name());
        }
        Ticket saved = ticketRepository.save(ticket);
        // Notify the assigned technician
        notificationService.createTicketAssignedNotification(
                technicianId, ticket.getTitle(), ticket.getId());
        return saved;
    }

    public List<Ticket> getTicketsByAssignedTechnician(String technicianId) {
        return ticketRepository.findAll().stream()
                .filter(t -> technicianId.equals(t.getAssignedTechnicianId()))
                .collect(Collectors.toList());
    }

    public Ticket addComment(String id, String content, String userId) {
        Ticket ticket = getTicketById(id);
        TicketComment comment = TicketComment.builder()
                .commentId(UUID.randomUUID().toString())
                .userId(userId)
                .content(content)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        if (ticket.getComments() == null) {
            ticket.setComments(new ArrayList<>());
        }
        ticket.getComments().add(comment);
        return ticketRepository.save(ticket);
    }

    public Ticket addAttachments(String id, List<TicketAttachment> attachments) {
        Ticket ticket = getTicketById(id);
        if (ticket.getAttachments() == null) {
            ticket.setAttachments(new ArrayList<>());
        }
        // Limit check
        if (ticket.getAttachments().size() + attachments.size() > 5) {
             throw new RuntimeException("Maximum 5 attachments allowed per ticket");
        }
        ticket.getAttachments().addAll(attachments);
        return ticketRepository.save(ticket);
    }

    public Ticket addAttachmentsWithFiles(String id, List<MultipartFile> files, String userId, String userRole) {
        validateFileTypes(files, userRole);
        Ticket ticket = getTicketById(id);
        if (ticket.getAttachments() == null) {
            ticket.setAttachments(new ArrayList<>());
        }
        if (ticket.getAttachments().size() + files.size() > 5) {
            throw new RuntimeException("Maximum 5 attachments allowed per ticket");
        }
        
        for (MultipartFile file : files) {
            String fileUrl = cloudinaryService.uploadFile(file, "tickets");
            TicketAttachment attachment = TicketAttachment.builder()
                    .attachmentId(UUID.randomUUID().toString())
                    .fileName(file.getOriginalFilename())
                    .fileUrl(fileUrl)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .uploadedBy(userId)
                    .uploadedAt(LocalDateTime.now())
                    .build();
            ticket.getAttachments().add(attachment);
        }
        
        return ticketRepository.save(ticket);
    }

    public Ticket removeAttachment(String ticketId, String attachmentId) {
        Ticket ticket = getTicketById(ticketId);
        if (ticket.getAttachments() != null) {
            ticket.getAttachments().stream()
                .filter(a -> a.getAttachmentId().equals(attachmentId))
                .findFirst()
                .ifPresent(a -> {
                    cloudinaryService.deleteFileByUrl(a.getFileUrl());
                });
            ticket.getAttachments().removeIf(a -> a.getAttachmentId().equals(attachmentId));
        }
        return ticketRepository.save(ticket);
    }

    public Ticket renameAttachment(String ticketId, String attachmentId, String newName) {
        Ticket ticket = getTicketById(ticketId);
        if (ticket.getAttachments() != null) {
            ticket.getAttachments().stream()
                .filter(a -> a.getAttachmentId().equals(attachmentId))
                .findFirst()
                .ifPresent(a -> a.setFileName(newName));
        }
        return ticketRepository.save(ticket);
    }

    public Ticket updateTicket(String id, CreateTicketRequest request, String userId, boolean isAdmin) {
        Ticket ticket = getTicketById(id);
        
        // Ownership check
        if (!ticket.getUserId().equals(userId) && !isAdmin) {
            throw new RuntimeException("Unauthorized: You do not own this ticket");
        }

        // 1-hour grace period check for non-admins
        if (!isAdmin && ticket.getCreatedAt() != null) {
            long hoursSinceCreation = Duration.between(ticket.getCreatedAt(), LocalDateTime.now()).toHours();
            if (hoursSinceCreation >= 1) {
                throw new RuntimeException("Modification window expired: Tickets can only be edited within 1 hour of creation.");
            }
        }

        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setCategory(request.getCategory());
        ticket.setPriority(request.getPriority());
        ticket.setResourceId(request.getResourceId());
        ticket.setPreferredContact(request.getPreferredContact());
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String id, String userId, boolean isAdmin) {
        Ticket ticket = getTicketById(id);
        
        // Ownership check
        if (!ticket.getUserId().equals(userId) && !isAdmin) {
            throw new RuntimeException("Unauthorized: You do not own this ticket");
        }

        // 1-hour grace period check for non-admins
        if (!isAdmin && ticket.getCreatedAt() != null) {
            long minutesSinceCreation = Duration.between(ticket.getCreatedAt(), LocalDateTime.now()).toMinutes();
            if (minutesSinceCreation >= 60) {
                throw new RuntimeException("Deletion window expired: Tickets can only be deleted within 1 hour of creation.");
            }
        }

        ticketRepository.delete(ticket);
    }

    private void validateFileTypes(List<MultipartFile> files, String role) {
        if (files == null || files.isEmpty()) return;
        
        boolean isRestricted = role != null && (role.equals("STUDENT") || role.equals("LECTURER"));
        if (!isRestricted) return;

        for (MultipartFile file : files) {
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("image/png") && !contentType.equals("image/jpeg"))) {
                throw new RuntimeException("Students and Lecturers are restricted to PNG and JPEG/JPG files only. Invalid file: " + file.getOriginalFilename());
            }
        }
    }
}
