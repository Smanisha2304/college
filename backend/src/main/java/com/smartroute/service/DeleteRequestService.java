package com.smartroute.service;

import com.smartroute.api.auth.dto.DeleteRequestResponse;
import com.smartroute.entity.DeleteRequest;
import com.smartroute.entity.DeleteRequestStatus;
import com.smartroute.entity.RouteHistory;
import com.smartroute.entity.User;
import com.smartroute.repository.DeleteRequestRepository;
import com.smartroute.repository.RouteHistoryRepository;
import com.smartroute.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class DeleteRequestService {
    private final DeleteRequestRepository deleteRequestRepository;
    private final RouteHistoryRepository routeHistoryRepository;
    private final UserRepository userRepository;
    private final RouteHistoryService routeHistoryService;

    public DeleteRequestService(
            DeleteRequestRepository deleteRequestRepository,
            RouteHistoryRepository routeHistoryRepository,
            UserRepository userRepository,
            RouteHistoryService routeHistoryService
    ) {
        this.deleteRequestRepository = deleteRequestRepository;
        this.routeHistoryRepository = routeHistoryRepository;
        this.userRepository = userRepository;
        this.routeHistoryService = routeHistoryService;
    }

    @Transactional
    public DeleteRequestResponse create(Long userId, Long historyId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found."));
        RouteHistory history = routeHistoryRepository.findByIdAndUserId(historyId, userId)
                .orElseThrow(() -> new IllegalArgumentException("History entry not found."));

        deleteRequestRepository.findByHistory_IdAndStatus(historyId, DeleteRequestStatus.PENDING)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Delete request is already pending.");
                });

        DeleteRequest request = new DeleteRequest();
        request.setUser(user);
        request.setHistory(history);
        request.setStatus(DeleteRequestStatus.PENDING);
        return toResponse(deleteRequestRepository.save(request));
    }

    @Transactional(readOnly = true)
    public List<DeleteRequestResponse> listAll() {
        return deleteRequestRepository.findAllByOrderByRequestedAtDesc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public DeleteRequestResponse approve(Long id) {
        DeleteRequest request = deleteRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delete request not found."));
        if (request.getStatus() != DeleteRequestStatus.PENDING) {
            throw new IllegalArgumentException("Delete request already actioned.");
        }
        request.setStatus(DeleteRequestStatus.APPROVED);
        request.setActionedAt(Instant.now());
        routeHistoryService.deleteById(request.getHistory().getId());
        return toResponse(deleteRequestRepository.save(request));
    }

    @Transactional
    public DeleteRequestResponse reject(Long id) {
        DeleteRequest request = deleteRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Delete request not found."));
        if (request.getStatus() != DeleteRequestStatus.PENDING) {
            throw new IllegalArgumentException("Delete request already actioned.");
        }
        request.setStatus(DeleteRequestStatus.REJECTED);
        request.setActionedAt(Instant.now());
        return toResponse(deleteRequestRepository.save(request));
    }

    private DeleteRequestResponse toResponse(DeleteRequest request) {
        return new DeleteRequestResponse(
                request.getId(),
                request.getUser().getId(),
                request.getUser().getEmail(),
                request.getHistory().getId(),
                request.getHistory().getDestination(),
                request.getStatus().name(),
                request.getRequestedAt(),
                request.getActionedAt()
        );
    }
}
