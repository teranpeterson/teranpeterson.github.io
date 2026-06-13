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
| `_data/skills.yml`        | Skills shown on the portfolio page.                     |
| `_data/projects.yml`      | Project tiles on the portfolio page.                    |
| `_data/timeline.yml`      | Career / education timeline on the portfolio page.      |
| `_pages/`                 | Top-level standalone pages (about, portfolio).          |
| `_posts/`                 | Blog posts. File name pattern: `YYYY-MM-DD-title.md`.   |
| `_layouts/`               | Page templates.                                         |
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

GitHub Pages auto-builds the site from `master` using its own pinned Jekyll
version, so the `Gemfile` is only used for local development.
