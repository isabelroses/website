package pages

import (
	"bytes"
	"errors"
	"html/template"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark-meta"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"isabelroses.com/lib"
)

type PostProps struct {
	Content template.HTML
	ID      int
	Title   string
	Date    string
	Tags    []string
}

func Post(c echo.Context) error {
	var (
		posts    = lib.GetBlogPosts()
		slug     = c.ParamValues()[0]
		postName string
	)

	parts := strings.Split(slug, "-")
	id := parts[len(parts)-1]

	for _, post := range posts {
		if id == post.ID {
			postName = strings.ToLower(strings.ReplaceAll(post.Title, " ", "-"))

			if post.Href != slug {
				c.Redirect(http.StatusSeeOther, "/blog/"+post.Href)
			}
		}
	}

	filePath := "content/" + postName + ".md"

	content, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}

	markdown := goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			meta.Meta,
		),
	)

	var buf bytes.Buffer
	context := parser.NewContext()
	if err := markdown.Convert(content, &buf); err != nil {
		return err
	}
	metaData := meta.Get(context)

	props := map[string]interface{}{
		"Content":     template.HTML(buf.String()),
		"ID":          metaData["ID"],
		"Title":       metaData["title"],
		"Description": metaData["description"],
		"Date":        metaData["date"],
		"Tags":        metaData["tags"],
	}

	templates := []string{
		"./templates/layouts/base.html",
		"./templates/partials/header.html",
		"./templates/pages/post.html",
	}

	ts, err := template.ParseFiles(templates...)
	if err != nil {
		log.Print(err.Error())
		return err
	}

	return ts.ExecuteTemplate(c.Response().Writer, "base", props)
}
