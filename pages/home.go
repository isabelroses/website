package pages

import (
	"html/template"
	"log"

	"github.com/labstack/echo/v4"
)

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
