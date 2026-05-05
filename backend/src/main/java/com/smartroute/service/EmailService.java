package com.smartroute.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${smartroute.mail.from}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Reset Your Password");

        message.setText(
                "Click below to reset password:\n\n" +
                resetLink +
                "\n\nThis link expires in 30 minutes."
        );

        mailSender.send(message);

        System.out.println("✅ Email sent to: " + toEmail);
    }
}