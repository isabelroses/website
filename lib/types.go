package lib

import "html/template"

type IconLink struct {
	Name string
	Href string
	Icon template.HTML
}

type Project struct {
	Name        string
	Description string
	Href        string
	Repo        string
	Icon        string
	Banner      string
}

type Post struct {
	ID          int
	Title       string
	Description string
	Content     template.HTML
	Date        string
	Tags        []string
	Slug        string
}

type Posts []Post

type Subscriber struct {
	Tier   string
	Name   string
	Avatar string
}

type Subscribers []Subscriber

type KofiDono struct {
	VerificationToken   string `json:"verification_token"`
	MessageId           string `json:"message_id"`
	Timestamp           string `json:"timestamp"`
	Type                string `json:"type"`
	IsPublic            bool   `json:"is_public"`
	FromName            string `json:"from_name"`
	Message             string `json:"message"`
	Amount              string `json:"amount"`
	Url                 string `json:"url"`
	Email               string `json:"email"`
	Currency            string `json:"currency"`
	IsSubscription      bool   `json:"is_subscription_payment"`
	IsFirstSubscription bool   `json:"is_first_subscription_payment"`
	TransactionID       string `json:"kofi_transaction_id"`
	ShopItems           string `json:"shop_items"`
	TierName            string `json:"tier_name"`
	Shipping            string `json:"shipping"`
}

type GitHubDono struct {
	Action string `json:"action"`

	Sponsorship struct {
		CreatedAt    string `json:"created_at"`
		PrivaryLevel string `json:"privacy_level"`

		Sponsor GitHubSponsor `json:"sponsor"`

		Tier struct {
			Name      string `json:"name"`
			IsOneTime bool   `json:"is_one_time"`
		} `json:"tier"`
	} `json:"sponsorship"`
}

type GitHubSponsor struct {
	AvatarURL string `json:"avatar_url"`
	Login     string `json:"login"`
	Name      string `json:"name"`
}

type Donor struct {
	Tier   string
	Name   string
	Avatar string
}

type Donors []Donor
