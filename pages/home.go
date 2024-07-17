package pages

import (
	"github.com/labstack/echo/v4"

	"isabelroses.com/templates"
)

func Home(c echo.Context) error {
	components := []string{"header"}
	return templates.RenderTemplate(c.Response().Writer, "base", components, nil)
}
