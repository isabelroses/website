# [isabelroses.com](https://isabelroses.com)

![SEO](seo.png)

## Development

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/isabelroses/website
cd website

# Install dependencies (rejoice, nix users)
nix develop # if you have nix installed, not a requirement though
yarn install # needed for tailwindcss
go mod tidy

# you may need to recompile tailwindcss
yarn build
# but if you want tailwindcss to recompile on changes
yarn watch

# then you can run the server using air
air # you can get this using `go install github.com/cosmtrek/air@latest`
```

### License

- All code is licensed under:
  [GPLv3](https://www.gnu.org/licenses/gpl-3.0#license-text)
- All blog posts are licensed under:
  [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
