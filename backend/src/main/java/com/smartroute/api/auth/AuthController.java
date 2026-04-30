package com.smartroute.api.auth;

import com.smartroute.api.auth.dto.*;
import com.smartroute.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String ACCESS_COOKIE = "SR_ACCESS_TOKEN";
    private static final String REFRESH_COOKIE = "SR_REFRESH_TOKEN";

    private final AuthService authService;
    private final boolean cookieSecure;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;

    public AuthController(AuthService authService,
                           @org.springframework.beans.factory.annotation.Value("${smartroute.cookie.secure:false}") boolean cookieSecure,
                           @org.springframework.beans.factory.annotation.Value("${smartroute.jwt.accessTokenTtlSeconds}") long accessTtlSeconds,
                           @org.springframework.beans.factory.annotation.Value("${smartroute.jwt.refreshTokenTtlSeconds}") long refreshTtlSeconds) {
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
    @ResponseStatus(HttpStatus.OK)
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        authService.forgotPassword(req);
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.OK)
    public AuthLoginResponse resetPassword(@Valid @RequestBody ResetPasswordRequest req, HttpServletResponse response) {
        AuthService.AuthTokens tokens = authService.resetPassword(req);
        setAuthCookies(response, tokens);
        return new AuthLoginResponse(tokens.accessToken(), authService.me(tokens.userId()));
    }

    // @GetMapping("/me")
    // public UserMeResponse me(Authentication authentication) {
    //     if (authentication == null || authentication.getPrincipal() == null) {
    //         throw new IllegalArgumentException("Not authenticated.");
    //     }
    //     String userId = authentication.getPrincipal().toString();
    //     return authService.me(userId);
    // }
    @GetMapping("/me")
public String me(Authentication authentication) {
    return authentication == null ? "NULL" : authentication.toString();
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

    // userId is returned by AuthService, keeping token parsing logic in the service layer.
}

