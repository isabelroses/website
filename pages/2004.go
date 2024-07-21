package pages

import (
	"github.com/labstack/echo/v4"

	"isabelroses.com/templates"
)

func A2004(c echo.Context) error {
	return templates.RenderTemplate(c.Response().Writer, "stripped", nil, nil)
}
