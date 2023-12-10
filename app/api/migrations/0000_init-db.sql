-- Migration number: 0000 	 2023-11-06T01:51:36.788Z

CREATE TABLE IF NOT EXISTS [account]
(
    id INTEGER NOT NULL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES [user] (id) ON DELETE CASCADE,
    [type] TEXT NOT NULL,
    [provider] TEXT NOT NULL,
    providerAccountId TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES [user](id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS [session]
(
    id INTEGER PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES [user] (id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL,
    sessionToken VARCHAR(255) NOT NULL,
    access_token VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES [user](id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS [user]
(
    `id` INTEGER PRIMARY KEY,
    `name` VARCHAR(255),
    `email` VARCHAR(255),
    `emailVerified` TIMESTAMP,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `userType` TEXT CHECK(userType IN ('email', 'credentials', 'github', 'not_set')) NOT NULL DEFAULT 'not_set',
    `image` VARCHAR(255),
    `username` VARCHAR(255),
    `password` VARCHAR(255),
    `sub` VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS [UserRole]
(
    `id` INTEGER PRIMARY KEY,
    `role` TEXT CHECK(role IN ('admin', 'user')) NOT NULL DEFAULT 'user'
);


CREATE TABLE IF NOT EXISTS [UserRoleAssignment]
(
    `id` INTEGER PRIMARY KEY,
    `userId` INTEGER NOT NULL REFERENCES [user] (id) ON DELETE CASCADE,
    `roleId` INTEGER NOT NULL REFERENCES [UserRole] (id) ON DELETE CASCADE,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES [user](id) ON DELETE CASCADE,
    FOREIGN KEY (roleId) REFERENCES [UserRole](id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS [VerificationToken]
(
    id INTEGER PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS providerAccountId
ON account(providerAccountId);

CREATE UNIQUE INDEX IF NOT EXISTS [provider]
ON account([provider]);

CREATE UNIQUE INDEX IF NOT EXISTS userIdAccount
ON account(userId);

CREATE UNIQUE INDEX IF NOT EXISTS sessionToken
ON session(sessionToken);

CREATE UNIQUE INDEX IF NOT EXISTS email
ON [user](email);

CREATE UNIQUE INDEX IF NOT EXISTS username
ON [user](username);

CREATE UNIQUE INDEX IF NOT EXISTS sub
ON [user](sub);

CREATE UNIQUE INDEX IF NOT EXISTS role
ON UserRole(role);

CREATE UNIQUE INDEX IF NOT EXISTS identifier
ON VerificationToken(identifier);

CREATE UNIQUE INDEX IF NOT EXISTS token
ON VerificationToken(token);