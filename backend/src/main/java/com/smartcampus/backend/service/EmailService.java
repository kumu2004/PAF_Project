package com.smartcampus.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromEmail;

    @Async
    public void sendWelcomeEmail(String to, String fullName, String role) {
        String subject = "Welcome to Smart Campus Hub!";
        String content = "<h1>Welcome, " + fullName + "!</h1>" +
                "<p>Your registration as a <b>" + role + "</b> was successful.</p>" +
                "<p>You can now log in to the portal.</p>";
        sendHtmlEmail(to, subject, content);
    }

    @Async
    public void sendApprovalEmail(String to, String fullName) {
        String subject = "Account Approved - Smart Campus Hub";
        String content = "<h1>Congratulations, " + fullName + "!</h1>" +
                "<p>Your registration request has been <b>APPROVED</b> by the administrator.</p>" +
                "<p>You can now log in to your dashboard.</p>";
        sendHtmlEmail(to, subject, content);
    }

    @Async
    public void sendRejectionEmail(String to, String fullName, String reason) {
        String subject = "Registration Update - Smart Campus Hub";
        String content = "<h1>Hello, " + fullName + "</h1>" +
                "<p>We regret to inform you that your registration request was <b>REJECTED</b>.</p>" +
                "<p><b>Reason:</b> " + reason + "</p>";
        sendHtmlEmail(to, subject, content);
    }

    @Async
    public void sendPasswordResetOtp(String to, String otp) {
        String subject = "Password Reset OTP - Smart Campus Hub";
        String content = "<h1>Password reset</h1>" +
                "<p>Your one-time password (OTP) is:</p>" +
                "<h2 style=\"letter-spacing: 4px;\">" + otp + "</h2>" +
                "<p>This OTP will expire in 10 minutes. If you didn't request this, you can ignore this email.</p>";
        sendHtmlEmail(to, subject, content);
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (fromEmail == null || fromEmail.isEmpty() || fromEmail.contains("your-email")) {
            log.warn("SMTP email not sent because SPRING_MAIL_USERNAME is not configured.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
