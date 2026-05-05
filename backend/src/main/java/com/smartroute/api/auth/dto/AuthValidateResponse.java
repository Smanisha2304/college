package com.smartroute.api.auth.dto;

public record AuthValidateResponse(
        boolean valid,
        UserMeResponse user
) {
}
