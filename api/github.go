package api

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"isabelroses.com/lib"
)

func Github(c echo.Context) error {
	g := new(lib.GitHubDono)

	if err := c.Bind(g); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if g.Sponsorship.PrivaryLevel == "SECRET" {
		return c.String(http.StatusOK, "Accepted, and hidden")
	}

	if g.Action != "created" {
		return c.String(http.StatusOK, "Not a new sponsorship")
	}

	var newData map[string]interface{}
	switch {
	case g.Sponsorship.Tier.IsOneTime:
		newData = map[string]interface{}{
			"tier":   "OneTime",
			"name":   getName(g.Sponsorship.Sponsor),
			"avatar": g.Sponsorship.Sponsor.AvatarURL,
		}
	case !g.Sponsorship.Tier.IsOneTime:
		newData = map[string]interface{}{
			"tier":   g.Sponsorship.Tier.Name,
			"name":   getName(g.Sponsorship.Sponsor),
			"avatar": g.Sponsorship.Sponsor.AvatarURL,
		}
	}

	lib.AppendTooDonos(newData)

	return c.JSON(http.StatusOK, g)
}

func getName(sponsor lib.GitHubSponsor) string {
	if sponsor.Name != "" {
		return sponsor.Name
	}
	return sponsor.Login
}
