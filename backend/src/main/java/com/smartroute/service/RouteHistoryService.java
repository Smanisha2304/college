package com.smartroute.service;

import com.smartroute.api.auth.dto.RouteHistoryItemResponse;
import com.smartroute.api.auth.dto.RouteHistoryRequest;
import com.smartroute.entity.RouteHistory;
import com.smartroute.entity.User;
import com.smartroute.repository.RouteHistoryRepository;
import com.smartroute.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class RouteHistoryService {

    private final RouteHistoryRepository routeHistoryRepository;
    private final UserRepository userRepository;

    public RouteHistoryService(RouteHistoryRepository routeHistoryRepository, UserRepository userRepository) {
        this.routeHistoryRepository = routeHistoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<RouteHistoryItemResponse> getUserHistory(String userId) {
        Long id = parseUserId(userId);
        if (id == null) {
            return Collections.emptyList();
        }
        return routeHistoryRepository.findByUserIdOrderByCreatedAtDesc(id).stream().map(this::toResponse).toList();
    }

    @Transactional
    public RouteHistoryItemResponse save(RouteHistoryRequest req, String userId) {
        Long id = parseUserId(userId);
        if (id == null) {
            throw new IllegalArgumentException("Invalid user.");
        }
        String destination = req == null ? null : req.getDestination();
        if (destination == null || destination.trim().isEmpty()) {
            throw new IllegalArgumentException("Destination is required.");
        }
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found."));
        RouteHistory history = new RouteHistory();
        history.setUser(user);
        history.setDestination(destination.trim());
        history.setSourceLabel(req.getSourceLabel() == null ? "" : req.getSourceLabel().trim());
        return toResponse(routeHistoryRepository.save(history));
    }

    @Transactional(readOnly = true)
    public List<RouteHistoryItemResponse> getUserHistoryByAdmin(Long userId) {
        return routeHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    public void delete(Long id, String userId) {
        Long parsedId = parseUserId(userId);
        if (id == null || parsedId == null) {
            return;
        }
        routeHistoryRepository.findByIdAndUserId(id, parsedId).ifPresent(routeHistoryRepository::delete);
    }

    public void clear(String userId) {
        Long parsedId = parseUserId(userId);
        if (parsedId == null) {
            return;
        }
        routeHistoryRepository.findByUserIdOrderByCreatedAtDesc(parsedId).forEach(routeHistoryRepository::delete);
    }

    @Transactional
    public void deleteById(Long id) {
        routeHistoryRepository.deleteById(id);
    }

    private Long parseUserId(String userId) {
        try {
            return Long.parseLong(userId);
        } catch (Exception ex) {
            return null;
        }
    }

    private RouteHistoryItemResponse toResponse(RouteHistory history) {
        return new RouteHistoryItemResponse(
                history.getId(),
                history.getDestination(),
                history.getSourceLabel(),
                history.getCreatedAt()
        );
    }
}
