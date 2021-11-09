package models

type PasswordResetRequest struct {
	CoreModel
	DateTimeModelMixin
	IDModelMixin
	Email   string `validate:"required,email"`
	Message string `validate:"required,min=2"`
}

type PasswordResetRequestCreate struct {
	Email   string `validate:"required,email"`
	Message string `validate:"required,min=2"`
}
