package com.smartroute.api.auth.dto;

import java.time.Instant;

public record RouteHistoryItemResponse(
        Long id,
        String source,
        String destination,
        String sourceLabel,
        String routeJson,
        Instant createdAt
) {
}
