package main

import (
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

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.RequestID())
	e.Use(middleware.Secure())
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5,
	}))
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(69)))

	t := &Template{
		templates: template.Must(template.ParseGlob(lib.GetPath("templates/**/*.html"))),
	}

	e.Renderer = t

	e.Static("/public", lib.GetPath("public"))

	e.GET("/", pages.Home)

	e.GET("/projects", pages.Projects)
	e.GET("/projects/*", pages.Projects)

	e.GET("/blog", pages.Blog)
	e.GET("/blog/:slug", pages.Post)

	e.GET("/rss.xml", func(c echo.Context) error {
		rss := lib.RssFeed()
		return c.XML(http.StatusOK, rss)
	})

	e.Logger.Fatal(e.Start(":3000"))
}
