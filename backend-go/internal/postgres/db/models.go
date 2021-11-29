// Code generated by sqlc. DO NOT EDIT.

package db

import (
	"database/sql"
	"time"
)

type GlobalNotifications struct {
	ID           int32          `db:"id"`
	Sender       sql.NullString `db:"sender"`
	ReceiverRole string         `db:"receiver_role"`
	Title        string         `db:"title"`
	Body         string         `db:"body"`
	Label        string         `db:"label"`
	Link         sql.NullString `db:"link"`
	CreatedAt    time.Time      `db:"created_at"`
	UpdatedAt    time.Time      `db:"updated_at"`
}

type Profiles struct {
	ID          int32          `db:"id"`
	FullName    sql.NullString `db:"full_name"`
	PhoneNumber sql.NullString `db:"phone_number"`
	Bio         sql.NullString `db:"bio"`
	Image       sql.NullString `db:"image"`
	UserID      sql.NullInt32  `db:"user_id"`
	CreatedAt   time.Time      `db:"created_at"`
	UpdatedAt   time.Time      `db:"updated_at"`
}

type PwdResetReq struct {
	ID        int32          `db:"id"`
	Email     sql.NullString `db:"email"`
	Message   sql.NullString `db:"message"`
	CreatedAt time.Time      `db:"created_at"`
	UpdatedAt time.Time      `db:"updated_at"`
}

type Users struct {
	ID                 int32     `db:"id"`
	Username           string    `db:"username"`
	Email              string    `db:"email"`
	Role               string    `db:"role"`
	IsVerified         bool      `db:"is_verified"`
	Salt               string    `db:"salt"`
	Password           string    `db:"password"`
	IsActive           bool      `db:"is_active"`
	IsSuperuser        bool      `db:"is_superuser"`
	LastNotificationAt time.Time `db:"last_notification_at"`
	CreatedAt          time.Time `db:"created_at"`
	UpdatedAt          time.Time `db:"updated_at"`
}