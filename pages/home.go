package pages

import (
	"html/template"
	"log"

	"github.com/labstack/echo/v4"
	"isabelroses.com/lib"
)

type HomeProps struct {
	Socials      []lib.IconLink
	Tech         []lib.IconLink
	ContractLink string
	ResumeURL    string
	SupportLink  string
}

func Home(c echo.Context) error {
	templates := []string{
		"./templates/layouts/base.html",
		"./templates/partials/header.html",
		"./templates/pages/home.html",
	}

	ts, err := template.ParseFiles(templates...)
	if err != nil {
		log.Print(err.Error())
		return err
	}

	return ts.ExecuteTemplate(c.Response().Writer, "base", nil)
}
