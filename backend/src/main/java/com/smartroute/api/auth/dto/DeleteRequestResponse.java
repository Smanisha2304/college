package com.smartroute.api.auth.dto;

import java.time.Instant;

public record DeleteRequestResponse(
        Long id,
        Long userId,
        String userEmail,
        Long historyId,
        String destination,
        String status,
        Instant requestedAt,
        Instant actionedAt
) {
}
