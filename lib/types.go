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
	Title       string
	Description string
	Content     template.HTML
	Date        string
	Slug        string
	Tags        []string
	ID          int
}

type Posts []Post

type Subscriber struct {
	Tier   string
	Name   string
	Avatar string
}

type Subscribers []Subscriber

type KofiDono struct {
	Message             string `json:"message"`
	ShopItems           string `json:"shop_items"`
	Timestamp           string `json:"timestamp"`
	Type                string `json:"type"`
	VerificationToken   string `json:"verification_token"`
	FromName            string `json:"from_name"`
	MessageID           string `json:"message_id"`
	Amount              string `json:"amount"`
	Currency            string `json:"currency"`
	Email               string `json:"email"`
	URL                 string `json:"url"`
	Shipping            string `json:"shipping"`
	TierName            string `json:"tier_name"`
	TransactionID       string `json:"kofi_transaction_id"`
	IsPublic            bool   `json:"is_public"`
	IsFirstSubscription bool   `json:"is_first_subscription_payment"`
	IsSubscription      bool   `json:"is_subscription_payment"`
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
	HTMLURL   string `json:"html_url"`
	Name      string `json:"name"`
}

type Donor struct {
	Tier   string
	Name   string
	URL    string
	Avatar string
}

type Donors []Donor
