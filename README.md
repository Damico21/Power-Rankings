# Paz's Power Rankings

The official power rankings site for the Ligma League AFL Fantasy competition.

**Live site:** https://damico21.github.io/Power-Rankings/

It's a plain static site (HTML, CSS and JavaScript, no build step) hosted on GitHub Pages. Anything pushed to the main branch goes live within a minute or two.

## What's where

```
index.html                Home page: pick a season
2026.html / 2027.html     Season overview pages
rankings.html             2026 Draft Night rankings
opening-round.html        2026 Opening Round
round-1.html … round-11   2026 weekly rankings
grand-final.html          2026 Grand Final edition
rivalry-round.html        2026 season specials
best-moments.html
ppr-tunes.html
snakes-and-ladders.html
*-secret.html             Password "vault" pages (hidden from the nav)
404.html                  Shown for any link that doesn't exist

nav.js                    Header, season bar, Previous/Next buttons (every page)
ppr.css / ppr.js          Shared styles and scripts for home + season pages
PAGE_TEMPLATE.html        Starting point for any new page
favicon.ico

images/
  brand/                  PPR and Ligma League logos, home screen icon
  teams/                  Full-size team posters (used in photo popups)
  teams/cards/            Medium posters (home and season page grids)
  teams/thumbs/           Small avatars (ranking tables)
  features/               Weekly wraps, Grand Final art, Snakes & Ladders etc.
  moments/                Best Moments screenshots and photos
```

## Adding a new round

1. Copy `PAGE_TEMPLATE.html` (or the previous round's page) and rename it, e.g. `2027-round-1.html`.
2. Update the `<title>`, description and `og:` tags at the top.
3. Open `nav.js`, find the season's `rounds` list and add the page:
   ```js
   { label: 'Round 1', href: '2027-round-1.html' },
   ```
   Set `latestRound` to the same file so it gets the "Latest" tag.
4. Bump the version on every `<script src="nav.js?v=6">` tag (to `?v=7` and so on) so everyone's browser grabs the new menu straight away. A find-and-replace across all files does it.

The new round now appears in the Rounds dropdown and in the Previous/Next buttons on every page. Nothing else needs editing.

## Adding images

- Put them in the matching folder under `images/`.
- Use lowercase file names with hyphens and no spaces, e.g. `images/moments/round-3-trade.jpg`.
- Keep them small. Resize to about 1500px on the longest side and save as JPG (around 80% quality). https://squoosh.app does this for free in the browser. A phone screenshot straight off the camera roll is often 2 to 4MB; after resizing it's usually under 250KB.
- On a page, add `loading="lazy" decoding="async"` to each `<img>` so it only downloads when someone scrolls to it.
- For a new team, add three versions: `images/teams/<team>.jpg` (full), `images/teams/cards/<team>.jpg` (about 720px) and `images/teams/thumbs/<team>.jpg` (about 128px on the short side).

## Starting a new season

In `nav.js`, copy the 2027 block, change the year, overview page and status, and create the season's overview page. The new year tab appears in the top bar on every page automatically.

## Previewing locally

From this folder, run `python3 -m http.server` and open http://localhost:8000.
