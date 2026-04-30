package com.smartroute.service;

import com.smartroute.api.auth.dto.*;
import com.smartroute.entity.PasswordResetToken;
import com.smartroute.entity.User;
import com.smartroute.repository.PasswordResetTokenRepository;
import com.smartroute.repository.UserRepository;
import com.smartroute.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    public record AuthTokens(String accessToken, String refreshToken, String userId) {}

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    private final String frontendResetPasswordBaseUrl;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;

    public AuthService(UserRepository userRepository,
                        PasswordResetTokenRepository tokenRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService,
                        EmailService emailService,
                        @Value("${smartroute.frontend.resetPasswordBaseUrl:http://localhost:5173/reset-password}") String frontendResetPasswordBaseUrl,
                        @Value("${smartroute.jwt.accessTokenTtlSeconds}") long accessTtlSeconds,
                        @Value("${smartroute.jwt.refreshTokenTtlSeconds}") long refreshTtlSeconds) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
        this.frontendResetPasswordBaseUrl = frontendResetPasswordBaseUrl;
        this.accessTtlSeconds = accessTtlSeconds;
        this.refreshTtlSeconds = refreshTtlSeconds;
    }

    @Transactional
    public void signup(SignupRequest req) {
        if (req.getPassword() == null || !req.getPassword().equals(req.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }
        if (userRepository.existsByEmail(req.getEmail().toLowerCase())) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        User user = new User();
        user.setFullName(req.getFullName().trim());
        user.setEmail(req.getEmail().trim().toLowerCase());
        user.setMobileNumber(req.getMobileNumber().trim());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        userRepository.save(user);
    }

    public AuthTokens login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        // Both access + refresh currently use the same secret and subject claim.
        String userId = String.valueOf(user.getId());
        String access = jwtService.createAccessToken(userId);
        String refresh = jwtService.createRefreshToken(userId);
        return new AuthTokens(access, refresh, userId);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        // Avoid account enumeration: always succeed.
        Optional<User> maybeUser = userRepository.findByEmail(req.getEmail().trim().toLowerCase());
        if (maybeUser.isEmpty()) return;

        User user = maybeUser.get();
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(user);
        token.setToken(UUID.randomUUID().toString().replace("-", ""));
        token.setExpiresAt(Instant.now().plusSeconds(30 * 60L));
        token.setUsedAt(null);
        tokenRepository.save(token);

        String resetLink = frontendResetPasswordBaseUrl + "?token=" + token.getToken();
        emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    }

    @Transactional
    public AuthTokens resetPassword(ResetPasswordRequest req) {
        PasswordResetToken token = tokenRepository.findByToken(req.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired token."));

        if (token.getExpiresAt() == null || token.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Invalid or expired token.");
        }
        if (token.getUsedAt() != null) {
            throw new IllegalArgumentException("This token has already been used.");
        }

        User user = token.getUser();
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        token.setUsedAt(Instant.now());
        tokenRepository.save(token);

        String userId = String.valueOf(user.getId());
        String access = jwtService.createAccessToken(userId);
        String refresh = jwtService.createRefreshToken(userId);
        return new AuthTokens(access, refresh, userId);
    }

    @Transactional(readOnly = true)
    public UserMeResponse me(String userId) {
        long id;
        try {
            id = Long.parseLong(userId);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid auth token.");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        return new UserMeResponse(user.getId(), user.getFullName(), user.getEmail(), user.getMobileNumber());
    }
}

