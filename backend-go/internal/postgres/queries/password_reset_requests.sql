-- name: CreatePasswordResetRequest :one
INSERT INTO "pwd_reset_req" ("email", "message")
VALUES (@email, @message)
RETURNING
  *;

-- name: DeletePasswordResetRequest :exec
DELETE FROM "pwd_reset_req"
WHERE "id" = @id 
RETURNING
  *;

-- name: GetPasswordResetRequests :many
SELECT
    *
FROM
    "pwd_reset_req";
