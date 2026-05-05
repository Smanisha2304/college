package com.smartroute.repository;

import com.smartroute.entity.RouteHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RouteHistoryRepository extends JpaRepository<RouteHistory, Long> {
    List<RouteHistory> findByUserIdAndDeletedFalseOrderByCreatedAtDesc(Long userId);
    Optional<RouteHistory> findByIdAndUserIdAndDeletedFalse(Long id, Long userId);
}
