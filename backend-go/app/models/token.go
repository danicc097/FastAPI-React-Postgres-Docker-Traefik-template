package models

type JWTMeta struct {
	CoreModel
	Issuer     string `json:"issuer"`
	Audience   string `json:"audience"`
	IssuedAt   int64  `json:"issued_at"`
	Expiration int64  `json:"expiration"`
}

type JWTCreds struct {
	CoreModel
	Subject  string `json:"subject"`
	Username string `json:"username"`
}

type JWTPayload struct {
	JWTMeta
	JWTCreds
}

type AccessToken struct {
	CoreModel
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
}
