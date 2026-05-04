package com.smartroute.service;

import com.smartroute.api.auth.dto.RouteHistoryRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class RouteHistoryService {

    public record RouteHistoryItem(Long id, String destination, String sourceLabel, Instant createdAt) {}

    private final AtomicLong idGenerator = new AtomicLong(1);
    private final Map<String, List<RouteHistoryItem>> historyByUser = new ConcurrentHashMap<>();

    public List<RouteHistoryItem> getUserHistory(String userId) {
        if (userId == null || userId.isBlank()) {
            return Collections.emptyList();
        }
        List<RouteHistoryItem> list = historyByUser.getOrDefault(userId, Collections.emptyList());
        List<RouteHistoryItem> result = new ArrayList<>(list);
        result.sort(Comparator.comparing(RouteHistoryItem::createdAt).reversed());
        return result;
    }

    public RouteHistoryItem save(RouteHistoryRequest req, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("Invalid user.");
        }

        String destination = req == null ? null : req.getDestination();
        if (destination == null || destination.trim().isEmpty()) {
            throw new IllegalArgumentException("Destination is required.");
        }

        RouteHistoryItem item = new RouteHistoryItem(
                idGenerator.getAndIncrement(),
                destination.trim(),
                req.getSourceLabel() == null ? "" : req.getSourceLabel().trim(),
                Instant.now()
        );

        historyByUser.compute(userId, (key, existing) -> {
            List<RouteHistoryItem> next = existing == null ? new ArrayList<>() : new ArrayList<>(existing);
            next.add(item);
            if (next.size() > 100) {
                next = new ArrayList<>(next.subList(next.size() - 100, next.size()));
            }
            return next;
        });

        return item;
    }

    public void delete(Long id, String userId) {
        if (id == null || userId == null || userId.isBlank()) {
            return;
        }

        historyByUser.computeIfPresent(userId, (key, existing) -> {
            List<RouteHistoryItem> next = new ArrayList<>(existing);
            next.removeIf(item -> id.equals(item.id()));
            return next;
        });
    }

    public void clear(String userId) {
        if (userId == null || userId.isBlank()) {
            return;
        }
        historyByUser.remove(userId);
    }
}
