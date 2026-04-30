package com.smartroute.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String resetLink);
}

