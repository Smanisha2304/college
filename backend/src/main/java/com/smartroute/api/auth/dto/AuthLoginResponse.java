package com.smartroute.api.auth.dto;

public record AuthLoginResponse(
        String token,
        UserMeResponse user
) {
}
