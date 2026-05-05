package com.smartroute.security;

import com.smartroute.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey secretKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;

        byte[] keyBytes = properties.getSecret() == null
                ? new byte[0]
                : properties.getSecret().getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            throw new IllegalStateException("smartroute.jwt.secret must be at least 32 bytes for HS256.");
        }

        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String createAccessToken(String subjectUserId, String role) {
        return createToken(subjectUserId, role, properties.getAccessTokenTtlSeconds());
    }

    public String createRefreshToken(String subjectUserId, String role) {
        return createToken(subjectUserId, role, properties.getRefreshTokenTtlSeconds());
    }

    private String createToken(String subject, String role, long ttlSeconds) {
        Instant now = Instant.now();
        Instant exp = now.plusSeconds(ttlSeconds);

        return Jwts.builder()
                .setIssuer(properties.getIssuer())
                .setSubject(subject)
                .claim("role", role)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(exp))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseAndValidate(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsername(String token) {
        return parseAndValidate(token).getSubject();
    }

    public String extractRole(String token) {
        Object role = parseAndValidate(token).get("role");
        return role == null ? "USER" : role.toString();
    }
}