package lib

import (
	"time"

	"github.com/gorilla/feeds"
)

func setupFeed() *feeds.Feed {
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
			Title:       post.Title,
			Link:        &feeds.Link{Href: "https://isabelroses.com/blog/" + post.Slug},
			Description: string(post.Content),
			Created:     created,
		})
	}
	feed.Items = feedItems

	return feed
}

func RssFeed() *feeds.RssFeedXml {
	rssFeed := (&feeds.Rss{Feed: setupFeed()}).RssFeed()
	xmlRssFeeds := rssFeed.FeedXml()

	return xmlRssFeeds.(*feeds.RssFeedXml)
}

func AtomFeed() *feeds.AtomFeed {
	atomFeed := (&feeds.Atom{Feed: setupFeed()}).AtomFeed()
	xmlAtomFeeds := atomFeed.FeedXml()

	return xmlAtomFeeds.(*feeds.AtomFeed)
}
