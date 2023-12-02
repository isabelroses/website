import json, yaml, os, re
from collections import Counter
from datetime import datetime
from pathlib import Path

if __name__ == '__main__':
    posts = []

    # Loop through all blog posts
    for b in os.listdir('public/posts'):
        if not b.endswith('.md'):
            continue

        # Read blog posts
        file = 'public/posts/' + b
        with open(file, 'r', encoding='utf-8') as f:
            yml, md = re.split('---+\n', f.read().strip())[1:]
            post = {'id': 0, **yaml.safe_load(yml), 'file': file.replace('public/', '')}
            posts.append(post)
            post.setdefault('tags', [])

            # Convert image path
            if 'title_image' in post and '/' not in post['title_image']:
                post['title_image'] = 'images/' + post['title_image']

            # Generate url-name
            if 'slug' not in post:
                post['slug'] = os.path.splitext(b)[0].replace(' ', '-')

            # If the date is not set then we want to set it to today
            if 'date' not in post:
                post['date'] = datetime.today().strftime("%d/%m/%Y")

            # Ensure that non pinned posts have a pinned value of 0
            if 'pinned' not in post:
                post['pinned'] = 0

            post['content'] = md.strip()

            # Process images
            post['content'] = re.sub(r'!\[\[\.\/(.*)\|(.*)\]\]', r'<figure><img src="{src}/posts/\1" /><caption>\2</caption></figure>', post['content'])
            post['content'] = re.sub(r'!\[\[\.\/(.*)\]\]', r'<img src="{src}/posts/\1" />', post['content'])

    posts.sort(key=lambda x: x['date'], reverse=True)

    # Give every post an id based on index
    for i, post in enumerate(posts):
        post['id'] = len(posts) - i

    # Count tags
    tags = Counter([tag for post in posts for tag in post['tags']])
    tags = list(tags.items())

    # Pins
    pins = [p for p in posts if 'pinned' in p]
    pins.sort(key=lambda x: x['pinned'])
    pins = [p['id'] for p in pins]

    # Convert to json
    json_text = '{\n' \
                f'  "tags": {json.dumps(tags, ensure_ascii=False)},\n' \
                f'  "pins": {json.dumps(pins, ensure_ascii=False)},\n' \
                '  "posts": [\n    ' \
                + ',\n    '.join(json.dumps(p, ensure_ascii=False) for p in posts) + '\n' \
                '  ]\n' \
                '}'

    meta_path = Path('src/gen/metas.json')
    meta_path.parent.mkdir(exist_ok=True, parents=True)
    meta_path.write_text(json_text, 'utf-8')