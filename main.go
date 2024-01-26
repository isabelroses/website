package main

import (
	"fmt"
	"io"
	"net/http"
	"text/template"

	"isabelroses.com/lib"
	"isabelroses.com/pages"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

type Template struct {
	templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func customHTTPErrorHandler(err error, c echo.Context) {
	code := http.StatusInternalServerError
	if he, ok := err.(*echo.HTTPError); ok {
		code = he.Code
	}
	c.Logger().Error(err)
	if err := c.Render(code, fmt.Sprintf("%v", pages.ErrorPage(c, code)), nil); err != nil {
		c.Logger().Error(err)
	}
}

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.RequestID())
	e.Use(middleware.Secure())
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5,
	}))
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(69)))

	e.HTTPErrorHandler = customHTTPErrorHandler

	e.GET("/", pages.Home)

	e.GET("/projects", pages.Projects)
	e.GET("/projects/*", pages.Projects)

	e.GET("/blog", pages.Blog)
	e.GET("/blog/tag/:tag", pages.Blog)
	e.GET("/blog/:slug", pages.Post)

	e.GET("/rss.xml", func(c echo.Context) error {
		rss := lib.RssFeed()
		return c.XML(http.StatusOK, rss)
	})

	e.Static("/public", lib.GetPath("/public"))
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if c.Request().URL.Path == "/public/*" {
				c.Response().Header().Set("Cache-Control", "public, max-age=86400")
			}
			return next(c)
		}
	})

	e.Logger.Fatal(e.Start(":3000"))
}
