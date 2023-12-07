CREATE TABLE IF NOT EXISTS accounts
  (
    id                   INTEGER PRIMARY KEY,
    compound_id          VARCHAR(255) NOT NULL,
    user_id              INTEGER NOT NULL,
    provider_type        VARCHAR(255) NOT NULL,
    provider_id          VARCHAR(255) NOT NULL,
    provider_account_id  VARCHAR(255) NOT NULL,
    refresh_token        TEXT,
    access_token         TEXT,
    access_token_expires TIMESTAMP,
    created_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    
  );

CREATE TABLE IF NOT EXISTS  sessions
  (
    id            INTEGER PRIMARY KEY,
    user_id       INTEGER NOT NULL,
    expires       TIMESTAMP NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    access_token  VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS  users
  (
    id             INTEGER PRIMARY KEY,
    name           VARCHAR(255),
    email          VARCHAR(255),
    email_verified TIMESTAMP,
    image          VARCHAR(255),
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE TABLE IF NOT EXISTS  verification_requests
  (
    id         INTEGER PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    token      VARCHAR(255) NOT NULL,
    expires    TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

CREATE UNIQUE INDEX IF NOT EXISTS compound_id
  ON accounts(compound_id);

CREATE UNIQUE INDEX IF NOT EXISTS provider_account_id
  ON accounts(provider_account_id);

CREATE UNIQUE INDEX IF NOT EXISTS provider_id
  ON accounts(provider_id);

CREATE UNIQUE INDEX IF NOT EXISTS user_id
  ON accounts(user_id);

CREATE UNIQUE INDEX IF NOT EXISTS session_token
  ON sessions(session_token);

CREATE UNIQUE INDEX IF NOT EXISTS access_token
  ON sessions(access_token);

CREATE UNIQUE INDEX IF NOT EXISTS email
  ON users(email);

CREATE UNIQUE INDEX IF NOT EXISTS token
  ON verification_requests(token);
