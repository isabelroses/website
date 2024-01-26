package pages

import (
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
			Icon:   "userstyles-icon.webp",
			Banner: "userstyles-banner.webp",
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
			Icon:        "bellado-icon.webp",
			Banner:      "bellado-banner.webp",
			Repo:        "https://github.com/isabelroses/bellado",
		},
	}

	props := ProjectProps{
		Projects: projects,
	}

	components := []string{"header", "project"}
	return lib.RenderTemplate(c.Response().Writer, "base", components, props)
}
