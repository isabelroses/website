package pages

import (
	"html/template"
	"log"

	"github.com/labstack/echo/v4"

	"isabelroses.com/lib"
)

func Home(c echo.Context) error {
	templates := []string{
		lib.GetPath("templates/layouts/base.html"),
		lib.GetPath("templates/components/header.html"),
		lib.GetPath("templates/pages/home.html"),
	}

	ts, err := template.ParseFiles(templates...)
	if err != nil {
		log.Print(err.Error())
		return err
	}

	return ts.ExecuteTemplate(c.Response().Writer, "base", nil)
}
