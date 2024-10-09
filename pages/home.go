package pages

import (
	"fmt"
	"image/color"
	"regexp"
	"strings"

	"github.com/labstack/echo/v4"

	"isabelroses.com/lib"
	"isabelroses.com/templates"
)

var (
	fields = [8]string{"isabel roses", "", "Pronouns", "GitHub", "Contact", "Discord", "Fedi", "Email"}
	data   = [8]string{"", "", "she/her", "https://github.com/isabelroses", "https://isabel.contact", "https://discord.gg/8RVhHeJH3x", "@isabel@akko.isabelroses.com", "me@isabelroses.com"}

	groupSize       = 10
	transFlagColors = []color.RGBA{
		{91, 206, 250, 255},  // Light Blue
		{245, 169, 184, 255}, // Pink
		{255, 255, 255, 255}, // White
		{245, 169, 184, 255}, // Pink
		{91, 206, 250, 255},  // Light Blue
	}
)

func Home(c echo.Context) error {
	match, err := regexp.MatchString(".*(curl|wget).*", c.Request().Header.Get("User-Agent"))
	if err != nil {
		return err
	}

	if match {
		pfp_arr := strings.Split(string(lib.Pfp), "\n")

		larger := max(len(pfp_arr), len(fields))

		max_field_len := 0
		for _, v := range fields {
			length := len(v)
			if length > max_field_len {
				max_field_len = length
			}
		}

		// Define the fixed length of the right side (field + data)
		max_data_len := 50 // Adjust as needed based on your layout
		if len(fields) > larger {
			larger = len(fields)
		}

		var out strings.Builder
		for i := 0; i < larger; i++ {
			left := ""
			right := ""

			if i < len(pfp_arr) {
				left = pfp_arr[i]
			}

			if i < len(fields) {
				field := fields[i]
				field_with_padding := fmt.Sprint(field, strings.Repeat(" ", max_field_len-len(field)))
				right = fmt.Sprint(field_with_padding, data[i])
				right += strings.Repeat(" ", max_data_len-len(right))
			}

			remainder := right
			right = ""

			for idx := 0; idx < len(remainder); {
				colorIndex := idx / groupSize % len(transFlagColors)
				rgba := transFlagColors[colorIndex]

				chunkSize := groupSize
				if idx+chunkSize > len(remainder) {
					chunkSize = len(remainder) - idx
				}

				right += fmt.Sprintf("\x1b[48;2;%d;%d;%dm\x1b[30m%s", rgba.R, rgba.G, rgba.B, remainder[idx:idx+chunkSize])
				idx += chunkSize
			}

			out.WriteString(fmt.Sprintln(left, "  ", right))
		}

		return c.String(200, out.String())
	}

	components := []string{"header"}
	return templates.RenderTemplate(c.Response().Writer, "base", components, nil)
}
