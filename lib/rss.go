package lib

import (
	"time"

	"github.com/gorilla/feeds"
)

func RssFeed() *feeds.RssFeedXml {
	feed := &feeds.Feed{
		Title:       "Isabel Roses",
		Link:        &feeds.Link{Href: "https://isabelroses.com", Rel: "self"},
		Description: "Isabel Roses' blog",
		Author:      &feeds.Author{Name: "Isabel Roses", Email: "isabel@isabelroses.com"},
		Created:     time.Now(),
	}

	posts := GetBlogPosts()

	var feedItems []*feeds.Item
	for _, post := range posts {
		created, _ := time.Parse("02/01/2006", post.Date)
		created.Format(time.RFC3339)
		href := "https://isabelroses.com/blog/" + post.Slug
		feedItems = append(feedItems, &feeds.Item{
			Id:          href,
			Title:       post.Title,
			Link:        &feeds.Link{Href: href, Rel: "self"},
			Description: string(post.Content),
			Created:     created,
		})
	}
	feed.Items = feedItems

	rssFeed := (&feeds.Rss{Feed: feed}).RssFeed()
	xmlRssFeeds := rssFeed.FeedXml()

	return xmlRssFeeds.(*feeds.RssFeedXml)
}
