package lib

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"sort"
	"strings"
	"time"

	"gopkg.in/yaml.v2"
)

func GetBlogPosts() []Post {
	var posts []Post

	files, err := os.ReadDir("./content/")
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range files {
		f, err := os.Open("./content/" + file.Name())
		if err != nil {
			log.Fatal(err)
		}
		defer f.Close()

		// Extract the frontmatter
		scanner := bufio.NewScanner(f)
		var metaString string
		isMeta := false
		for scanner.Scan() {
			line := scanner.Text()
			if strings.TrimSpace(line) == "---" {
				if isMeta {
					break
				} else {
					isMeta = true
					continue
				}
			}
			if isMeta {
				metaString += line + "\n"
			}
		}

		// Parse the blog meta
		meta := Post{}
		if err := yaml.Unmarshal([]byte(metaString), &meta); err != nil {
			log.Fatal(err)
		}

		meta.Href = fmt.Sprintf("%v-%v", strings.TrimSuffix(file.Name(), ".md"), meta.ID)

		posts = append(posts, meta)
	}

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
		post.ID = fmt.Sprint(i + 1)
		post.Href = fmt.Sprintf("%v%v", post.Href, post.ID)
		posts[i] = post
	}

	for i := 0; i < len(posts)/2; i++ {
		posts[i], posts[len(posts)-i-1] = posts[len(posts)-i-1], posts[i]
	}

	return posts
}
