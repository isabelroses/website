package pages

import (
	"html/template"
	"log"
	"strconv"

	"github.com/labstack/echo/v4"

	"isabelroses.com/lib"
)

type ErrorProps struct {
	Code string
}

func ErrorPage(c echo.Context, code int) error {
	props := ErrorProps{
		Code: strconv.Itoa(code),
	}

	templates := []string{
		lib.GetPath("templates/layouts/base.html"),
		lib.GetPath("templates/components/header.html"),
		lib.GetPath("templates/pages/error.html"),
	}

	ts, err := template.ParseFiles(templates...)
	if err != nil {
		log.Print(err.Error())
		return err
	}

	c.Response().WriteHeader(code)
	return ts.ExecuteTemplate(c.Response().Writer, "base", props)
}
