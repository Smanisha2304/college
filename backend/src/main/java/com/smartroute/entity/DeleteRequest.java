package com.smartroute.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "delete_requests", indexes = {
        @Index(name = "idx_delete_requests_user", columnList = "user_id"),
        @Index(name = "idx_delete_requests_history", columnList = "history_id"),
        @Index(name = "idx_delete_requests_status", columnList = "status")
})
public class DeleteRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_delete_requests_user"))
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "history_id", nullable = false, foreignKey = @ForeignKey(name = "fk_delete_requests_history"))
    private RouteHistory history;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DeleteRequestStatus status = DeleteRequestStatus.PENDING;

    @Column(name = "requested_at", nullable = false, updatable = false)
    private Instant requestedAt = Instant.now();

    @Column(name = "actioned_at")
    private Instant actionedAt;

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public RouteHistory getHistory() {
        return history;
    }

    public void setHistory(RouteHistory history) {
        this.history = history;
    }

    public DeleteRequestStatus getStatus() {
        return status;
    }

    public void setStatus(DeleteRequestStatus status) {
        this.status = status;
    }

    public Instant getRequestedAt() {
        return requestedAt;
    }

    public Instant getActionedAt() {
        return actionedAt;
    }

    public void setActionedAt(Instant actionedAt) {
        this.actionedAt = actionedAt;
    }
}
