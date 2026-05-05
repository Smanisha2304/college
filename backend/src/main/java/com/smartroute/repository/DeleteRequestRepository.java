package com.smartroute.repository;

import com.smartroute.entity.DeleteRequest;
import com.smartroute.entity.DeleteRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeleteRequestRepository extends JpaRepository<DeleteRequest, Long> {
    List<DeleteRequest> findAllByOrderByRequestedAtDesc();
    List<DeleteRequest> findByStatusOrderByRequestedAtDesc(DeleteRequestStatus status);
    Optional<DeleteRequest> findByHistory_IdAndStatus(Long historyId, DeleteRequestStatus status);
}
