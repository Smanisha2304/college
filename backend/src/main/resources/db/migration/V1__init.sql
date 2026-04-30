CREATE TABLE users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  mobile_number VARCHAR(30) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT pk_users PRIMARY KEY (id),
  CONSTRAINT uk_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE password_reset_tokens (
  id BIGINT NOT NULL AUTO_INCREMENT,
  token VARCHAR(128) NOT NULL,
  user_id BIGINT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
  CONSTRAINT uk_password_reset_tokens_token UNIQUE (token),
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_prt_user_id ON password_reset_tokens (user_id);

