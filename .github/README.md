# [isabelroses.com](https://isabelroses.com)

![SEO](seo.png)

## Development

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/isabelroses/website
cd website

# Install dependencies (rejoice, nix users)
nix develop # if you have nix installed, not a requirement

# Do you want to use just?
just run

# Otherwise you can run
sass -q --no-source-map --style=compressed styles/main.scss static/styles.css
# to build the css file
# then you can run
cargo run
# to start the server
```

### License

- All code is licensed under:
  [MIT](https://opensource.org/licenses/MIT)
- All blog posts are licensed under:
  [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
