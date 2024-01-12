package lib

import (
	"strconv"
	"time"

	"github.com/gorilla/feeds"
)

func RssFeed() *feeds.RssFeedXml {
	feed := &feeds.Feed{
		Title:       "Isabel Roses",
		Link:        &feeds.Link{Href: "https://isabelroses.com"},
		Description: "Isabel Roses' blog",
		Author:      &feeds.Author{Name: "Isabel Roses", Email: "isabel@isabelroses.com"},
		Created:     time.Now(),
	}

	posts := GetBlogPosts()

	var feedItems []*feeds.Item
	for _, post := range posts {
		created, _ := time.Parse(time.RFC3339, post.Date)
		feedItems = append(feedItems, &feeds.Item{
			Id:          strconv.Itoa(post.ID),
			Title:       post.Title,
			Link:        &feeds.Link{Href: "https://isabelroses.com/blog/" + post.Slug, Rel: "self"},
			Description: string(post.Content),
			Created:     created,
		})
	}
	feed.Items = feedItems

	rssFeed := (&feeds.Rss{Feed: feed}).RssFeed()
	xmlRssFeeds := rssFeed.FeedXml()

	return xmlRssFeeds.(*feeds.RssFeedXml)
}
