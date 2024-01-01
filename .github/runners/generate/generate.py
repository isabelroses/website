import json
import os
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

import pytz
import yaml
from feedgen.feed import FeedGenerator

if __name__ == "__main__":
    timezone = pytz.timezone("UTC")
    posts = []

    # Generate RSS feed
    fg = FeedGenerator()
    fg.id("https://isabelroses.com/rss")
    fg.title("Isabel Roses' blog")
    fg.link(href="https://isabelroses.com", rel="alternate")
    fg.description("Isabel Roses' blog")

    # Loop through all blog posts
    for b in os.listdir("public/posts"):
        if not b.endswith(".md"):
            continue

        # Read blog posts
        file = "public/posts/" + b
        with open(file, "r", encoding="utf-8") as f:
            yml, md = re.split("---+\n", f.read().strip())[1:]
            post = {"id": 0, **yaml.safe_load(yml), "file": file.replace("public/", "")}
            posts.append(post)
            post.setdefault("tags", [])

            # Convert image path
            if "title_image" in post and "/" not in post["title_image"]:
                post["title_image"] = "images/" + post["title_image"]

            # Generate url-name
            if "slug" not in post:
                post["slug"] = os.path.splitext(b)[0].replace(" ", "-")

            # If the date is not set then we want to set it to today
            if "date" not in post:
                post["date"] = datetime.today().strftime("%d/%m/%Y")

            # Ensure that non pinned posts have a pinned value of 0
            if "pinned" not in post:
                post["pinned"] = 0

            post["content"] = md.strip()

            # Process images
            post["content"] = re.sub(
                r"!\[\[\.\/(.*)\|(.*)\]\]",
                r'<figure><img src="{src}/posts/\1" /><caption>\2</caption></figure>',
                post["content"],
            )
            post["content"] = re.sub(
                r"!\[\[\.\/(.*)\]\]", r'<img src="{src}/posts/\1" />', post["content"]
            )

    # Sort posts by date, such that we have the newst posts first, so that when we loop through them we can give them an id based on their date
    posts.sort(key=lambda x: datetime.strptime(x["date"], "%d/%m/%Y"), reverse=False)

    for i, post in enumerate(posts):
        post["id"] = i + 1
        fe = fg.add_entry()
        url = f'https://isabelroses.com/posts/{post["slug"]}-{post["id"]}'
        fe.id(url)
        fe.title(post["title"])
        fe.link(href=url, rel="alternate")
        fe.description(post["content"])
        date = datetime.strptime(post["date"], "%d/%m/%Y").replace(tzinfo=timezone)
        fe.published(date)

    # Count tags
    tags = Counter([tag for post in posts for tag in post["tags"]])
    tags = list(tags.items())

    # Pins
    pins = [p for p in posts if p["pinned"] != 0]
    pins.sort(key=lambda x: x["pinned"])
    pins = [p["id"] for p in pins]

    # Convert to json
    json_text = (
        "{\n"
        f'  "tags": {json.dumps(tags, ensure_ascii=False)},\n'
        f'  "pins": {json.dumps(pins, ensure_ascii=False)},\n'
        '  "posts": [\n    '
        + ",\n    ".join(json.dumps(p, ensure_ascii=False) for p in posts)
        + "\n"
        "  ]\n"
        "}"
    )

    meta_path = Path("src/gen/metas.json")
    meta_path.parent.mkdir(exist_ok=True, parents=True)
    meta_path.write_text(json_text, "utf-8")

    # Generate the RSS feed as a string
    fg.rss_file("public/rss.xml")

    with open("public/isabelroses/README.md", "r", encoding="utf-8") as f:
        me_json_text = '{ "content": ' + json.dumps(f.read(), ensure_ascii=False) + " }"

    Path("src/gen/me.json").write_text(me_json_text, "utf-8")
