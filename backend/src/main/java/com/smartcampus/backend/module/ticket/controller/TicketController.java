package com.smartcampus.backend.module.ticket.controller;

import com.smartcampus.backend.common.dto.ApiResponse;
import com.smartcampus.backend.module.ticket.dto.CreateTicketRequest;
import com.smartcampus.backend.module.ticket.entity.Ticket;
import com.smartcampus.backend.module.ticket.entity.TicketAttachment;
import com.smartcampus.backend.module.ticket.service.TicketService;
import com.smartcampus.backend.security.CustomUserDetails;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // For development
public class TicketController {

    private final TicketService ticketService;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Ticket>> createTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestPart("ticket") CreateTicketRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        String userId = userDetails.getId();
        String userRole = userDetails.getRole();
        Ticket ticket = ticketService.createTicketWithFiles(request, files, userId, userRole);
        return ResponseEntity.ok(ApiResponse.success("Ticket created successfully", ticket));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Ticket>>> getTickets(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String userId) {
        
        String effectiveUserId = userId;
        boolean isAdmin = userDetails != null && "ADMIN".equalsIgnoreCase(userDetails.getRole());
        
        // Security: If not admin, you can ONLY see your own tickets
        if (!isAdmin && userDetails != null) {
            effectiveUserId = userDetails.getId();
        }
        
        List<Ticket> tickets = ticketService.getAllTickets(effectiveUserId, status, priority, search);
        return ResponseEntity.ok(ApiResponse.success("Tickets retrieved successfully", tickets));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Ticket>>> getMyTickets(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search) {
        String userId = userDetails.getId();
        List<Ticket> tickets = ticketService.getAllTickets(userId, status, priority, search);
        return ResponseEntity.ok(ApiResponse.success("My tickets retrieved successfully", tickets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Ticket>> getTicket(@PathVariable String id) {
        Ticket ticket = ticketService.getTicketById(id);
        return ResponseEntity.ok(ApiResponse.success("Ticket retrieved successfully", ticket));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Ticket>> updateTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @Valid @RequestBody CreateTicketRequest request) {
        String userId = userDetails.getId();
        boolean isAdmin = "ADMIN".equalsIgnoreCase(userDetails.getRole());
        Ticket ticket = ticketService.updateTicket(id, request, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Ticket updated successfully", ticket));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id) {
        String userId = userDetails.getId();
        boolean isAdmin = "ADMIN".equalsIgnoreCase(userDetails.getRole());
        ticketService.deleteTicket(id, userId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Ticket deleted successfully", null));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Ticket>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        String notes = body.get("notes");
        Ticket ticket = ticketService.updateTicketStatus(id, status, notes);
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated", ticket));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<Ticket>> addComment(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String content = body.get("content");
        String userId = userDetails.getId();
        Ticket ticket = ticketService.addComment(id, content, userId);
        return ResponseEntity.ok(ApiResponse.success("Comment added", ticket));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<Ticket>> assignTechnician(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String technicianId = body.get("technicianId");
        Ticket ticket = ticketService.assignTechnician(id, technicianId);
        return ResponseEntity.ok(ApiResponse.success("Technician assigned", ticket));
    }

    @GetMapping("/assigned")
    public ResponseEntity<ApiResponse<List<Ticket>>> getAssignedTickets(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails != null ? userDetails.getId() : null;
        List<Ticket> tickets = ticketService.getTicketsByAssignedTechnician(userId);
        return ResponseEntity.ok(ApiResponse.success("Assigned tickets retrieved", tickets));
    }

    @PostMapping(value = "/{id}/attachments", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Ticket>> addAttachments(
            @PathVariable String id,
            @RequestPart("files") List<MultipartFile> files,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        String userId = userDetails.getId();
        String userRole = userDetails.getRole();
        Ticket ticket = ticketService.addAttachmentsWithFiles(id, files, userId, userRole);
        return ResponseEntity.ok(ApiResponse.success("Attachments added", ticket));
    }

    @DeleteMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<ApiResponse<Ticket>> removeAttachment(
            @PathVariable String id,
            @PathVariable String attachmentId) {
        Ticket ticket = ticketService.removeAttachment(id, attachmentId);
        return ResponseEntity.ok(ApiResponse.success("Attachment removed", ticket));
    }

    @PatchMapping("/{id}/attachments/{attachmentId}")
    public ResponseEntity<ApiResponse<Ticket>> renameAttachment(
            @PathVariable String id,
            @PathVariable String attachmentId,
            @RequestBody Map<String, String> body) {
        String newName = body.get("newName");
        Ticket ticket = ticketService.renameAttachment(id, attachmentId, newName);
        return ResponseEntity.ok(ApiResponse.success("Attachment renamed", ticket));
    }
}