package api

import (
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"

	"isabelroses.com/lib"

	"github.com/labstack/echo/v4"
)

func Kofi(c echo.Context) error {
	k := new(lib.KofiDono)

	if err := c.Bind(k); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}

	if !k.IsPublic {
		return c.String(http.StatusOK, "Accepted, and hidden")
	}

	var newData map[string]interface{}
	switch k.Type {
	case "Donation":
		newData = map[string]interface{}{
			"tier":   "OneTime",
			"name":   k.FromName,
			"url":    k.Url,
			"avatar": hashString(k.Email),
		}
	case "Subscription":
		if k.IsFirstSubscription {
			newData = map[string]interface{}{
				"tier":   k.TierName,
				"name":   k.FromName,
				"url":    k.Url,
				"avatar": hashString(k.Email),
			}
		}
	}

	lib.AppendToDonos(newData)

	return c.JSON(http.StatusOK, k)
}

func hashString(s string) string {
	ls := strings.ToLower(s)
	bs := sha256.Sum256([]byte(ls))
	return hex.EncodeToString(bs[:])
}
