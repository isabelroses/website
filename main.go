package main

import (
	"embed"
	"fmt"
	"io/fs"
	"net/http"
	"strings"

	"isabelroses.com/api"
	"isabelroses.com/lib"
	"isabelroses.com/pages"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func customHTTPErrorHandler(err error, c echo.Context) {
	// Ignore the error for requests to /api URLs
	if strings.Contains(c.Path(), "/api") {
		c.Logger().Error(err)
		return
	}

	code := http.StatusInternalServerError
	if he, ok := err.(*echo.HTTPError); ok {
		code = he.Code
	}
	c.Logger().Error(err)
	if err := c.Render(code, fmt.Sprintf("%v", pages.ErrorPage(c, code)), nil); err != nil {
		c.Logger().Error(err)
	}
}

//go:embed public/*
var PubFS embed.FS

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.RequestID())
	e.Use(middleware.Secure())
	e.Pre(middleware.RemoveTrailingSlash())
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5,
	}))
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(50)))

	e.HTTPErrorHandler = customHTTPErrorHandler

	e.GET("/", pages.Home)

	e.GET("/projects", pages.Projects)

	e.GET("/donations", pages.Donos)

	e.GET("/2004", pages.A2004)

	blogGroup := e.Group("/blog")
	blogGroup.GET("", pages.Blog)
	blogGroup.GET("/:slug", pages.Post)
	blogGroup.GET("/tag/:tag", pages.Blog)

	apiGroup := e.Group("/api")
	apiGroup.POST("/kofi", api.Kofi)
	apiGroup.POST("/github", api.Github)

	e.GET("/rss.xml", func(c echo.Context) error {
		c.Redirect(http.StatusMovedPermanently, "/feed.xml")
		return nil
	})

	e.GET("/feed.xml", func(c echo.Context) error {
		atom := lib.AtomFeed()
		return c.XML(http.StatusOK, atom)
	})

	e.GET("/feed.json", func(c echo.Context) error {
		json := lib.JSONFeed()
		return c.JSON(http.StatusOK, json)
	})

	strippedFS, err := fs.Sub(PubFS, "public")
	if err != nil {
		panic(err)
	}
	fs := http.FS(strippedFS)
	e.GET("/*", echo.WrapHandler(http.FileServer(fs)))

	e.Logger.Fatal(e.Start(":3000"))
}
