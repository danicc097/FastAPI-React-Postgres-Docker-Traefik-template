package main

import (
	"context"
	"database/sql"
	"fmt"
	"myapp-backend/internal/postgres/db"
	"os"
)

//go:generate sqlc generate

type PostgreSQLC struct {
	db *sql.DB
}

func NewPostgreSQLC() (*PostgreSQLC, error) {
	db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
	if err != nil {
		return nil, err
	}

	return &PostgreSQLC{
		db: db,
	}, nil
}

func (p *PostgreSQLC) Close() {
	p.db.Close()
}

// type Users struct {
// 	ID                 int32     `db:"id"`
// 	Username           string    `db:"username"`
// 	Email              string    `db:"email"`
// 	Role               string    `db:"role"`
// 	IsVerified         bool      `db:"is_verified"`
// 	Salt               string    `db:"salt"`
// 	Password           string    `db:"password"`
// 	IsActive           bool      `db:"is_active"`
// 	IsSuperuser        bool      `db:"is_superuser"`
// 	LastNotificationAt time.Time `db:"last_notification_at"`
// 	CreatedAt          time.Time `db:"created_at"`
// 	UpdatedAt          time.Time `db:"updated_at"`
// }
func (p *PostgreSQLC) GetUserByUsername(username string) (db.Users, error) {
	fmt.Println(username)
	row, err := db.New(p.db).GetUserByUsername(context.Background(), username)
	fmt.Println(row, err)
	if err != nil {
		return db.Users{}, err
	}

	return db.Users{
		ID:         row.ID,
		Username:   row.Username,
		Email:      row.Email,
		Role:       row.Role,
		IsVerified: row.IsVerified,
		// Salt:               row.Salt,
		// Password:           row.Password,
		IsActive:           row.IsActive,
		IsSuperuser:        row.IsSuperuser,
		LastNotificationAt: row.LastNotificationAt,
		CreatedAt:          row.CreatedAt,
		UpdatedAt:          row.UpdatedAt,
	}, nil
}
