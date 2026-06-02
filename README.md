# Kidus Workneh — Personal Website

A clean, dependency-free personal/academic site. Plain HTML + CSS + a little
JavaScript. No build step, no framework, no theme.

```
index.html      Home — About + Publications + Experience + Skills + Service
research.html   Research — research areas + venues
blog.html       Blog — list of posts
posts/          one HTML file per blog post (e.g. welcome.html)
style.css       styling + light/dark themes (CSS variables)
script.js       theme toggle (persisted) + profile-photo fallback
hero-bg.js      one-shot "compiler pipeline" hero animation
assets/         images (drop profile.jpg here)
```

Pages share the same nav/footer markup (it's copied into each file). If you edit
the nav, update it in `index.html`, `research.html`, `blog.html`, and `posts/*.html`.

## Add a blog post

1. Copy `posts/welcome.html` to `posts/your-post.html` and edit the title, date, and body.
2. Add a `<li class="post-item">…</li>` entry at the top of the list in `blog.html`
   pointing to your new file (newest first).

## View it

Just open `index.html` in a browser. Or run any static server:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## Edit

- **Text / sections:** edit `index.html` directly.
- **Colors / spacing / fonts:** edit the CSS variables at the top of `style.css`
  (`:root` is light theme, `[data-theme="dark"]` is dark). The hero is always dark.
- **Hero animation feel:** tweak `INTRO`, `FADE`, `REST` near the top of `hero-bg.js`
  (`REST: 0` makes it fade away completely instead of leaving a faint backdrop).

## Add your photo

Drop a square image at `assets/profile.jpg`. Until then, a circular "KW" monogram
is shown automatically.

## Themes

A sun/moon button in the nav toggles light/dark; the choice is saved in
`localStorage`. With no saved choice, the site follows the OS preference.

## Deploy

It's static — host the folder anywhere: GitHub Pages, Netlify, Cloudflare Pages,
or any web server. (`_old_static_site/` is the previous version; safe to delete.)
