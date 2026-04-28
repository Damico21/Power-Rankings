/**
 * PPR Shared Navigation — nav.js v3
 * ===================================
 * Single source of truth for every page on the site.
 *
 * TO ADD A NEW ROUND:
 *   Uncomment (or add) an entry in PPR_NAV.rounds below.
 *   Every page updates automatically — no other files need touching.
 *
 * TO UPDATE THE "LATEST ROUND" badge on index.html:
 *   Change PPR_NAV.latestRound to the new round's href.
 */

const PPR_NAV = {

  // ── LATEST ROUND (reference only — used for documentation) ──────────────
  latestRound: 'round-7.html',

  // ── ROUNDS DROPDOWN ──────────────────────────────────────────────────────
  rounds: [
    { label: 'Opening Round', href: 'opening-round.html' },
    { label: 'Round 1',       href: 'round-1.html'       },
    { label: 'Round 2',       href: 'round-2.html'       },
    { label: 'Round 3',       href: 'round-3.html'       },
    { label: 'Round 4',       href: 'round-4.html'       },
    { label: 'Round 5',       href: 'round-5.html'       },
    { label: 'Round 6',       href: 'round-6.html'       },
    { label: 'Round 7',       href: 'round-7.html'       },
    // { label: 'Round 8',  href: 'round-8.html'  },
    // { label: 'Round 9',  href: 'round-9.html'  },
    // { label: 'Round 10', href: 'round-10.html' },
  ],

  // ── STATIC NAV ITEMS ─────────────────────────────────────────────────────
  before: [
    { label: 'Home',        href: 'index.html'    },
    { label: 'Draft Night', href: 'rankings.html' },
  ],

  after: [
    { label: '⚔️ Rivalry Round',       href: 'rivalry-round.html'      },
    { label: '📸 Best Moments',         href: 'best-moments.html'       },
    { label: '🎵 PPR Tunes',            href: 'ppr-tunes.html'          },
    { label: '🐍 Snakes &amp; Ladders', href: 'snakes-and-ladders.html' },
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
    #ppr-nav *, #ppr-nav *::before, #ppr-nav *::after { box-sizing: border-box; margin: 0; padding: 0; }

    #ppr-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2.5rem;
      background: rgba(13,17,23,0.97);
      border-bottom: 2px solid #8b1a1a;
      position: sticky;
      top: 0;
      z-index: 500;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      height: 58px;
    }

    #ppr-nav .ppr-logo {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.8rem;
      color: #c8a951;
      text-decoration: none;
      letter-spacing: 3px;
      flex-shrink: 0;
      line-height: 1;
    }

    #ppr-nav .ppr-links {
      display: flex;
      list-style: none;
      align-items: stretch;
      height: 58px;
    }

    #ppr-nav .ppr-links > li {
      position: relative;
      display: flex;
      align-items: stretch;
    }

    #ppr-nav .ppr-links a,
    #ppr-nav .ppr-dropdown-btn {
      color: #7a9ab5;
      text-decoration: none;
      font-family: 'Oswald', sans-serif;
      font-size: 0.8rem;
      font-weight: 400;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 0 1rem;
      height: 58px;
      display: flex;
      align-items: center;
      border-top: none; border-left: none; border-right: none;
      border-bottom: 2px solid transparent;
      background: none;
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
      white-space: nowrap;
      line-height: 1;
    }

    #ppr-nav .ppr-links a:hover,
    #ppr-nav .ppr-dropdown-btn:hover { color: #fff; }

    #ppr-nav .ppr-links a.active { color: #c8a951; border-bottom-color: #c8a951; }

    #ppr-nav .ppr-dropdown-btn { gap: 0.35rem; }
    #ppr-nav .ppr-dropdown-btn.active-parent { color: #c8a951; border-bottom-color: #c8a951; }

    #ppr-nav .ppr-chevron {
      font-size: 0.5rem;
      display: inline-block;
      transition: transform 0.2s;
      margin-top: 1px;
    }
    #ppr-nav .ppr-dropdown-btn[aria-expanded="true"] .ppr-chevron { transform: rotate(180deg); }

    #ppr-nav .ppr-dropdown-menu {
      display: none;
      position: absolute;
      top: 58px;
      left: 0;
      background: rgba(13,17,23,0.98);
      border: 1px solid rgba(255,255,255,0.06);
      border-top: 2px solid #c8a951;
      border-radius: 0 0 10px 10px;
      min-width: 160px;
      z-index: 600;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.6);
      padding: 0.4rem 0;
      max-height: 80vh;
      overflow-y: auto;
    }
    #ppr-nav .ppr-dropdown-menu.open { display: block; }

    #ppr-nav .ppr-dropdown-menu a {
      height: auto !important;
      padding: 0.65rem 1.2rem !important;
      display: block !important;
      border-bottom: none !important;
      font-size: 0.78rem !important;
      color: #7a9ab5;
    }
    #ppr-nav .ppr-dropdown-menu a:hover { color: #fff; background: rgba(255,255,255,0.04); }
    #ppr-nav .ppr-dropdown-menu a.active { color: #c8a951; border-bottom: none !important; }

    #ppr-nav-divider {
      height: 3px;
      background: linear-gradient(90deg, #8b1a1a 0%, #c8a951 50%, #8b1a1a 100%);
    }

    /* ── Hamburger ── */
    #ppr-hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 6px 4px;
      z-index: 600;
      flex-shrink: 0;
    }
    #ppr-hamburger span {
      display: block;
      width: 24px;
      height: 2px;
      background: #c8a951;
      border-radius: 2px;
      transition: transform 0.25s ease, opacity 0.25s ease;
    }
    #ppr-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    #ppr-hamburger.open span:nth-child(2) { opacity: 0; }
    #ppr-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    /* ── Mobile overlay ── */
    #ppr-mobile-menu {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(8,12,18,0.98);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      z-index: 490;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow-y: auto;
      padding: 5rem 2rem 3rem;
    }
    #ppr-mobile-menu.open { display: flex; }

    #ppr-mobile-menu a {
      font-family: 'Oswald', sans-serif;
      text-transform: uppercase;
      text-decoration: none;
      letter-spacing: 2.5px;
      color: #7a9ab5;
      transition: color 0.2s;
      text-align: center;
      display: block;
      width: 100%;
      max-width: 320px;
      padding: 0.9rem 1rem;
    }
    #ppr-mobile-menu a:hover  { color: #fff; }
    #ppr-mobile-menu a.active { color: #c8a951; }

    #ppr-mobile-menu a.ppr-mob-primary { font-size: 1.1rem; letter-spacing: 3px; border-bottom: 1px solid rgba(255,255,255,0.05); }
    #ppr-mobile-menu a.ppr-mob-round   { font-size: 0.85rem; color: #4a6a8a; padding: 0.5rem 1rem; }
    #ppr-mobile-menu a.ppr-mob-round:hover { color: #c8a951; }
    #ppr-mobile-menu a.ppr-mob-round.active { color: #c8a951; }

    #ppr-mobile-menu .ppr-mob-section-label {
      font-family: 'Oswald', sans-serif;
      text-transform: uppercase;
      font-size: 0.6rem;
      letter-spacing: 3px;
      color: #2a4a6a;
      padding: 1rem 1rem 0.4rem;
      pointer-events: none;
      text-align: center;
      width: 100%;
      max-width: 320px;
    }
    #ppr-mobile-menu .ppr-mob-divider {
      width: 100%;
      max-width: 320px;
      height: 1px;
      background: rgba(255,255,255,0.05);
      margin: 0.5rem 0;
    }

    /* ── Breakpoints ── */
    @media (max-width: 1080px) {
      #ppr-nav .ppr-links a,
      #ppr-nav .ppr-dropdown-btn { font-size: 0.74rem; padding: 0 0.7rem; letter-spacing: 1px; }
    }
    @media (max-width: 820px) {
      #ppr-nav { padding: 0 1.2rem; }
      #ppr-nav .ppr-links { display: none; }
      #ppr-hamburger { display: flex; }
    }
  `;
  document.head.appendChild(style);
})();

// ═════════════════════════════════════════════════════════════════════════
// BUILD NAV
// ═════════════════════════════════════════════════════════════════════════
(function buildNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const roundHrefs  = PPR_NAV.rounds.map(r => r.href);
  const onRoundPage = roundHrefs.includes(currentPage);

  function ac(href, extra) {
    const cls = [extra, href === currentPage ? 'active' : ''].filter(Boolean).join(' ');
    return cls ? ` class="${cls}"` : '';
  }

  // Desktop
  const beforeHTML = PPR_NAV.before.map(i => `<li><a href="${i.href}"${ac(i.href)}>${i.label}</a></li>`).join('');
  const afterHTML  = PPR_NAV.after.map(i  => `<li><a href="${i.href}"${ac(i.href)}>${i.label}</a></li>`).join('');

  const dropdownItems = PPR_NAV.rounds.map(r =>
    `<a href="${r.href}"${ac(r.href)}>${r.label}</a>`
  ).join('');

  const dropdownHTML = `
    <li>
      <button class="ppr-dropdown-btn${onRoundPage ? ' active-parent' : ''}"
              id="ppr-rounds-btn" aria-expanded="false" aria-haspopup="true">
        Rounds <span class="ppr-chevron">&#9660;</span>
      </button>
      <div class="ppr-dropdown-menu" id="ppr-rounds-menu" role="menu">
        ${dropdownItems}
      </div>
    </li>`;

  // Mobile
  const mobBefore = PPR_NAV.before.map(i => `<a href="${i.href}"${ac(i.href,'ppr-mob-primary')}>${i.label}</a>`).join('');
  const mobRounds = PPR_NAV.rounds.map(r => `<a href="${r.href}"${ac(r.href,'ppr-mob-round')}>${r.label}</a>`).join('');
  const mobAfter  = PPR_NAV.after.map(i  => `<a href="${i.href}"${ac(i.href,'ppr-mob-primary')}>${i.label}</a>`).join('');

  // Remove any existing PPR nav elements first (idempotent injection)
  ['ppr-nav','ppr-mobile-menu','ppr-nav-divider'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });
  // Remove any legacy hardcoded navs
  document.querySelectorAll('nav:not(#ppr-nav)').forEach(el => el.remove());
  document.querySelectorAll('.divider').forEach(el => el.remove());

  const nav = document.createElement('nav');
  nav.id = 'ppr-nav';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main');
  nav.innerHTML = `
    <a class="ppr-logo" href="index.html">PPR</a>
    <ul class="ppr-links">${beforeHTML}${dropdownHTML}${afterHTML}</ul>
    <button id="ppr-hamburger" aria-label="Open menu" aria-expanded="false" aria-controls="ppr-mobile-menu">
      <span></span><span></span><span></span>
    </button>`;

  const mob = document.createElement('div');
  mob.id = 'ppr-mobile-menu';
  mob.setAttribute('role', 'dialog');
  mob.setAttribute('aria-modal', 'true');
  mob.innerHTML = `
    ${mobBefore}
    <div class="ppr-mob-divider"></div>
    <div class="ppr-mob-section-label">Rounds</div>
    ${mobRounds}
    <div class="ppr-mob-divider"></div>
    ${mobAfter}`;

  const divider = document.createElement('div');
  divider.id = 'ppr-nav-divider';

  // Insert order in DOM: mobileMenu, nav, divider
  const first = document.body.firstChild;
  document.body.insertBefore(divider, first);
  document.body.insertBefore(nav, divider);
  document.body.insertBefore(mob, nav);
})();

// ═════════════════════════════════════════════════════════════════════════
// DROPDOWN TOGGLE
// ═════════════════════════════════════════════════════════════════════════
(function () {
  function close() {
    const btn  = document.getElementById('ppr-rounds-btn');
    const menu = document.getElementById('ppr-rounds-menu');
    if (menu) menu.classList.remove('open');
    if (btn)  btn.setAttribute('aria-expanded', 'false');
  }
  function toggle() {
    const btn  = document.getElementById('ppr-rounds-btn');
    const menu = document.getElementById('ppr-rounds-menu');
    if (!btn || !menu) return;
    const open = !menu.classList.contains('open');
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  }
  document.addEventListener('click', e => {
    const btn  = document.getElementById('ppr-rounds-btn');
    const menu = document.getElementById('ppr-rounds-menu');
    if (!btn || !menu) return;
    if (btn.contains(e.target)) { toggle(); return; }
    if (!menu.contains(e.target)) close();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();

// ═════════════════════════════════════════════════════════════════════════
// HAMBURGER / MOBILE MENU
// ═════════════════════════════════════════════════════════════════════════
(function () {
  function close() {
    const btn = document.getElementById('ppr-hamburger');
    const mob = document.getElementById('ppr-mobile-menu');
    if (mob) mob.classList.remove('open');
    if (btn) { btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Open menu'); }
    document.body.style.overflow = '';
  }
  function toggle() {
    const btn = document.getElementById('ppr-hamburger');
    const mob = document.getElementById('ppr-mobile-menu');
    if (!btn || !mob) return;
    const open = !mob.classList.contains('open');
    mob.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  document.addEventListener('click', e => {
    const btn = document.getElementById('ppr-hamburger');
    const mob = document.getElementById('ppr-mobile-menu');
    if (!btn || !mob) return;
    if (btn.contains(e.target)) { toggle(); return; }
    if (mob.contains(e.target) && e.target.tagName === 'A') { close(); return; }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
