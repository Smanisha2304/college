package com.smartroute.repository;

import com.smartroute.entity.RouteHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RouteHistoryRepository extends JpaRepository<RouteHistory, Long> {
    List<RouteHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<RouteHistory> findByIdAndUserId(Long id, Long userId);
}
