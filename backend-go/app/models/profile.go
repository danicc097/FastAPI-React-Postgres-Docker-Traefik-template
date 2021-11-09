package models

type ProfileBase struct {
	CoreModel
	FullName    string `json:"fullName,omitempty"`
	PhoneNumber string `json:"phoneNumber,omitempty"`
	Bio         string `json:"bio,omitempty"`
	Image       string `json:"image,omitempty"`
}

type ProfileCreate struct {
	UserID int `json:"userId"`
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
