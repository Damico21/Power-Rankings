# PPR Nav Migration Guide
## How to update every existing page to use nav.js v3

---

### What nav.js does automatically
- Injects the full sticky desktop nav with Rounds dropdown
- Injects the mobile hamburger + full-screen overlay menu
- Highlights the active page (matched by filename — zero config needed)
- Removes any legacy `<nav>` or `.divider` elements it finds on the page
- Handles all open/close logic for dropdown and mobile menu

---

### For EACH existing page (round-1.html, rankings.html, etc.)

Do these four things:

#### 1. Remove the hardcoded `<nav>` block from the HTML body
Delete anything that looks like this from between `<body>` and your first section:
```html
<nav id="ppr-nav">
  ...logo, links, hamburger button...
</nav>
```
Also delete any `<div class="divider"></div>` that sits immediately after the nav.

#### 2. Remove nav-related CSS from the `<style>` block
Delete these CSS rules from the page's `<style>` tag (nav.js injects its own):
```css
nav { ... }
.nav-logo { ... }
.nav-links { ... }
.nav-hamburger { ... }
.nav-hamburger span { ... }
/* and any @media blocks that contain nav-specific rules */
```

#### 3. Remove the hamburger JavaScript
Delete any `<script>` block that contains:
```js
const navToggle = document.getElementById('navToggle');
// or navLinks.classList.toggle / body.style.overflow etc.
```

#### 4. Add nav.js as the last script before `</body>`
```html
  <script src="nav.js"></script>
</body>
</html>
```

---

### Page-by-page reference

| Page file              | Notes                                              |
|------------------------|----------------------------------------------------|
| `index.html`           | ✅ Already updated — nav.js wired in               |
| `rankings.html`        | Apply 4 steps above                               |
| `opening-round.html`   | Apply 4 steps above                               |
| `round-1.html`         | Apply 4 steps above                               |
| `round-2.html`         | Apply 4 steps above                               |
| `round-3.html`         | Apply 4 steps above                               |
| `round-4.html`         | Apply 4 steps above                               |
| `round-5.html`         | Apply 4 steps above                               |
| `round-6.html`         | Apply 4 steps above                               |
| `round-7.html`         | Apply 4 steps above (reference design)            |
| `rivalry-round.html`   | Apply 4 steps above                               |
| `best-moments.html`    | Apply 4 steps above                               |
| `ppr-tunes.html`       | Apply 4 steps above                               |
| `snakes-and-ladders.html` | Apply 4 steps above                            |

---

### Adding Round 8 (and beyond)

1. Open `nav.js`
2. Find the `rounds` array
3. Uncomment (or add) the new round:
   ```js
   { label: 'Round 8', href: 'round-8.html' },
   ```
4. Save. Every page on the site now shows Round 8 in the dropdown. Done.

---

### CSS conflict checklist
If you see a double nav or weird spacing after migrating a page, check:
- Is there still a `<nav>` tag in the page HTML? → Delete it
- Is there still nav CSS in the `<style>` block? → Delete it
- Is `<script src="nav.js"></script>` at the BOTTOM of `<body>`? → Move it there
- Is `nav.js` in the same folder as the HTML files? → It must be

---

### Link reference (current)

| Label              | href                      |
|--------------------|---------------------------|
| Home               | index.html                |
| Draft Night        | rankings.html             |
| Opening Round      | opening-round.html        |
| Round 1–7          | round-1.html … round-7.html |
| ⚔️ Rivalry Round  | rivalry-round.html        |
| 📸 Best Moments    | best-moments.html         |
| 🎵 PPR Tunes       | ppr-tunes.html            |
| 🐍 Snakes & Ladders| snakes-and-ladders.html   |
