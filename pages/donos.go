package pages

import (
	"strings"

	"github.com/labstack/echo/v4"
	"isabelroses.com/lib"
)

type DonoProps struct {
	Subscribers   lib.Donors
	OneTimeDonors lib.Donors
}

func Donos(c echo.Context) error {
	donors := lib.GetDonors()

	props := DonoProps{}

	for _, dono := range donors {
		if dono.Tier == "OneTime" {
			dono = handleAvatar(dono)
			props.OneTimeDonors = append(props.OneTimeDonors, dono)
		} else {
			dono = handleAvatar(dono)
			props.Subscribers = append(props.Subscribers, dono)
		}
	}

	components := []string{"header", "usercard"}
	return lib.RenderTemplate(c.Response().Writer, "base", components, props)
}

func handleAvatar(dono lib.Donor) lib.Donor {
	if dono.Avatar == "" {
		dono.Avatar = "/you.webp"
	} else if !strings.Contains(dono.Avatar, "avatars.githubusercontent.com") {
		dono.Avatar = "https://gravatar.com/avatar/" + dono.Avatar
	}
	return dono
}
