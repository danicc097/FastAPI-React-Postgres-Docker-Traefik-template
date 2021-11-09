package models

type JWTMeta struct {
	CoreModel
	Issuer     string `json:"issuer"`
	Audience   string `json:"audience"`
	IssuedAt   int64  `json:"issuedAt"`
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
	AccessToken string `json:"accessToken"`
	TokenType   string `json:"tokenType"`
}
