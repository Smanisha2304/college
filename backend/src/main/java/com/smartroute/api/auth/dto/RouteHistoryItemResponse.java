package com.smartroute.api.auth.dto;

import java.time.Instant;

public record RouteHistoryItemResponse(
        Long id,
        String destination,
        String sourceLabel,
        Instant createdAt
) {
}
