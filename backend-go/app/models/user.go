package models

type UserBase struct {
	CoreModel
	Email         string `validate:"required,email"`
	Username      string `json:"username"`
	EmailVerified bool   `json:"email_verified"`
	IsActive      bool   `json:"is_active"`
	IsSuperuser   bool   `json:"is_superuser"`
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
	OldPassword string `json:"old_password,omitempty"`
	Email       string `json:"email,omitempty"`
	Username    string `json:"username,omitempty"`
}

type UserInDB struct {
	IDModelMixin
	DateTimeModelMixin
	Email         string `json:"email"`
	Username      string `json:"username"`
	Password      string `json:"password"`
	EmailVerified bool   `json:"email_verified"`
	IsActive      bool   `json:"is_active"`
	IsSuperuser   bool   `json:"is_superuser"`
}

type UserPublic struct {
	IDModelMixin
	DateTimeModelMixin
	Email         string        `json:"email"`
	Username      string        `json:"username"`
	EmailVerified bool          `json:"email_verified"`
	IsActive      bool          `json:"is_active"`
	IsSuperuser   bool          `json:"is_superuser"`
	AccessToken   string        `json:"access_token,omitempty"`
	Profile       ProfilePublic `json:"profile,omitempty"`
}
