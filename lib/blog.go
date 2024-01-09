package lib

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"os"
	"sort"
	"strings"
	"time"

	"github.com/yuin/goldmark"
	meta "github.com/yuin/goldmark-meta"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
)

func GetBlogPosts() []Post {
	var posts []Post

	files, err := os.ReadDir("./content/")
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".md") {
			content, err := os.ReadFile("./content/" + file.Name())
			if err != nil {
				log.Fatal(err)
			}

			post := createPost(content, file.Name())
			posts = append(posts, post)
		}
	}

	sortPosts(posts)

	return posts
}

func createPost(content []byte, fileName string) Post {
	markdown := goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			meta.Meta,
		),
	)

	var buf bytes.Buffer
	context := parser.NewContext()
	if err := markdown.Convert(content, &buf, parser.WithContext(context)); err != nil {
		log.Fatal(err)
	}
	metaData := meta.Get(context)

	post := Post{}
	post.Content = template.HTML(buf.String())
	post.Title = metaData["title"].(string)
	post.Date = metaData["date"].(string)
	post.Description = metaData["description"].(string)
	post.Tags = metaData["tags"]
	post.Slug = fmt.Sprintf("%v", strings.TrimSuffix(fileName, ".md"))

	return post
}

func sortPosts(posts []Post) {
	const layout = "02/01/2006"

	sort.Slice(posts, func(i, j int) bool {
		iDate, err := time.Parse(layout, posts[i].Date)
		if err != nil {
			log.Fatal(err)
		}

		jDate, err := time.Parse(layout, posts[j].Date)
		if err != nil {
			log.Fatal(err)
		}

		return iDate.Before(jDate)
	})

	for i, post := range posts {
		post.ID = i + 1
		post.Slug = fmt.Sprintf("%v-%v", post.Slug, post.ID)
		posts[i] = post
	}

	for i := 0; i < len(posts)/2; i++ {
		posts[i], posts[len(posts)-i-1] = posts[len(posts)-i-1], posts[i]
	}
}
