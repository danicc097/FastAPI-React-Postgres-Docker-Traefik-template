-- name: GetUserByEmail :one
SELECT
  *
FROM
  "users"
WHERE
  "email" = @email;

-- name: GetUserByUsername :one
SELECT
  *
FROM
  "users"
WHERE
  "username" = @username;

-- name: RegisterNewUser :one
INSERT INTO "users" ("username", "email", "password", "salt")
  VALUES (@username, @email, @password, @salt)
RETURNING
  *;

-- name: RegisterAdmin :one
INSERT INTO "users" ("username", "email", "password", "salt", "is_superuser", "is_verified")
  VALUES (@username, @email, @password, @salt, TRUE, TRUE)
RETURNING
  *;

-- name: RegisterVerifiedUser :one
INSERT INTO "users" ("username", "email", "password, salt", "is_verified")
  VALUES (@username, @email, @password, @salt, TRUE)
RETURNING
  *;

-- name: GetUserById :one
SELECT
  *
FROM
  "users"
WHERE
  "id" = @id;

-- name: UpdateUserById :one
UPDATE
  "users"
SET
  "password" = CASE WHEN @password_do_update::boolean THEN
    @password
  ELSE
    "password"
  END,
  "salt" = CASE WHEN @salt_do_update::boolean THEN
    @salt
  ELSE
    "salt"
  END,
  "username" = CASE WHEN @username_do_update::boolean THEN
    @username
  ELSE
    "username"
  END,
  "email" = CASE WHEN @email_do_update::boolean THEN
    @email
  ELSE
    "email"
  END
WHERE
  "id" = @id
RETURNING
  *;

-- name: ListAllUsers :many
SELECT
  *
FROM
  "users";

-- name: ListAllNonVerifiedUsers :many
SELECT
  *
FROM
  "users"
WHERE
  "is_verified" = 'false';

-- name: VerifyUserByEmail :one
UPDATE
  "users"
SET
  "is_verified" = 'true'
WHERE
  "email" = @email
RETURNING
  *;

-- name: ResetUserPassword :one
UPDATE
  "users"
SET
  "password" = @password,
  "salt" = @salt
WHERE
  "email" = @email
RETURNING
  *;

-- name: UpdateLastNotificationAt :one
UPDATE
  "users"
SET
  "last_notification_at" = @last_notification_at
WHERE
  "id" = @id
RETURNING
  *;

-- name: UpdateUserRole :one
UPDATE
  "users"
SET
  "role" = @role
WHERE
  "id" = @id
RETURNING
  *;

