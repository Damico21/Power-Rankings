/**

- PPR Shared Navigation — nav.js v2
- ================================
- To add a new round: add one entry to the ROUNDS array below.
- Every page updates automatically. No other files need touching.
- 
- To add a new round (e.g. Round 5):
- { label: ‘Round 5’, href: ‘round-5.html’ }
  */

const PPR_NAV = {

// ── ROUNDS DROPDOWN ─────────────────────────────────────────────────────
// Add new rounds here. That’s the only change you ever need to make.
rounds: [
{ label: ‘Round 1’, href: ‘round-1.html’ },
{ label: ‘Round 2’, href: ‘round-2.html’ },
{ label: ‘Round 3’, href: ‘round-3.html’ },
{ label: ‘Round 4’, href: ‘round-4.html’ },
{ label: ‘Round 5’, href: ‘round-5.html’ },
// { label: ‘Round 6’, href: ‘round-6.html’ }, ← uncomment when ready
],

// ── STATIC NAV ITEMS (before and after the dropdown) ────────────────────
before: [
{ label: ‘Home’,          href: ‘index.html’ },
{ label: ‘Draft Night’,   href: ‘rankings.html’ },
{ label: ‘Opening Round’, href: ‘opening-round.html’ },
],

after: [
{ label: ‘⚔️ Rivalry Round’,       href: ‘rivalry-round.html’ },
{ label: ‘📸 2026 Moments’,         href: ‘best-moments.html’ },
{ label: ‘🎵 PPR Tunes’,            href: ‘ppr-tunes.html’ },
{ label: ‘🐍 Snakes & Ladders’, href: ‘snakes-and-ladders.html’ },
],

};

// ── CSS ──────────────────────────────────────────────────────────────────
(function injectNavStyles() {
const style = document.createElement(‘style’);
style.id = ‘ppr-nav-styles’;
style.textContent = `
:root {
–ppr-red: #8b1a1a;
–ppr-gold: #c8a951;
–ppr-dark: #0d1117;
–ppr-mid: #141d27;
–ppr-muted: #6a8aaa;
–ppr-border: rgba(255,255,255,0.06);
}

```
#ppr-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2.5rem;
  background: rgba(13,17,23,0.97);
  border-bottom: 2px solid var(--ppr-red);
  position: sticky;
  top: 0;
  z-index: 200;
  backdrop-filter: blur(12px);
  height: 58px;
}

#ppr-nav .ppr-logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.8rem;
  color: var(--ppr-gold);
  text-decoration: none;
  letter-spacing: 3px;
  flex-shrink: 0;
}

#ppr-nav .ppr-links {
  display: flex;
  gap: 0;
  list-style: none;
  align-items: center;
}

#ppr-nav .ppr-links > li {
  position: relative;
}

#ppr-nav .ppr-links a {
  color: #7a9ab5;
  text-decoration: none;
  font-family: 'Oswald', sans-serif;
  font-size: 0.8rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 0 1rem;
  height: 58px;
  display: flex;
  align-items: center;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
}

#ppr-nav .ppr-links a:hover { color: #fff; }
#ppr-nav .ppr-links a.active { color: var(--ppr-gold); border-bottom-color: var(--ppr-gold); }

/* ── Dropdown button ── */
#ppr-nav .ppr-dropdown-btn {
  color: #7a9ab5;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Oswald', sans-serif;
  font-size: 0.8rem;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 0 1rem;
  height: 58px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border-bottom: 2px solid transparent;
  transition: color 0.2s, border-color 0.2s;
  white-space: nowrap;
}

#ppr-nav .ppr-dropdown-btn:hover,
#ppr-nav .ppr-dropdown-btn.open { color: #fff; }

#ppr-nav .ppr-dropdown-btn.active-parent {
  color: var(--ppr-gold);
  border-bottom-color: var(--ppr-gold);
}

#ppr-nav .ppr-dropdown-btn .chevron {
  font-size: 0.55rem;
  transition: transform 0.2s;
  display: inline-block;
  margin-top: 1px;
}

#ppr-nav .ppr-dropdown-btn.open .chevron { transform: rotate(180deg); }

/* ── Dropdown menu ── */
#ppr-nav .ppr-dropdown-menu {
  display: none;
  position: absolute;
  top: 58px;
  left: 0;
  background: rgba(13,17,23,0.98);
  border: 1px solid var(--ppr-border);
  border-top: 2px solid var(--ppr-gold);
  border-radius: 0 0 10px 10px;
  min-width: 155px;
  z-index: 300;
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.5);
  padding: 0.4rem 0;
}

#ppr-nav .ppr-dropdown-menu.open { display: block; }

#ppr-nav .ppr-dropdown-menu a {
  height: auto;
  padding: 0.65rem 1.2rem;
  display: block;
  border-bottom: none;
  font-size: 0.78rem;
  color: #7a9ab5;
}

#ppr-nav .ppr-dropdown-menu a:hover { color: #fff; background: rgba(255,255,255,0.04); }
#ppr-nav .ppr-dropdown-menu a.active { color: var(--ppr-gold); }

/* ── Divider bar below nav ── */
#ppr-nav-divider {
  height: 3px;
  background: linear-gradient(90deg, var(--ppr-red) 0%, var(--ppr-gold) 50%, var(--ppr-red) 100%);
}

@media (max-width: 900px) {
  #ppr-nav { padding: 0 1rem; }
  #ppr-nav .ppr-links a,
  #ppr-nav .ppr-dropdown-btn { font-size: 0.72rem; padding: 0 0.6rem; }
}

@media (max-width: 640px) {
  #ppr-nav .ppr-links a,
  #ppr-nav .ppr-dropdown-btn { font-size: 0.68rem; padding: 0 0.45rem; letter-spacing: 1px; }
}
```

`;
document.head.appendChild(style);
})();

// ── BUILD & INJECT ────────────────────────────────────────────────────────
(function buildNav() {
const currentPage = window.location.pathname.split(’/’).pop() || ‘index.html’;

// Determine if we’re on a round page
const roundHrefs = PPR_NAV.rounds.map(r => r.href);
const onRoundPage = roundHrefs.includes(currentPage);

function makeLink(item) {
const isActive = item.href === currentPage;
return `<li><a href="${item.href}"${isActive ? ' class="active"' : ''}>${item.label}</a></li>`;
}

// Before-dropdown links
const beforeHTML = PPR_NAV.before.map(makeLink).join(’’);

// Rounds dropdown
const dropdownItems = PPR_NAV.rounds.map(r => {
const isActive = r.href === currentPage;
return `<a href="${r.href}"${isActive ? ' class="active"' : ''}>${r.label}</a>`;
}).join(’’);

const dropdownHTML = ` <li> <button class="ppr-dropdown-btn${onRoundPage ? ' active-parent' : ''}" id="ppr-rounds-btn" onclick="PPR_NAV._toggle()" aria-expanded="false" aria-haspopup="true" >Rounds <span class="chevron">▼</span></button> <div class="ppr-dropdown-menu" id="ppr-rounds-menu"> ${dropdownItems} </div> </li>`;

// After-dropdown links
const afterHTML = PPR_NAV.after.map(makeLink).join(’’);

// Nav element
const nav = document.createElement(‘nav’);
nav.id = ‘ppr-nav’;
nav.innerHTML = ` <a class="ppr-logo" href="index.html">PPR</a> <ul class="ppr-links"> ${beforeHTML} ${dropdownHTML} ${afterHTML} </ul>`;

// Divider
const divider = document.createElement(‘div’);
divider.id = ‘ppr-nav-divider’;

// Insert at top of body
document.body.insertBefore(divider, document.body.firstChild);
document.body.insertBefore(nav, divider);

// Remove any old hardcoded nav/divider that pages may still have
document.querySelectorAll(‘nav:not(#ppr-nav), .divider:not(#ppr-nav-divider)’).forEach(el => el.remove());
})();

// ── DROPDOWN TOGGLE ───────────────────────────────────────────────────────
PPR_NAV._toggle = function() {
const btn  = document.getElementById(‘ppr-rounds-btn’);
const menu = document.getElementById(‘ppr-rounds-menu’);
if (!btn || !menu) return;
const isOpen = menu.classList.contains(‘open’);
menu.classList.toggle(‘open’, !isOpen);
btn.classList.toggle(‘open’, !isOpen);
btn.setAttribute(‘aria-expanded’, String(!isOpen));
};

// Close on outside click
document.addEventListener(‘click’, function(e) {
const btn  = document.getElementById(‘ppr-rounds-btn’);
const menu = document.getElementById(‘ppr-rounds-menu’);
if (!btn || !menu) return;
if (!btn.contains(e.target) && !menu.contains(e.target)) {
menu.classList.remove(‘open’);
btn.classList.remove(‘open’);
btn.setAttribute(‘aria-expanded’, ‘false’);
}
});

// Close on Escape
document.addEventListener(‘keydown’, function(e) {
if (e.key === ‘Escape’) {
const btn  = document.getElementById(‘ppr-rounds-btn’);
const menu = document.getElementById(‘ppr-rounds-menu’);
if (menu) menu.classList.remove(‘open’);
if (btn)  { btn.classList.remove(‘open’); btn.setAttribute(‘aria-expanded’, ‘false’); }
}
});