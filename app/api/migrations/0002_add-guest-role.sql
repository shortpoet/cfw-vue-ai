-- Migration number: 0002 	 2023-11-18T18:32:02.351Z

PRAGMA foreign_keys=OFF;

BEGIN TRANSACTION;

CREATE TABLE UserRoleBackup (
  `id` INTEGER PRIMARY KEY,
  `role` TEXT CHECK(role IN ('admin', 'user', 'guest')) NOT NULL DEFAULT 'guest'
);
INSERT INTO UserRoleBackup SELECT `id`, `role` FROM UserRole;
DROP TABLE UserRole;
ALTER TABLE UserRoleBackup RENAME TO UserRole;

INSERT INTO UserRole (role) VALUES ('guest');

COMMIT;

PRAGMA foreign_keys=ON;
