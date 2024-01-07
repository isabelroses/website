package lib

import (
	"html/template"
)

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
	*PostMeta
	Content template.HTML
}

type PostMeta struct {
	ID          string
	Title       string
	Description string
	Date        string
	Tags        []string
	Href        string
}
