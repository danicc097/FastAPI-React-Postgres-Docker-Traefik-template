package models

type UserBase struct {
	CoreModel
	Email         string `validate:"required,email"`
	Username      string `json:"username"`
	EmailVerified bool   `json:"emailVerified"`
	IsActive      bool   `json:"isActive"`
	IsSuperuser   bool   `json:"isSuperuser"`
}

type UserCreate struct {
	CoreModel
	Email    string `json:"email"`
	Password string `json:"password"`
	Username string `json:"username"`
}

type UserPasswordRegistration struct {
	CoreModel
	Password string `json:"password"`
}

type UserUpdate struct {
	CoreModel
	Password    string `json:"password,omitempty"`
	OldPassword string `json:"oldPassword,omitempty"`
	Email       string `json:"email,omitempty"`
	Username    string `json:"username,omitempty"`
}

type UserInDB struct {
	IDModelMixin
	DateTimeModelMixin
	Email         string `json:"email"`
	Username      string `json:"username"`
	Password      string `json:"password"`
	EmailVerified bool   `json:"emailVerified"`
	IsActive      bool   `json:"isActive"`
	IsSuperuser   bool   `json:"isSuperuser"`
}

type UserPublic struct {
	IDModelMixin
	DateTimeModelMixin
	Email         string        `json:"email"`
	Username      string        `json:"username"`
	EmailVerified bool          `json:"emailVerified"`
	IsActive      bool          `json:"isActive"`
	IsSuperuser   bool          `json:"isSuperuser"`
	AccessToken   string        `json:"accessToken,omitempty"`
	Profile       ProfilePublic `json:"profile,omitempty"`
}
