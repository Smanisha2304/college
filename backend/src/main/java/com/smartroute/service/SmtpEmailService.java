package com.smartroute.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class SmtpEmailService implements EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public SmtpEmailService(JavaMailSender mailSender,
                             @Value("${smartroute.mail.from:no-reply@localhost}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        // Simple plaintext email; you can upgrade to HTML templates later.
        var msg = new SimpleMailMessage();
        msg.setFrom(fromAddress);
        msg.setTo(toEmail);
        msg.setSubject("Reset your SmartRoute AI password");
        msg.setText("Click the link below to reset your password:\n\n" + resetLink + "\n\nIf you didn't request this, you can ignore this email.");
        mailSender.send(msg);
    }
}

