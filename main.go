package main

import (
	"fmt"
	"net/http"

	"isabelroses.com/lib"
	"isabelroses.com/pages"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

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
	e.Pre(middleware.RemoveTrailingSlash())
	e.Use(middleware.GzipWithConfig(middleware.GzipConfig{
		Level: 5,
	}))
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(50)))

	e.HTTPErrorHandler = customHTTPErrorHandler

	e.GET("/", pages.Home)
	
	e.GET("/projects", pages.Projects)
	
	blogGroup := e.Group("blog")
	blogGroup.GET("", pages.Blog)
	blogGroup.GET("/:slug", pages.Post)
	blogGroup.GET("/tag/:tag", pages.Blog)
	
	e.GET("/rss.xml", func(c echo.Context) error {
		rss := lib.RssFeed()
		return c.XML(http.StatusOK, rss)
	})

	e.Static("/public", lib.GetPath("/public"))
		
	e.Logger.Fatal(e.Start(":3000"))
}
