package models

import "time"

type CoreModel struct {
}

type DateTimeModelMixin struct {
	CreatedAt *time.Time `json:"created_at,omitempty"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

type IDModelMixin struct {
	ID int `json:"id"`
}
