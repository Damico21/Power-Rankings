/**
 * PPR Shared Navigation (nav.js v5, season edition)
 * ==================================================
 * Single source of truth for the header on every page of the site.
 *
 * The header has two tiers:
 *   1. The main bar:   PPR | Home | 2026 | 2027
 *   2. The season bar: shown on any page that belongs to a season
 *                      (Overview, Draft Night, Rounds, Grand Final, extras)
 *
 * A page belongs to a season if its filename appears anywhere in that
 * season's config below (including the `hidden` list). Nothing needs to
 * change inside the individual round pages.
 *
 * ── ADDING A 2027 PAGE ────────────────────────────────────────────────
 *   1. Create the page (copy PAGE_TEMPLATE.html), e.g. 2027-round-1.html
 *   2. Add it to the 2027 `rounds` array below:
 *        { label: 'Round 1', href: '2027-round-1.html' },
 *   3. For Draft Night / Grand Final, replace `href: null` with the file.
 *      Items with `href: null` show as "Soon" and are not clickable.
 *
 * ── ADDING A WHOLE NEW SEASON (e.g. 2028) ─────────────────────────────
 *   Copy the 2027 block, change the year, overview file and status.
 *   The new year tab appears in the main bar automatically.
 */

const PPR_NAV = {

  home: { label: 'Home', href: 'index.html' },

  seasons: [
    {
      year: '2026',
      overview: '2026.html',
      status: 'Complete',
      accent: 'gold',
      latestRound: 'round-11.html',
      before: [
        { label: 'Overview',    href: '2026.html'     },
        { label: 'Draft Night', href: 'rankings.html' },
      ],
      rounds: [
        { label: 'Opening Round', href: 'opening-round.html' },
        { label: 'Round 1',       href: 'round-1.html'       },
        { label: 'Round 2',       href: 'round-2.html'       },
        { label: 'Round 3',       href: 'round-3.html'       },
        { label: 'Round 4',       href: 'round-4.html'       },
        { label: 'Round 5',       href: 'round-5.html'       },
        { label: 'Round 6',       href: 'round-6.html'       },
        { label: 'Round 7',       href: 'round-7.html'       },
        { label: 'Round 8',       href: 'round-8.html'       },
        { label: 'Round 9',       href: 'round-9.html'       },
        { label: 'Round 10',      href: 'round-10.html'      },
        { label: 'Round 11',      href: 'round-11.html'      },
      ],
      after: [
        { label: '🏆 Grand Final',          href: 'grand-final.html', cls: 'ppr-gf' },
        { label: '⚔️ Rivalry Round',       href: 'rivalry-round.html'      },
        { label: '📸 Best Moments',         href: 'best-moments.html'       },
        { label: '🎵 PPR Tunes',            href: 'ppr-tunes.html'          },
        { label: '🐍 Snakes &amp; Ladders', href: 'snakes-and-ladders.html' },
      ],
      // Pages that belong to 2026 but are not listed in the bar
      hidden: [
        'dark-magicians-secret.html',
        'dc-taxpayers-secret.html',
        'holmes-gardens-secret.html',
      ],
    },
    {
      year: '2027',
      overview: '2027.html',
      status: 'Coming soon',
      accent: 'ice',
      latestRound: null,
      before: [
        { label: 'Overview',    href: '2027.html' },
        { label: 'Draft Night', href: null        },
      ],
      rounds: [
        // { label: 'Opening Round', href: '2027-opening-round.html' },
        // { label: 'Round 1',       href: '2027-round-1.html'       },
      ],
      after: [
        { label: '🏆 Grand Final',          href: null, cls: 'ppr-gf' },
        { label: '🐍 Snakes &amp; Ladders', href: null },   // e.g. '2027-snakes-and-ladders.html'
        { label: '📸 Best Moments',         href: null },   // e.g. '2027-best-moments.html'
        { label: '🎵 PPR Tunes',            href: null },   // e.g. '2027-ppr-tunes.html'
      ],
      hidden: [],
    },
  ],

};

// ═════════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════════
(function injectNavStyles() {
  if (document.getElementById('ppr-nav-styles')) return;
  const style = document.createElement('style');
  style.id = 'ppr-nav-styles';
  style.textContent = `
    #ppr-header, #ppr-header *, #ppr-header *::before, #ppr-header *::after { box-sizing: border-box; margin: 0; padding: 0; }

    #ppr-header {
      --ppr-top-h: 58px;
      --ppr-sub-h: 44px;
      --ppr-gold: #c8a951;
      --ppr-ice: #7ecfff;
      position: sticky;
      top: 0;
      z-index: 500;
      transition: transform 0.3s cubic-bezier(0.2, 0.7, 0.2, 1);
      font-family: 'Oswald', sans-serif;
    }
    #ppr-header.ppr-compact { transform: translateY(calc(-1 * var(--ppr-top-h))); }

    /* ── Tier 1: main bar ── */
    #ppr-nav {
      height: var(--ppr-top-h);
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      gap: 1rem;
      padding: 0 2.5rem;
      background: rgba(13,17,23,0.97);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    #ppr-header:not(.ppr-has-sub) #ppr-nav { border-bottom: 2px solid #8b1a1a; }

    #ppr-nav .ppr-brand {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      text-decoration: none;
      flex-shrink: 0;
    }
    #ppr-nav .ppr-logo {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      line-height: 1;
      letter-spacing: 3px;
      color: var(--ppr-gold);
    }
    #ppr-nav .ppr-brand-sub {
      font-size: 0.68rem;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #3a5a7a;
      padding-left: 0.8rem;
      border-left: 1px solid rgba(255,255,255,0.08);
      line-height: 1.25;
      transition: color 0.2s;
    }
    #ppr-nav .ppr-brand:hover .ppr-brand-sub { color: #7a9ab5; }

    #ppr-nav .ppr-tabs { display: flex; align-items: stretch; list-style: none; }
    #ppr-nav .ppr-tabs > li { display: flex; }

    #ppr-nav .ppr-tab {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 1.15rem;
      color: #7a9ab5;
      text-decoration: none;
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s, background 0.2s;
      white-space: nowrap;
    }
    #ppr-nav .ppr-tab:hover { color: #fff; background: rgba(255,255,255,0.025); }
    #ppr-nav .ppr-tab-text {
      font-size: 0.8rem;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      line-height: 1;
    }
    #ppr-nav .ppr-tab-year {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.6rem;
      letter-spacing: 2px;
      line-height: 0.95;
    }
    #ppr-nav .ppr-tab-meta {
      font-size: 0.54rem;
      letter-spacing: 1.6px;
      text-transform: uppercase;
      color: #3a5a7a;
      margin-top: 3px;
      line-height: 1;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.2s;
    }
    #ppr-nav .ppr-tab:hover .ppr-tab-meta { color: #7a9ab5; }
    #ppr-nav .ppr-tab-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--ppr-ice);
      box-shadow: 0 0 8px rgba(126,207,255,0.7);
    }
    #ppr-nav .ppr-tab.active { color: var(--ppr-gold); border-bottom-color: var(--ppr-gold); }
    #ppr-nav .ppr-tab.active .ppr-tab-meta { color: rgba(200,169,81,0.7); }
    #ppr-nav .ppr-tab[data-accent="ice"].active { color: var(--ppr-ice); border-bottom-color: var(--ppr-ice); }
    #ppr-nav .ppr-tab[data-accent="ice"].active .ppr-tab-meta { color: rgba(126,207,255,0.7); }

    /* ── Tier 2: season bar ── */
    #ppr-subnav {
      position: relative;
      height: var(--ppr-sub-h);
      display: flex;
      align-items: stretch;
      background: rgba(18,26,36,0.97);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    #ppr-subnav .ppr-sub-season {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0 1.2rem 0 2.5rem;
      border-right: 1px solid rgba(255,255,255,0.06);
      text-decoration: none;
    }
    #ppr-subnav .ppr-sub-year {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.35rem;
      letter-spacing: 2px;
      line-height: 1;
      color: var(--ppr-gold);
    }
    #ppr-subnav[data-accent="ice"] .ppr-sub-year { color: var(--ppr-ice); }
    #ppr-subnav .ppr-sub-status {
      font-size: 0.58rem;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 0.22rem 0.55rem;
      border-radius: 100px;
      color: var(--ppr-gold);
      background: rgba(200,169,81,0.1);
      border: 1px solid rgba(200,169,81,0.28);
      white-space: nowrap;
      line-height: 1;
    }
    #ppr-subnav[data-accent="ice"] .ppr-sub-status {
      color: var(--ppr-ice);
      background: rgba(126,207,255,0.08);
      border-color: rgba(126,207,255,0.28);
    }

    #ppr-subnav .ppr-sub-scroll {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: stretch;
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      padding-left: 0.4rem;
    }
    #ppr-subnav .ppr-sub-scroll::-webkit-scrollbar { display: none; }
    #ppr-subnav .ppr-sub-scroll.fade-right { -webkit-mask-image: linear-gradient(90deg, #000 85%, transparent); mask-image: linear-gradient(90deg, #000 85%, transparent); }
    #ppr-subnav .ppr-sub-scroll.fade-left  { -webkit-mask-image: linear-gradient(90deg, transparent, #000 15%); mask-image: linear-gradient(90deg, transparent, #000 15%); }
    #ppr-subnav .ppr-sub-scroll.fade-left.fade-right { -webkit-mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); mask-image: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent); }

    #ppr-subnav .ppr-sub-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;
      padding: 0 0.8rem;
      font-family: 'Oswald', sans-serif;
      font-size: 0.72rem;
      font-weight: 400;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #7a9ab5;
      text-decoration: none;
      white-space: nowrap;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
      line-height: 1;
    }
    #ppr-subnav a.ppr-sub-item:hover,
    #ppr-subnav button.ppr-sub-item:hover { color: #fff; }
    #ppr-subnav .ppr-sub-item.active { color: var(--ppr-gold); border-bottom-color: var(--ppr-gold); }
    #ppr-subnav[data-accent="ice"] .ppr-sub-item.active { color: var(--ppr-ice); border-bottom-color: var(--ppr-ice); }
    #ppr-subnav .ppr-sub-item.ppr-gf { color: var(--ppr-gold); font-weight: 500; text-shadow: 0 0 12px rgba(200,169,81,0.35); }
    #ppr-subnav .ppr-sub-item.ppr-gf:hover { color: #fff; }

    #ppr-subnav .ppr-sub-item.is-soon { color: #2f4a63; cursor: default; text-shadow: none; }
    #ppr-subnav .ppr-soon-tag {
      font-size: 0.52rem;
      letter-spacing: 1.2px;
      padding: 0.15rem 0.38rem;
      border-radius: 3px;
      border: 1px solid rgba(126,207,255,0.2);
      color: rgba(126,207,255,0.6);
    }

    #ppr-subnav .ppr-chevron { font-size: 0.5rem; display: inline-block; transition: transform 0.2s; }
    #ppr-subnav .ppr-sub-item[aria-expanded="true"] { color: #fff; }
    #ppr-subnav .ppr-sub-item[aria-expanded="true"] .ppr-chevron { transform: rotate(180deg); }

    #ppr-subnav .ppr-dropdown-menu {
      display: none;
      position: absolute;
      top: var(--ppr-sub-h);
      left: 0;
      min-width: 190px;
      max-height: min(70vh, 520px);
      overflow-y: auto;
      padding: 0.4rem 0;
      background: rgba(13,17,23,0.98);
      border: 1px solid rgba(255,255,255,0.06);
      border-top: 2px solid var(--ppr-gold);
      border-radius: 0 0 10px 10px;
      box-shadow: 0 14px 34px rgba(0,0,0,0.6);
      z-index: 600;
    }
    #ppr-subnav[data-accent="ice"] .ppr-dropdown-menu { border-top-color: var(--ppr-ice); }
    #ppr-subnav .ppr-dropdown-menu.open { display: block; animation: pprMenuIn 0.16s ease-out; }
    @keyframes pprMenuIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
    #ppr-subnav .ppr-dropdown-menu a {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 0.62rem 1.2rem;
      font-family: 'Oswald', sans-serif;
      font-size: 0.78rem;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #7a9ab5;
      text-decoration: none;
      transition: color 0.15s, background 0.15s;
    }
    #ppr-subnav .ppr-dropdown-menu a:hover,
    #ppr-subnav .ppr-dropdown-menu a:focus-visible { color: #fff; background: rgba(255,255,255,0.04); }
    #ppr-subnav .ppr-dropdown-menu a.active { color: var(--ppr-gold); }
    #ppr-subnav .ppr-latest-tag {
      font-size: 0.55rem;
      letter-spacing: 1.2px;
      color: #f08080;
      border: 1px solid rgba(139,26,26,0.55);
      background: rgba(139,26,26,0.25);
      border-radius: 100px;
      padding: 0.12rem 0.45rem;
    }

    #ppr-nav-divider { height: 3px; background: linear-gradient(90deg, #8b1a1a 0%, #c8a951 50%, #8b1a1a 100%); }
    #ppr-header[data-accent="ice"] #ppr-nav-divider { background: linear-gradient(90deg, #1b2a3b 0%, #7ecfff 50%, #1b2a3b 100%); }

    /* ── Focus ── */
    #ppr-header a:focus-visible,
    #ppr-header button:focus-visible { outline: 2px solid var(--ppr-gold); outline-offset: -2px; }

    /* ── Breakpoints ── */
    @media (max-width: 1100px) {
      #ppr-nav { padding: 0 1.4rem; }
      #ppr-subnav .ppr-sub-season { padding-left: 1.4rem; }
    }
    @media (max-width: 760px) {
      #ppr-header { --ppr-top-h: 52px; --ppr-sub-h: 42px; }
      #ppr-nav { padding: 0 0.6rem 0 1rem; gap: 0.5rem; }
      #ppr-nav .ppr-logo { font-size: 1.6rem; letter-spacing: 2px; }
      #ppr-nav .ppr-brand-sub { display: none; }
      #ppr-nav .ppr-tab { padding: 0 0.7rem; }
      #ppr-nav .ppr-tab-text { font-size: 0.72rem; letter-spacing: 1px; }
      #ppr-nav .ppr-tab-year { font-size: 1.45rem; letter-spacing: 1.5px; }
      #ppr-nav .ppr-tab-meta { display: none; }
      #ppr-nav .ppr-tab-year::after {
        content: '';
        display: none;
      }
      #ppr-nav .ppr-tab[data-soon="true"] .ppr-tab-year::after {
        display: inline-block;
        width: 5px; height: 5px; border-radius: 50%;
        background: var(--ppr-ice);
        margin-left: 3px;
        vertical-align: top;
      }
      #ppr-subnav .ppr-sub-season { padding: 0 0.8rem 0 1rem; }
      #ppr-subnav .ppr-sub-status { display: none; }
      #ppr-subnav .ppr-sub-item { padding: 0 0.7rem; font-size: 0.7rem; letter-spacing: 1px; }
    }
    @media (max-width: 360px) {
      #ppr-nav .ppr-tab { padding: 0 0.5rem; }
      #ppr-nav .ppr-tab-year { font-size: 1.3rem; }
    }
    @media (prefers-reduced-motion: reduce) {
      #ppr-header { transition: none; }
      #ppr-subnav .ppr-dropdown-menu.open { animation: none; }
    }
  `;
  document.head.appendChild(style);
})();

// ═════════════════════════════════════════════════════════════════════════
// BUILD HEADER
// ═════════════════════════════════════════════════════════════════════════
(function buildNav() {
  // Normalise the current filename (handles "/", extensionless URLs and %20)
  let currentPage = decodeURIComponent(window.location.pathname.split('/').pop() || '');
  if (!currentPage) currentPage = 'index.html';
  if (!/\.[a-z0-9]+$/i.test(currentPage)) currentPage += '.html';

  const pagesOf = s => [
    s.overview,
    ...s.before.map(i => i.href),
    ...s.rounds.map(i => i.href),
    ...s.after.map(i => i.href),
    ...(s.hidden || []),
  ].filter(Boolean);

  const season = PPR_NAV.seasons.find(s => pagesOf(s).includes(currentPage)) || null;
  const isActive = href => href && href === currentPage;
  const cls = (...c) => { const v = c.filter(Boolean).join(' '); return v ? ` class="${v}"` : ''; };
  const aria = href => isActive(href) ? ' aria-current="page"' : '';

  // ── Tier 1 ──
  const homeActive = currentPage === PPR_NAV.home.href;
  const tabs = [
    `<li><a href="${PPR_NAV.home.href}"${cls('ppr-tab', homeActive && 'active')}${homeActive ? ' aria-current="page"' : ''}><span class="ppr-tab-text">${PPR_NAV.home.label}</span></a></li>`,
    ...PPR_NAV.seasons.map(s => {
      const on = season && season.year === s.year;
      const soon = s.accent === 'ice';
      return `<li><a href="${s.overview}"${cls('ppr-tab', on && 'active')} data-accent="${s.accent}" data-soon="${soon}"${on ? ' aria-current="true"' : ''} aria-label="${s.year} season, ${s.status}">
        <span class="ppr-tab-year">${s.year}</span>
        <span class="ppr-tab-meta">${soon ? '<span class="ppr-tab-dot"></span>' : ''}${s.status}</span>
      </a></li>`;
    }),
  ].join('');

  // ── Tier 2 ──
  let subHTML = '';
  if (season) {
    const item = i => i.href
      ? `<a href="${i.href}"${cls('ppr-sub-item', i.cls, isActive(i.href) && 'active')}${aria(i.href)}>${i.label}</a>`
      : `<span class="ppr-sub-item is-soon${i.cls ? ' ' + i.cls : ''}" aria-disabled="true">${i.label} <span class="ppr-soon-tag">Soon</span></span>`;

    const onRound = season.rounds.some(r => isActive(r.href));
    const roundsHTML = season.rounds.length
      ? `<button type="button"${cls('ppr-sub-item', onRound && 'active')} id="ppr-rounds-btn" aria-expanded="false" aria-haspopup="true" aria-controls="ppr-rounds-menu">
           Rounds <span class="ppr-chevron" aria-hidden="true">&#9660;</span>
         </button>`
      : `<span class="ppr-sub-item is-soon" aria-disabled="true">Rounds <span class="ppr-soon-tag">Soon</span></span>`;

    const menuHTML = season.rounds.length
      ? `<div class="ppr-dropdown-menu" id="ppr-rounds-menu" role="menu" aria-label="${season.year} rounds">
           ${season.rounds.map(r => `<a role="menuitem" href="${r.href}"${cls(isActive(r.href) && 'active')}${aria(r.href)}>${r.label}${r.href === season.latestRound ? '<span class="ppr-latest-tag">Latest</span>' : ''}</a>`).join('')}
         </div>`
      : '';

    subHTML = `
      <div id="ppr-subnav" data-accent="${season.accent}" role="navigation" aria-label="${season.year} season">
        <a class="ppr-sub-season" href="${season.overview}" aria-label="${season.year} season overview">
          <span class="ppr-sub-year">${season.year}</span>
          <span class="ppr-sub-status">${season.status}</span>
        </a>
        <div class="ppr-sub-scroll" id="ppr-sub-scroll">
          ${season.before.map(item).join('')}
          ${roundsHTML}
          ${season.after.map(item).join('')}
        </div>
        ${menuHTML}
      </div>`;
  }

  // Remove any previously injected header (idempotent) and legacy navs
  ['ppr-header', 'ppr-nav', 'ppr-mobile-menu', 'ppr-nav-divider'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  document.querySelectorAll('nav').forEach(el => el.remove());
  document.querySelectorAll('.divider').forEach(el => el.remove());

  const header = document.createElement('header');
  header.id = 'ppr-header';
  if (season) { header.classList.add('ppr-has-sub'); header.dataset.accent = season.accent; }
  header.innerHTML = `
    <div id="ppr-nav" role="navigation" aria-label="Main">
      <a class="ppr-brand" href="${PPR_NAV.home.href}" aria-label="Paz's Power Rankings home">
        <span class="ppr-logo">PPR</span>
        <span class="ppr-brand-sub">Ligma League<br>Power Rankings</span>
      </a>
      <ul class="ppr-tabs">${tabs}</ul>
    </div>
    ${subHTML}
    <div id="ppr-nav-divider"></div>`;

  document.body.insertBefore(header, document.body.firstChild);
})();

// ═════════════════════════════════════════════════════════════════════════
// BEHAVIOUR: dropdown, scroll fades, compact-on-scroll, anchor offsets
// ═════════════════════════════════════════════════════════════════════════
(function () {
  const header = document.getElementById('ppr-header');
  const sub    = document.getElementById('ppr-subnav');
  const strip  = document.getElementById('ppr-sub-scroll');
  const btn    = document.getElementById('ppr-rounds-btn');
  const menu   = document.getElementById('ppr-rounds-menu');
  if (!header) return;

  // ── Anchor offset so in-page links clear the sticky header ──
  function syncHeight() {
    const h = header.offsetHeight;
    document.documentElement.style.setProperty('--ppr-header-h', h + 'px');
    document.documentElement.style.scrollPaddingTop = (h + 8) + 'px';
  }
  syncHeight();
  window.addEventListener('resize', syncHeight);

  // ── Rounds dropdown ──
  function placeMenu() {
    if (!btn || !menu || !sub) return;
    const subBox = sub.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    const w = menu.offsetWidth || 200;
    let left = b.left - subBox.left;
    left = Math.max(8, Math.min(left, subBox.width - w - 8));
    menu.style.left = left + 'px';
  }
  function openMenu() {
    if (!btn || !menu) return;
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    placeMenu();
  }
  function closeMenu(returnFocus) {
    if (!btn || !menu || !menu.classList.contains('open')) return;
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    if (returnFocus) btn.focus();
  }
  if (btn && menu) {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      menu.classList.contains('open') ? closeMenu() : openMenu();
    });
    btn.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        openMenu();
        const first = menu.querySelector('a.active') || menu.querySelector('a');
        if (first) first.focus();
      }
    });
    menu.addEventListener('keydown', e => {
      const links = [...menu.querySelectorAll('a')];
      const i = links.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (links[i + 1] || links[0]).focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); (links[i - 1] || links[links.length - 1]).focus(); }
    });
    document.addEventListener('click', e => { if (!menu.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(true); });
    sub.addEventListener('focusout', e => {
      if (!e.relatedTarget || (!menu.contains(e.relatedTarget) && e.relatedTarget !== btn)) closeMenu();
    });
    window.addEventListener('resize', () => closeMenu());
  }

  // ── Horizontal strip: edge fades + keep the active item in view ──
  if (strip) {
    const updateFade = () => {
      const max = strip.scrollWidth - strip.clientWidth;
      strip.classList.toggle('fade-left', strip.scrollLeft > 4);
      strip.classList.toggle('fade-right', strip.scrollLeft < max - 4);
    };
    strip.addEventListener('scroll', () => { updateFade(); closeMenu(); }, { passive: true });
    window.addEventListener('resize', updateFade);
    const active = strip.querySelector('.active');
    if (active) {
      const target = active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2;
      strip.scrollLeft = Math.max(0, target);
    }
    updateFade();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateFade);
  }

  // ── Compact header: hide the top tier while scrolling down a season page ──
  if (sub) {
    let lastY = window.scrollY;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > 160 && y > lastY + 6) { header.classList.add('ppr-compact'); closeMenu(); }
        else if (y < lastY - 6 || y <= 160) header.classList.remove('ppr-compact');
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
  }
})();
