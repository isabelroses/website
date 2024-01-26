package pages

import (
	"github.com/labstack/echo/v4"

	"isabelroses.com/lib"
)

func Home(c echo.Context) error {
	components := []string{"header"}
	return lib.RenderTemplate(c.Response().Writer, "base", components, nil)
}
