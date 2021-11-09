package models

import "time"

type CoreModel struct {
}

type DateTimeModelMixin struct {
	CreatedAt *time.Time `json:"createdAt,omitempty"`
	UpdatedAt *time.Time `json:"updatedAt,omitempty"`
}

type IDModelMixin struct {
	ID int `json:"id"`
}
