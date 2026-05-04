package com.smartroute.api.auth;

import com.smartroute.api.auth.dto.AuthLoginResponse;
import com.smartroute.api.auth.dto.ForgotPasswordRequest;
import com.smartroute.api.auth.dto.LoginRequest;
import com.smartroute.api.auth.dto.ResetPasswordRequest;
import com.smartroute.api.auth.dto.SignupRequest;
import com.smartroute.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String ACCESS_COOKIE = "SR_ACCESS_TOKEN";
    private static final String REFRESH_COOKIE = "SR_REFRESH_TOKEN";
    private static final String BEARER_PREFIX = "Bearer ";

    private final AuthService authService;
    private final boolean cookieSecure;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;

    public AuthController(
            AuthService authService,
            @org.springframework.beans.factory.annotation.Value("${smartroute.cookie.secure:false}") boolean cookieSecure,
            @org.springframework.beans.factory.annotation.Value("${smartroute.jwt.accessTokenTtlSeconds}") long accessTtlSeconds,
            @org.springframework.beans.factory.annotation.Value("${smartroute.jwt.refreshTokenTtlSeconds}") long refreshTtlSeconds
    ) {
        this.authService = authService;
        this.cookieSecure = cookieSecure;
        this.accessTtlSeconds = accessTtlSeconds;
        this.refreshTtlSeconds = refreshTtlSeconds;
    }

    @PostMapping("/signup")
    @ResponseStatus(HttpStatus.CREATED)
    public void signup(@Valid @RequestBody SignupRequest req) {
        authService.signup(req);
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public AuthLoginResponse login(@Valid @RequestBody LoginRequest req, HttpServletResponse response) {
        AuthService.AuthTokens tokens = authService.login(req);
        setAuthCookies(response, tokens);
        return new AuthLoginResponse(tokens.accessToken(), authService.me(tokens.userId()));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        try {
            authService.forgotPassword(req);
            return ResponseEntity.ok("If the email exists, a reset link has been sent.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing request");
        }
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.OK)
    public AuthLoginResponse resetPassword(@Valid @RequestBody ResetPasswordRequest req, HttpServletResponse response) {
        AuthService.AuthTokens tokens = authService.resetPassword(req);
        setAuthCookies(response, tokens);
        return new AuthLoginResponse(tokens.accessToken(), authService.me(tokens.userId()));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication, HttpServletRequest request) {
        try {
            if (authentication != null && authentication.getName() != null && !authentication.getName().isBlank()) {
                return ResponseEntity.ok(authService.me(authentication.getName()));
            }

            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || authHeader.isBlank() || !authHeader.startsWith(BEARER_PREFIX)) {
                return ResponseEntity.status(401).body("Missing token");
            }

            String token = authHeader.substring(BEARER_PREFIX.length()).trim();
            if (token.isEmpty()) {
                return ResponseEntity.status(401).body("Missing token");
            }

            return ResponseEntity.ok(authService.me(authService.parseUserIdFromToken(token)));
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.OK)
    public void logout(HttpServletResponse response) {
        ResponseCookie access = ResponseCookie.from(ACCESS_COOKIE, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        ResponseCookie refresh = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", access.toString());
        response.addHeader("Set-Cookie", refresh.toString());
    }

    private void setAuthCookies(HttpServletResponse response, AuthService.AuthTokens tokens) {
        ResponseCookie access = ResponseCookie.from(ACCESS_COOKIE, tokens.accessToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(accessTtlSeconds)
                .sameSite("Lax")
                .build();
        ResponseCookie refresh = ResponseCookie.from(REFRESH_COOKIE, tokens.refreshToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(refreshTtlSeconds)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", access.toString());
        response.addHeader("Set-Cookie", refresh.toString());
    }
}
