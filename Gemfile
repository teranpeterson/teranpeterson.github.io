source "https://rubygems.org"

# GitHub Pages auto-builds this site with its pinned Jekyll version, so this
# Gemfile is primarily for local development. The minimum versions below pull
# in security fixes (rexml CVE-2024-39908 / kramdown 2.4 etc.).
gem "jekyll", "~> 4.3"
gem "jekyll-paginate"
gem "jekyll-seo-tag", "~> 2.8"
gem "jekyll-sitemap", "~> 1.4"
gem "kramdown", ">= 2.4.0"
gem "rexml", ">= 3.3.9"

group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"
  gem "jekyll-archives", "~> 2.3"
end

# Lock `http_parser.rb` on Apple Silicon (older versions fail to build on M-series Macs).
gem "http_parser.rb", "~> 0.8.0"

install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :install_if => Gem.win_platform?
