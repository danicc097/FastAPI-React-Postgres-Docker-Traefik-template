package models

// convert all python pydantic models to go structs
// code below is golang
type ProfileBase struct {
	CoreModel
	FullName    string `json:"full_name,omitempty"`
	PhoneNumber string `json:"phone_number,omitempty"`
	Bio         string `json:"bio,omitempty"`
	Image       string `json:"image,omitempty"`
}

type ProfileCreate struct {
	UserID int `json:"user_id"`
	ProfileBase
}

type ProfileUpdate struct {
	ProfileBase
}

type ProfileInDB struct {
	IDModelMixin
	DateTimeModelMixin
	ProfileBase
	Username string `json:"username,omitempty"`
	Email    string `json:"email,omitempty"`
}

type ProfilePublic struct {
	ProfileInDB
}
