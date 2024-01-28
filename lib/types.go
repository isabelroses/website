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
