package lib

import (
	"bytes"
	"embed"
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"sort"
	"strings"
	"time"

	"github.com/yuin/goldmark"
	meta "github.com/yuin/goldmark-meta"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
)

//go:embed content/*
var content embed.FS

func GetBlogPosts() Posts {
	var posts Posts

	files, err := fs.ReadDir(content, "content")
	if err != nil {
		log.Fatalf("failed to open file: %v", err)
	}

	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".md") {
			content, err := fs.ReadFile(content, "content/"+file.Name())
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
			NewCodewrap(),
		),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
		),
		goldmark.WithRendererOptions(
			html.WithXHTML(),
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
	post.Slug = fmt.Sprintf("%v", strings.TrimSuffix(fileName, ".md"))

	tagsInterface, ok := metaData["tags"].([]interface{})
	if !ok {
		log.Fatal(ok)
	}

	// Convert each element from interface{} to string
	var tags []string
	for _, tag := range tagsInterface {
		if str, ok := tag.(string); ok {
			tags = append(tags, str)
		} else {
			log.Fatal(ok)
		}
	}
	post.Tags = tags

	return post
}

func sortPosts(posts Posts) {
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

func (posts Posts) FilterByTag(tag string) Posts {
	var filteredPosts Posts

	for _, post := range posts {
		if contains(post.Tags, tag) {
			filteredPosts = append(filteredPosts, post)
		}
	}

	return filteredPosts
}

func GetAllBlogTags() []string {
	var tags []string

	for _, post := range GetBlogPosts() {
		for _, tag := range post.Tags {
			if !contains(tags, tag) {
				tags = append(tags, tag)
			}
		}
	}

	return tags
}

func contains(tags []string, tag string) bool {
	for _, t := range tags {
		if t == tag {
			return true
		}
	}
	return false
}
