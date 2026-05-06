ALTER TABLE route_history
    ADD COLUMN source VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN route_json TEXT NULL;

