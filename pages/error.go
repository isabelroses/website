package pages

import (
	"strconv"

	"github.com/labstack/echo/v4"

	"isabelroses.com/templates"
)

type ErrorProps struct {
	Code string
}

func ErrorPage(c echo.Context, code int) error {
	props := ErrorProps{
		Code: strconv.Itoa(code),
	}

	c.Response().WriteHeader(code)
	components := []string{"header"}
	return templates.RenderTemplate(c.Response().Writer, "base", components, props)
}
