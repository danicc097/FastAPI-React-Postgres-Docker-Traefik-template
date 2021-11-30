// Code generated by sqlc. DO NOT EDIT.
// source: password_reset_requests.sql

package db

import (
	"context"
	"database/sql"
)

const createPasswordResetRequest = `-- name: CreatePasswordResetRequest :one
INSERT INTO "pwd_reset_req" ("email", "message")
  VALUES ($1, $2)
RETURNING
  id, email, message, created_at, updated_at
`

type CreatePasswordResetRequestParams struct {
	Email   sql.NullString `db:"email"`
	Message sql.NullString `db:"message"`
}

func (q *Queries) CreatePasswordResetRequest(ctx context.Context, arg CreatePasswordResetRequestParams) (PwdResetReq, error) {
	row := q.db.QueryRowContext(ctx, createPasswordResetRequest, arg.Email, arg.Message)
	var i PwdResetReq
	err := row.Scan(
		&i.ID,
		&i.Email,
		&i.Message,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const deletePasswordResetRequest = `-- name: DeletePasswordResetRequest :exec
DELETE FROM "pwd_reset_req"
WHERE "id" = $1
RETURNING
  id, email, message, created_at, updated_at
`

func (q *Queries) DeletePasswordResetRequest(ctx context.Context, id int32) error {
	_, err := q.db.ExecContext(ctx, deletePasswordResetRequest, id)
	return err
}

const getPasswordResetRequests = `-- name: GetPasswordResetRequests :many
SELECT
  id, email, message, created_at, updated_at
FROM
  "pwd_reset_req"
`

func (q *Queries) GetPasswordResetRequests(ctx context.Context) ([]PwdResetReq, error) {
	rows, err := q.db.QueryContext(ctx, getPasswordResetRequests)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []PwdResetReq{}
	for rows.Next() {
		var i PwdResetReq
		if err := rows.Scan(
			&i.ID,
			&i.Email,
			&i.Message,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
