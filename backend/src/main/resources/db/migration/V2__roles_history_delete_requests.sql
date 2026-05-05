ALTER TABLE users
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';

CREATE TABLE route_history (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    destination VARCHAR(255) NOT NULL,
    source_label VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT pk_route_history PRIMARY KEY (id),
    CONSTRAINT fk_route_history_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_route_history_user ON route_history (user_id);

CREATE TABLE delete_requests (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    history_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    requested_at TIMESTAMP NOT NULL,
    actioned_at TIMESTAMP NULL,
    CONSTRAINT pk_delete_requests PRIMARY KEY (id),
    CONSTRAINT fk_delete_requests_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_delete_requests_history FOREIGN KEY (history_id) REFERENCES route_history (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_delete_requests_user ON delete_requests (user_id);
CREATE INDEX idx_delete_requests_history ON delete_requests (history_id);
CREATE INDEX idx_delete_requests_status ON delete_requests (status);
