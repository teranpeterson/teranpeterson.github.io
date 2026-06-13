# teranpeterson.com

My personal website, built with [Jekyll](https://jekyllrb.com/) on a modified
[Tale](https://github.com/chesterhow/tale) theme. Deployed by GitHub Pages
from the `master` branch.

## Local development

Requires Ruby 3.x (Jekyll 4 no longer supports Ruby 2.x). With
[`rbenv`](https://github.com/rbenv/rbenv) or similar:

```bash
rbenv install 3.4.5
rbenv local 3.4.5
gem install bundler
bundle install
bundle exec jekyll serve --livereload
```

The site will be served at <http://localhost:4000>.

To produce a production build into `_site/`:

```bash
JEKYLL_ENV=production bundle exec jekyll build
```

## Project structure

| Path                      | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| `_config.yml`             | Site-wide settings (title, author, plugins, analytics). |
| `_data/projects.yml`      | Project cards shown on the Projects page.               |
| `_pages/`                 | Top-level standalone pages (about, projects).           |
| `_posts/`                 | Blog posts. File name pattern: `YYYY-MM-DD-title.md`.   |
| `_layouts/`               | Page templates (incl. `tag.html` for tag archives).     |
| `_includes/`              | Reusable HTML partials (head, nav, footer, analytics).  |
| `_sass/dark-tale/`        | Theme styles.                                           |
| `assets/`                 | Static assets (images, fonts, resume PDF).              |

## Analytics

The site supports Google Analytics 4 (`G-XXXXXXXXXX`). Set
`google_analytics` in `_config.yml` to enable; leave it blank to disable.
Analytics only fires when `JEKYLL_ENV=production`.

The original Universal Analytics property (`UA-`) was sunset by Google in
July 2023 and has been removed.

## Deployment

The site is built and deployed by GitHub Actions (see
`.github/workflows/jekyll.yml`) on every push to `master`, using the Ruby
gems pinned in this repo's `Gemfile`/`Gemfile.lock`. This is what allows the
site to use Jekyll 4, Dart Sass (`@use`), and plugins like `jekyll-archives`
that the classic GitHub Pages build does not support. The **Pages → Source**
setting must be set to **GitHub Actions**.

## Tags

Blog posts can declare a `tags:` list in their front matter.
`jekyll-archives` generates an archive page per tag at `/tags/:name/`
(rendered with `_layouts/tag.html`). Tag chips on posts and the blog index
link to these pages, and the blog index has a "Browse by tag" bar.
