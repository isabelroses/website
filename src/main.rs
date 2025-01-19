use axum::{
    extract::Path,
    http::header,
    response::{Html, Redirect},
    routing::{get, post},
    Router,
};
use dotenv::dotenv;
use std::{env, net::SocketAddr, sync::Arc};
use tera::Context;

mod api;
mod data;
mod static_files;
mod templates;

use crate::templates::TEMPLATES;

#[allow(clippy::too_many_lines)]
#[tokio::main]
async fn main() {
    dotenv().ok();
    let port = env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse()
        .unwrap();
    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    println!("listening on {addr}");
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    let projects = {
        let mut ctx = tera::Context::new();
        ctx.insert("projects", &data::projects::PROJECTS);
        render("projects", &ctx)
    };

    let posts = Arc::new(if let Ok(posts) = data::blog::get_blog_posts() {
        posts
    } else {
        eprintln!("Error: Could not load blog posts");
        return;
    });

    let tags = match data::blog::get_all_blog_tags() {
        Ok(tags) => tags,
        Err(e) => {
            eprintln!("Error: {e:?}");
            return;
        }
    };

    let api_routes = Router::new()
        .route("/github", post(api::github::handler))
        .route("/kofi", post(api::kofi::handler))
        .fallback(get(api::fallback));

    let app = Router::new()
        .route("/", get(render("home", &tera::Context::new())))
        .route("/projects", get(projects))
        .route(
            "/badges",
            get({
                let mut ctx = tera::Context::new();
                ctx.insert("badges", &data::badges::BADGES);
                ctx.insert("friends", &data::badges::FRIENDS);
                render("badges", &ctx)
            }),
        )
        .route(
            "/donations",
            get(match data::donos::get() {
                Ok(donos) => {
                    let mut ctx = tera::Context::new();
                    ctx.insert("donors", &donos);
                    render("donos", &ctx)
                }
                Err(_) => Html("Error".to_string()),
            }),
        )
        .route(
            "/blog",
            get({
                let posts = Arc::clone(&posts);
                let ctx = make_blog_ctx(&posts, &tags, "all");
                render("blog", &ctx)
            }),
        )
        .route(
            "/blog/tag/{current_tag}",
            get({
                let posts = Arc::clone(&posts);

                |Path(current_tag): Path<String>| async move {
                    let filtered_posts = posts.filter_by_tag(&current_tag);
                    let ctx = make_blog_ctx(&filtered_posts, &tags, &current_tag);
                    render("blog", &ctx)
                }
            }),
        )
        .route(
            "/blog/{slug}",
            get({
                let posts = Arc::clone(&posts);

                |Path(slug): Path<String>| async move {
                    let Some(post) = posts.get_post_by_slug(&slug) else {
                        return Html("404".to_string());
                    };
                    let mut ctx = tera::Context::new();
                    ctx.insert("post", &post);
                    render("post", &ctx)
                }
            }),
        )
        .route(
            "/error",
            get({
                let mut ctx = tera::Context::new();
                ctx.insert("code", "404");
                render("error", &ctx)
            }),
        )
        .route(
            "/feed.xml",
            get({
                let posts = Arc::clone(&posts);

                || async move {
                    let rss = posts.to_rss();
                    ([(header::CONTENT_TYPE, "application/xml")], rss)
                }
            }),
        )
        .nest("/api", api_routes)
        .route("/static/{*file}", get(static_files::handler))
        .route(
            "/robots.txt",
            get((
                [(header::CONTENT_TYPE, "text/plain")],
                include_str!("../static/robots.txt"),
            )),
        )
        .fallback(get(Redirect::temporary("/error")));

    axum::serve(listener, app).await.unwrap();
}

fn render(page: &str, ctx: &Context) -> Html<String> {
    let render = format!("pages/{page}.tera");

    let rendered = TEMPLATES.render(&render, ctx).unwrap();

    Html(rendered)
}

fn make_blog_ctx(posts: &data::blog::Posts, tags: &[String], current_tag: &str) -> Context {
    let mut ctx = tera::Context::new();
    ctx.insert("posts", &posts);
    ctx.insert("tags", &tags);
    ctx.insert("current_tag", current_tag);
    ctx
}
