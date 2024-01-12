package pages

import (
	"html/template"
	"log"

	"github.com/labstack/echo/v4"
	"isabelroses.com/lib"
)

type ProjectProps struct {
	Projects []lib.Project
}

func Projects(c echo.Context) error {
	projects := []lib.Project{
		{
			Name:        "This site",
			Description: "This site that your currently on.",
			Href:        "https://isabelroses.com",
			Repo:        "https://github.com/isabelroses/website",
		},
		{
			Name:   "Userstyles",
			Icon:   "userstyles-icon.png",
			Banner: "userstyles-banner.jpg",
			Repo:   "https://github.com/catppuccin/userstyles",
		},
		{
			Name:   "Dotfiles",
			Icon:   "dotfiles-icon.svg",
			Banner: "dotfiles-banner.svg",
			Repo:   "https://github.com/isabelroses/dotfiles",
		},
		{
			Name:        "Bellado",
			Description: "A fast and once simple cli todo tool",
			Icon:        "bellado-icon.png",
			Banner:      "bellado-banner.png",
			Repo:        "https://github.com/isabelroses/bellado",
		},
	}

	props := ProjectProps{
		Projects: projects,
	}

	templates := []string{
		lib.GetPath("templates/layouts/base.html"),
		lib.GetPath("templates/components/header.html"),
		lib.GetPath("templates/components/heading.html"),
		lib.GetPath("templates/components/project.html"),
		lib.GetPath("templates/pages/projects.html"),
	}

	ts, err := template.ParseFiles(templates...)
	if err != nil {
		log.Print(err.Error())
		return err
	}

	return ts.ExecuteTemplate(c.Response().Writer, "base", props)
}
