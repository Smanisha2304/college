package com.smartroute.security;

import com.smartroute.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;
    private final String frontendOAuthSuccessUrl;

    public OAuth2LoginSuccessHandler(
            AuthService authService,
            @Value("${smartroute.frontend.oauthSuccessUrl:http://localhost:3000/oauth-success}") String frontendOAuthSuccessUrl
    ) {
        this.authService = authService;
        this.frontendOAuthSuccessUrl = frontendOAuthSuccessUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws IOException, ServletException {
        if (!(authentication.getPrincipal() instanceof OAuth2User oauthUser)) {
            response.sendRedirect(frontendOAuthSuccessUrl + "?error=oauth_principal_missing");
            return;
        }

        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");
        Boolean emailVerified = oauthUser.getAttribute("email_verified");

        if (email == null || email.isBlank()) {
            response.sendRedirect(frontendOAuthSuccessUrl + "?error=email_not_found");
            return;
        }
        if (emailVerified != null && !emailVerified) {
            response.sendRedirect(frontendOAuthSuccessUrl + "?error=email_not_verified");
            return;
        }

        var tokens = authService.loginOrSignupGoogleUser(email, name);
        String redirect = frontendOAuthSuccessUrl
                + "?token=" + URLEncoder.encode(tokens.accessToken(), StandardCharsets.UTF_8)
                + "&userId=" + URLEncoder.encode(tokens.userId(), StandardCharsets.UTF_8);
        response.sendRedirect(redirect);
    }
}
