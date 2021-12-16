// Code generated by sqlc. DO NOT EDIT.
// source: profiles.sql

package db

import (
	"context"
	"database/sql"
	"time"
)

const createProfile = `-- name: CreateProfile :one
INSERT INTO profiles ("full_name", "phone_number", "bio", "image", "user_id")
VALUES ($1, $2, $3, $4, $5)
RETURNING
  id, full_name, phone_number, bio, image, user_id, created_at, updated_at
`

type CreateProfileParams struct {
	FullName    sql.NullString `db:"full_name"`
	PhoneNumber sql.NullString `db:"phone_number"`
	Bio         sql.NullString `db:"bio"`
	Image       sql.NullString `db:"image"`
	UserID      sql.NullInt32  `db:"user_id"`
}

func (q *Queries) CreateProfile(ctx context.Context, arg CreateProfileParams) (Profiles, error) {
	row := q.db.QueryRowContext(ctx, createProfile,
		arg.FullName,
		arg.PhoneNumber,
		arg.Bio,
		arg.Image,
		arg.UserID,
	)
	var i Profiles
	err := row.Scan(
		&i.ID,
		&i.FullName,
		&i.PhoneNumber,
		&i.Bio,
		&i.Image,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getProfileById = `-- name: GetProfileById :one
SELECT
    id, full_name, phone_number, bio, image, user_id, created_at, updated_at
FROM
    profiles
WHERE
    "user_id" = $1
`

func (q *Queries) GetProfileById(ctx context.Context, userID sql.NullInt32) (Profiles, error) {
	row := q.db.QueryRowContext(ctx, getProfileById, userID)
	var i Profiles
	err := row.Scan(
		&i.ID,
		&i.FullName,
		&i.PhoneNumber,
		&i.Bio,
		&i.Image,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getProfileByUsername = `-- name: GetProfileByUsername :one
SELECT
    profiles.id,
    users.email,
    users.username,
    profiles.full_name,
    profiles.phone_number,
    profiles.bio,
    profiles.image,
    profiles.user_id,
    profiles.created_at,
    profiles.updated_at
FROM
    profiles
INNER JOIN users ON profiles.user_id = users.id
WHERE
    users.username = $1::text
`

type GetProfileByUsernameRow struct {
	ID          int32          `db:"id"`
	Email       string         `db:"email"`
	Username    string         `db:"username"`
	FullName    sql.NullString `db:"full_name"`
	PhoneNumber sql.NullString `db:"phone_number"`
	Bio         sql.NullString `db:"bio"`
	Image       sql.NullString `db:"image"`
	UserID      sql.NullInt32  `db:"user_id"`
	CreatedAt   time.Time      `db:"created_at"`
	UpdatedAt   time.Time      `db:"updated_at"`
}

func (q *Queries) GetProfileByUsername(ctx context.Context, username string) (GetProfileByUsernameRow, error) {
	row := q.db.QueryRowContext(ctx, getProfileByUsername, username)
	var i GetProfileByUsernameRow
	err := row.Scan(
		&i.ID,
		&i.Email,
		&i.Username,
		&i.FullName,
		&i.PhoneNumber,
		&i.Bio,
		&i.Image,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateProfile = `-- name: UpdateProfile :one
UPDATE
profiles
SET
    "full_name" = CASE WHEN $1::boolean THEN
        $2
        ELSE
            "full_name"
    END,
    "phone_number" = CASE WHEN $3::boolean THEN
        $4
        ELSE
            "phone_number"
    END,
    "bio" = CASE WHEN $5::boolean THEN
        $6
        ELSE
            "bio"
    END,
    "image" = CASE WHEN $7::boolean THEN
        $8
        ELSE
            "image"
    END
WHERE
    "user_id" = $9 
RETURNING
  id, full_name, phone_number, bio, image, user_id, created_at, updated_at
`

type UpdateProfileParams struct {
	FullNameDoUpdate    bool           `db:"full_name_do_update"`
	FullName            sql.NullString `db:"full_name"`
	PhoneNumberDoUpdate bool           `db:"phone_number_do_update"`
	PhoneNumber         sql.NullString `db:"phone_number"`
	BioDoUpdate         bool           `db:"bio_do_update"`
	Bio                 sql.NullString `db:"bio"`
	ImageDoUpdate       bool           `db:"image_do_update"`
	Image               sql.NullString `db:"image"`
	UserID              sql.NullInt32  `db:"user_id"`
}

func (q *Queries) UpdateProfile(ctx context.Context, arg UpdateProfileParams) (Profiles, error) {
	row := q.db.QueryRowContext(ctx, updateProfile,
		arg.FullNameDoUpdate,
		arg.FullName,
		arg.PhoneNumberDoUpdate,
		arg.PhoneNumber,
		arg.BioDoUpdate,
		arg.Bio,
		arg.ImageDoUpdate,
		arg.Image,
		arg.UserID,
	)
	var i Profiles
	err := row.Scan(
		&i.ID,
		&i.FullName,
		&i.PhoneNumber,
		&i.Bio,
		&i.Image,
		&i.UserID,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
