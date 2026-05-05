ALTER TABLE route_history
    ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN deleted_at TIMESTAMP NULL;

CREATE INDEX idx_route_history_deleted ON route_history (deleted);
