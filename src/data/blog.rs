use atom_syndication::{
    ContentBuilder, EntryBuilder, FeedBuilder, LinkBuilder, PersonBuilder, TextBuilder,
};
use chrono::TimeZone;
use nom::{branch::permutation, IResult};
use rust_embed::{Embed, EmbeddedFile};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::error::Error;

const DATE_FORMAT: &str = "%d/%m/%Y";

#[derive(Embed)]
#[folder = "content/"]
#[include = "*.md"]
struct Content;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Post {
    title: String,
    date: String,
    description: String,
    slug: String,
    tags: Vec<String>,
    content: String,
    id: Option<usize>,
}

struct PostMeta {
    title: String,
    date: String,
    description: String,
    tags: Vec<String>,
}

impl Post {
    pub fn parse(input: &str) -> Result<Self, Box<dyn Error>> {
        let raw = input.split("---\n").collect::<Vec<&str>>();
        let raw_metadata = raw[1];
        let raw_content = raw[2];

        let meta = permutation((
            Self::parse_title,
            Self::parse_date,
            Self::parse_description,
            Self::parse_tags,
        ))(raw_metadata)
        .map(|(_, (title, date, description, tags))| PostMeta {
            title,
            date,
            description,
            tags,
        });

        let meta = match meta {
            Ok(meta) => meta,
            Err(e) => {
                eprintln!("{e:?}");
                return Err(Box::new(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    e.to_string(),
                )));
            }
        };

        let content = Self::parse_content(raw_content);

        match content {
            Ok(content) => {
                let ret = Self {
                    title: meta.title,
                    date: meta.date,
                    description: meta.description,
                    tags: meta.tags,
                    slug: String::new(),
                    content,
                    id: None,
                };

                Ok(ret)
            }
            Err(e) => {
                eprintln!("{e:?}");
                Err(Box::new(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    e.to_string(),
                )))
            }
        }
    }

    fn parse_field<'a>(input: &'a str, field: &'a str) -> IResult<&'a str, String> {
        let (input, _) = nom::bytes::complete::tag(field)(input)?;
        let (input, _) = nom::character::complete::multispace0(input)?;
        let (input, _) = nom::bytes::complete::tag(":")(input)?;
        let (input, _) = nom::character::complete::multispace0(input)?;
        let (input, value) = nom::character::complete::not_line_ending(input)?;
        let (input, _) = nom::character::complete::newline(input)?;
        Ok((input, value.to_string()))
    }

    fn parse_title(input: &str) -> IResult<&str, String> {
        Self::parse_field(input, "title")
    }

    fn parse_date(input: &str) -> IResult<&str, String> {
        Self::parse_field(input, "date")
    }

    fn parse_description(input: &str) -> IResult<&str, String> {
        Self::parse_field(input, "description")
    }

    fn parse_tags(input: &str) -> IResult<&str, Vec<String>> {
        let (input, _) = nom::bytes::complete::tag("tags")(input)?;
        let (input, _) = nom::character::complete::multispace0(input)?;
        let (input, _) = nom::bytes::complete::tag(":")(input)?;
        let (input, _) = nom::character::complete::multispace0(input)?;
        let (input, tags) = nom::multi::many0(nom::sequence::preceded(
            nom::sequence::pair(
                nom::character::complete::multispace0,
                nom::bytes::complete::tag("- "),
            ),
            nom::character::complete::not_line_ending,
        ))(input)?;
        let (input, _) = nom::character::complete::newline(input)?;
        Ok((input, tags.iter().map(|s| (*s).to_string()).collect()))
    }

    fn parse_content(input: &str) -> Result<String, markdown::message::Message> {
        markdown::to_html_with_options(input, &markdown::Options::gfm())
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Posts(Vec<Post>);

impl Posts {
    pub fn filter_by_tag(&self, tag: &str) -> Posts {
        let filtered_posts: Vec<Post> = self
            .0
            .iter()
            .filter(|p| p.tags.contains(&tag.to_string()))
            .cloned()
            .collect();
        Posts(filtered_posts)
    }

    pub fn get_post_by_slug(&self, slug: &str) -> Option<&Post> {
        let slugrev = slug.chars().rev();

        let mut id = Vec::new();
        for char in slugrev {
            if char == '-' {
                break;
            }

            id.push(char);
        }

        let id = id
            .iter()
            .rev()
            .collect::<String>()
            .parse::<usize>()
            .unwrap();

        self.0.iter().find(|p| p.id == Some(id))
    }

    pub fn to_rss(&self) -> String {
        let channel = FeedBuilder::default()
            .title("Isabel Roses")
            .id("https://isabelroses.com")
            .link(
                LinkBuilder::default()
                    .href("https://isabelroses.com")
                    .rel("self")
                    .build(),
            )
            .author(
                PersonBuilder::default()
                    .name("Isabel Roses")
                    .email("isabel@isabelroses.com".to_owned())
                    .uri("https://isabelroses.com".to_owned())
                    .build(),
            )
            .subtitle(
                TextBuilder::default()
                    .value("Isabel Roses' blog".to_owned())
                    .lang("en".to_owned())
                    .build(),
            )
            .updated({
                let latest_post = self.0.last().unwrap();
                parse_post_date(&latest_post.date)
            })
            .entries(
                self.0
                    .iter()
                    .map(|post| {
                        let url = format!("https://isabelroses.com/blog/{}", post.slug);
                        EntryBuilder::default()
                            .title(post.title.clone())
                            .link(LinkBuilder::default().href(&url).build())
                            .content(
                                ContentBuilder::default()
                                    .base("https://isabelroses.com".to_owned())
                                    .lang("en".to_owned())
                                    .value(post.content.clone())
                                    .content_type("html".to_owned())
                                    .build(),
                            )
                            .id(&url)
                            .updated(parse_post_date(&post.date))
                            .build()
                    })
                    .collect::<Vec<_>>(),
            )
            .build();

        channel.to_string()
    }
}

pub fn get_blog_posts() -> Result<Posts, Box<dyn Error>> {
    let mut posts = Vec::new();

    for file in Content::iter() {
        let content = Content::get(&file).unwrap();
        let post = create_post(&content, file.to_string())?;
        posts.push(post);
    }

    sort_by_date(&mut posts);

    for (i, post) in posts.iter_mut().rev().enumerate() {
        post.id = Some(i + 1);
        let slug = post.slug.trim_end_matches(".md");
        post.slug = format!("{}-{}", slug, post.id.unwrap());
    }

    Ok(Posts(posts))
}

fn create_post(file: &EmbeddedFile, slug: String) -> Result<Post, Box<dyn Error>> {
    let content = std::str::from_utf8(file.data.as_ref())?;
    let mut post = Post::parse(content).map_err(|e| format!("{e:?}"))?;
    post.slug = slug;
    Ok(post)
}

pub fn get_all_blog_tags() -> Result<Vec<String>, Box<dyn Error>> {
    let posts = get_blog_posts()?;
    let mut tags = HashSet::new();

    for post in posts.0 {
        for tag in post.tags {
            tags.insert(tag);
        }
    }

    let tags = tags.into_iter().collect();

    Ok(tags)
}

fn sort_by_date(posts: &mut [Post]) {
    posts.sort_by(|a, b| {
        chrono::NaiveDate::parse_from_str(&b.date, DATE_FORMAT)
            .unwrap()
            .cmp(&chrono::NaiveDate::parse_from_str(&a.date, DATE_FORMAT).unwrap())
    });
}

fn parse_post_date(date: &str) -> chrono::DateTime<chrono::FixedOffset> {
    let time = chrono::NaiveDate::parse_from_str(date, DATE_FORMAT)
        .unwrap()
        .and_hms_opt(0, 0, 0)
        .unwrap();

    let offset = chrono::FixedOffset::east_opt(0).unwrap();
    offset.from_local_datetime(&time).single().unwrap()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_post() {
        let input = include_str!("./test.md");

        let post = Post::parse(input).unwrap();

        assert_eq!(post.title, "Hello, World!");
        assert_eq!(post.date, "02/01/2024");
        assert_eq!(post.description, "This is a test post");
        assert_eq!(post.tags, vec!["test", "post"]);
        assert_eq!(
            post.content,
            "<h1>Hello, World!</h1>\n<p>This is a test post.</p>\n"
        );
    }

    #[test]
    fn test_filter_by_tag() {
        let posts = Posts(vec![
            Post {
                title: "Hello, World!".to_string(),
                date: "02/01/2024".to_string(),
                description: "This is a test post".to_string(),
                slug: "hello-world".to_string(),
                tags: vec!["test".to_string(), "post".to_string()],
                content: "<h1>Hello, World!</h1>\n<p>This is a test post.</p>\n".to_string(),
                id: Some(1),
            },
            Post {
                title: "Hello, World!".to_string(),
                date: "02/01/2024".to_string(),
                description: "This is a test post".to_string(),
                slug: "hello-world".to_string(),
                tags: vec!["post".to_string()],
                content: "<h1>Hello, World!</h1>\n<p>This is a test post.</p>\n".to_string(),
                id: Some(2),
            },
        ]);

        let filtered_posts = posts.filter_by_tag("test");

        assert_eq!(filtered_posts.0.len(), 1);
    }

    #[test]
    fn test_get_post_by_full_slug() {
        let posts = Posts(vec![
            Post {
                title: "Hello, World!".to_string(),
                date: "02/01/2024".to_string(),
                description: "This is a test post".to_string(),
                slug: "hello-world-1".to_string(),
                tags: vec!["test".to_string(), "post".to_string()],
                content: "<h1>Hello, World!</h1>\n<p>This is a test post.</p>\n".to_string(),
                id: Some(1),
            },
            Post {
                title: "Hello, World!".to_string(),
                date: "02/01/2024".to_string(),
                description: "This is a test post".to_string(),
                slug: "hello-world-2".to_string(),
                tags: vec!["post".to_string()],
                content: "<h1>Hello, World!</h1>\n<p>This is a test post.</p>\n".to_string(),
                id: Some(2),
            },
        ]);

        let post = posts.get_post_by_slug("hello-world-1").unwrap();

        assert_eq!(post.id, Some(1));
    }

    #[test]
    fn test_get_post_by_partial_slug() {
        let posts = Posts(vec![
            Post {
                title: "Hello, World!".to_string(),
                date: "2021-08-01".to_string(),
                description: "This is a test post".to_string(),
                slug: "hello-world-1".to_string(),
                tags: vec!["test".to_string(), "post".to_string()],
                content: "<h1>Hello, World!</h1>\n<p>This is a test post.</p>\n".to_string(),
                id: Some(1),
            },
            Post {
                title: "Hello, World!".to_string(),
                date: "02/01/2024".to_string(),
                description: "This is a test post".to_string(),
                slug: "hello-world-2".to_string(),
                tags: vec!["post".to_string()],
                content: "<h1>Hello, World!</h1>\n<p>This is a test post.</p>\n".to_string(),
                id: Some(2),
            },
        ]);

        let post = posts.get_post_by_slug("-1").unwrap();

        assert_eq!(post.id, Some(1));
    }

    #[test]
    fn test_sort_posts_by_date() {
        let mut posts = vec![
            Post {
                title: "Hello, World!".to_string(),
                date: "02/01/2023".to_string(),
                description: "This is a test post".to_string(),
                slug: "hello-world-1".to_string(),
                tags: vec!["test".to_string(), "post".to_string()],
                content: "<h1>Hello, World!</h1>\n<p>This is a test post.</p>\n".to_string(),
                id: Some(1),
            },
            Post {
                title: "Hello, World!".to_string(),
                date: "02/01/2024".to_string(),
                description: "This is a test post".to_string(),
                slug: "hello-world-2".to_string(),
                tags: vec!["post".to_string()],
                content: "<h1>Hello, World!</h1>\n<p>This is a test post.</p>\n".to_string(),
                id: Some(2),
            },
            Post {
                title: "Hello, World!".to_string(),
                date: "02/03/2024".to_string(),
                description: "This is a test post".to_string(),
                slug: "hello-world-2".to_string(),
                tags: vec!["post".to_string()],
                content: "<h1>Hello, World!</h1>\n<p>This is a test post.</p>\n".to_string(),
                id: Some(3),
            },
            Post {
                title: "Hello, World!".to_string(),
                date: "01/03/2024".to_string(),
                description: "This is a test post".to_string(),
                slug: "hello-world-2".to_string(),
                tags: vec!["post".to_string()],
                content: "<h1>Hello, World!</h1>\n<p>This is a test post.</p>\n".to_string(),
                id: Some(4),
            },
        ];

        sort_by_date(&mut posts);

        assert_eq!(posts[0].date, "02/03/2024");
        assert_eq!(posts[1].date, "01/03/2024");
        assert_eq!(posts[2].date, "02/01/2024");
        assert_eq!(posts[3].date, "02/01/2023");
    }

    #[test]
    fn test_parse_post_date() {
        let date = "02/01/2024";
        let parsed = parse_post_date(date);

        assert_eq!(parsed.to_rfc2822(), "Tue, 2 Jan 2024 00:00:00 +0000");
    }
}
