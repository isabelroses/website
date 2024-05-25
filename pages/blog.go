package pages

import (
	"github.com/labstack/echo/v4"

	"isabelroses.com/lib"
)

type BlogProps struct {
	Tag   string
	Posts lib.Posts
	Tags  []string
}

func Blog(c echo.Context) error {
	tag := c.Param("tag")
	var posts lib.Posts

	if tag == "" {
		posts = lib.GetBlogPosts()
	} else {
		posts = lib.GetBlogPosts().FilterByTag(tag)
	}

	props := BlogProps{
		Posts: posts,
		Tags:  lib.GetAllBlogTags(),
		Tag:   tag,
	}

	components := []string{"header", "blogpreview"}
	return lib.RenderTemplate(c.Response().Writer, "base", components, props)
}
