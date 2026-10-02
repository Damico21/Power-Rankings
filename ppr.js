/**
 * PPR season engine (ppr.js)
 * ==========================
 * Renders every data-driven block on the season hub pages
 * (2026.html, 2027.html, and any future season) from one config object:
 *
 *   PPR.season({ year, roundLabels, ppr, matches, polls, archive, ... })
 *
 * Each block only renders if its container exists on the page, so a
 * season page can include or leave out any section.
 *
 * Also provides an image lightbox for any element with data-lightbox="file.jpg".
 */
(function () {
  'use strict';
  const PPR = (window.PPR = window.PPR || {});

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = id => document.getElementById(id);

  // ═══════════════════════════════════════════════════════════════════
  // LIGHTBOX
  // ═══════════════════════════════════════════════════════════════════
  PPR.lightbox = (function () {
    let box, img, cap, closeBtn, lastFocus;
    function build() {
      box = document.createElement('div');
      box.className = 'ppr-lightbox';
      box.hidden = true;
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-label', 'Image viewer');
      box.innerHTML = '<button class="ppr-lb-close" type="button" aria-label="Close image">&#10005;</button><figure><img alt=""><figcaption></figcaption></figure>';
      document.body.appendChild(box);
      img = box.querySelector('img');
      cap = box.querySelector('figcaption');
      closeBtn = box.querySelector('.ppr-lb-close');
      box.addEventListener('click', e => { if (e.target === box || e.target === closeBtn) close(); });
      box.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); closeBtn.focus(); } });
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && !box.hidden) close(); });
    }
    function open(src, alt, caption, trigger) {
      if (!box) build();
      lastFocus = trigger || document.activeElement;
      img.src = src;
      img.alt = alt || '';
      cap.textContent = caption || '';
      cap.hidden = !caption;
      box.hidden = false;
      document.documentElement.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      if (!box || box.hidden) return;
      box.hidden = true;
      img.removeAttribute('src');
      document.documentElement.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.addEventListener('click', e => {
      const t = e.target.closest('[data-lightbox]');
      if (!t) return;
      e.preventDefault();
      open(t.getAttribute('data-lightbox'), t.getAttribute('data-alt'), t.getAttribute('data-caption'), t);
    });
    return { open, close };
  })();

  // ═══════════════════════════════════════════════════════════════════
  // SEASON
  // ═══════════════════════════════════════════════════════════════════
  PPR.season = function (cfg) {
    const labels = cfg.roundLabels || [];
    const teams = Object.keys(cfg.ppr || {});
    const ppr = {};
    teams.forEach(t => {
      const a = (cfg.ppr[t] || []).slice(0, labels.length);
      while (a.length < labels.length) a.push(null);
      ppr[t] = a;
    });
    const scoredCols = labels.map((_, i) => i).filter(i => teams.some(t => ppr[t][i] != null));
    const cols = cfg.hideEmptyRounds ? scoredCols : labels.map((_, i) => i);
    const hasScores = scoredCols.length > 0;
    const matches = cfg.matches || [];
    const displayName = t => (cfg.displayNames && cfg.displayNames[t]) || t;
    let focusTeam = null;

    renderStats();
    renderCumulative();
    renderH2H();
    renderArchive();
    renderPolls();
    initWheel(cfg.wheelTeams || teams.map(displayName));

    // ── STATS ──────────────────────────────────────────────────────
    function renderStats() {
      const set = (k, v) => document.querySelectorAll(`[data-stat="${k}"]`).forEach(el => { el.textContent = v; });
      set('teams', String(teams.length));
      set('rounds', String(scoredCols.length).padStart(2, '0'));
      const all = teams.flatMap(t => ppr[t].filter(v => v != null));
      set('top', all.length ? Math.max(...all).toFixed(2) : '—');
    }

    // ── TEAM FOCUS (click a team in either table) ─────────────────
    function applyFocus() {
      document.querySelectorAll('tr[data-team]').forEach(tr => {
        tr.classList.toggle('is-focus', tr.dataset.team === focusTeam);
      });
      document.querySelectorAll('.cum-name').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.team === focusTeam)));
    }
    document.addEventListener('click', e => {
      const b = e.target.closest('.cum-name');
      if (!b) return;
      focusTeam = focusTeam === b.dataset.team ? null : b.dataset.team;
      applyFocus();
    });

    // ── CUMULATIVE ─────────────────────────────────────────────────
    function renderCumulative() {
      const table = $('cumTable');
      if (!table) return;
      let sortBy = 'total';

      const roundBest = labels.map((_, i) => {
        const v = teams.map(t => ppr[t][i]).filter(x => x != null);
        return v.length ? Math.max(...v) : null;
      });
      const latestCol = scoredCols.length ? scoredCols[scoredCols.length - 1] : null;
      const rows = teams.map(team => {
        const scores = ppr[team];
        const played = scores.filter(v => v != null);
        const total = played.reduce((a, b) => a + b, 0);
        return {
          team, scores, total,
          avg: played.length ? total / played.length : null,
          latest: latestCol != null ? scores[latestCol] : null,
          played: played.length,
        };
      });

      const headLabel = l => (/^Round/.test(l) ? l.replace(' ', '<br>') : l.replace(' ', '<br>'));
      table.style.minWidth = (440 + cols.length * 50) + 'px';
      table.innerHTML =
        '<thead><tr>' +
        '<th class="th-left" scope="col">#</th><th class="th-left" scope="col">Team</th>' +
        cols.map(i => `<th scope="col">${headLabel(esc(labels[i]))}</th>`).join('') +
        '<th scope="col">Total</th><th scope="col">Avg</th><th scope="col">Trend</th>' +
        '</tr></thead><tbody></tbody>';
      const tbody = table.querySelector('tbody');

      function draw() {
        const key = r => (sortBy === 'avg' ? r.avg : sortBy === 'latest' ? r.latest : r.total);
        const sorted = rows.slice().sort((a, b) => {
          if (!hasScores) return a.team.localeCompare(b.team);
          const ka = key(a) ?? -1, kb = key(b) ?? -1;
          return kb - ka || b.total - a.total;
        });
        tbody.innerHTML = sorted.map((r, idx) => {
          const rank = idx + 1;
          const pos = hasScores ? `<span class="cum-pos${rank <= 3 ? ' p' + rank : ''}">${rank}</span>` : '<span class="cum-pos">–</span>';
          const cells = cols.map(i => {
            const s = r.scores[i];
            if (s == null) return '<td class="cum-score">—</td>';
            const best = roundBest[i] != null && s === roundBest[i];
            return `<td class="cum-score played${best ? ' best' : ''}" title="${esc(displayName(r.team))}, ${esc(labels[i])}: ${s.toFixed(2)}${best ? ' (best of the round)' : ''}">${s.toFixed(2)}</td>`;
          }).join('');
          const trend = snake(r.scores.slice(1).filter(v => v != null).slice(-5));
          return `<tr data-team="${esc(r.team)}">` +
            `<td>${pos}</td>` +
            `<td><button type="button" class="cum-name" data-team="${esc(r.team)}" aria-pressed="false">${esc(displayName(r.team))}</button></td>` +
            cells +
            `<td class="cum-total">${r.played ? r.total.toFixed(2) : '—'}</td>` +
            `<td class="cum-avg">${r.avg != null ? r.avg.toFixed(2) : '—'}</td>` +
            `<td class="cum-snake">${trend}</td></tr>`;
        }).join('');
        applyFocus();
      }
      draw();

      const seg = $('cumSort');
      if (seg) {
        if (!hasScores) seg.hidden = true;
        seg.addEventListener('click', e => {
          const b = e.target.closest('button[data-sort]');
          if (!b) return;
          sortBy = b.dataset.sort;
          seg.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
          draw();
        });
      }
      if (!hasScores) addEmptyOverlay(table.closest('.table-shell'), cfg.emptyCumulative);
    }

    function snake(scores) {
      const W = 88, H = 28, P = 4;
      if (scores.length < 2) return `<svg class="snake" width="${W}" height="${H}" aria-hidden="true"><text x="38" y="18" fill="#1a3a52" font-family="Oswald" font-size="11">—</text></svg>`;
      const lo = Math.min(...scores) - 0.3, hi = Math.max(...scores) + 0.3;
      const pts = scores.map((v, i) => [P + (i / (scores.length - 1)) * (W - P * 2), H - P - ((v - lo) / (hi - lo)) * (H - P * 2)]);
      let segs = '', dots = '';
      for (let i = 0; i < pts.length - 1; i++) {
        const col = scores[i + 1] >= scores[i] ? '#22c55e' : '#ef4444';
        segs += `<line x1="${pts[i][0].toFixed(1)}" y1="${pts[i][1].toFixed(1)}" x2="${pts[i + 1][0].toFixed(1)}" y2="${pts[i + 1][1].toFixed(1)}" stroke="${col}" stroke-width="2" stroke-linecap="round"/>`;
      }
      pts.forEach(([x, y], i) => {
        const last = i === pts.length - 1;
        const col = scores[i] >= (i ? scores[i - 1] : scores[i]) ? '#22c55e' : '#ef4444';
        dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${last ? 3 : 1.8}" fill="${last ? col : 'rgba(255,255,255,0.2)'}"/>`;
      });
      const dir = scores[scores.length - 1] >= scores[0] ? 'rising' : 'falling';
      return `<svg class="snake" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend ${dir}">${segs}${dots}</svg>`;
    }

    function addEmptyOverlay(shell, copy) {
      if (!shell || !copy) return;
      const o = document.createElement('div');
      o.className = 'table-empty';
      o.innerHTML = `<div class="table-empty-card"><span class="table-empty-icon" aria-hidden="true">${copy.icon || '⏳'}</span><strong>${esc(copy.title)}</strong><span>${esc(copy.text)}</span></div>`;
      shell.appendChild(o);
    }

    // ── HEAD-TO-HEAD ───────────────────────────────────────────────
    function renderH2H() {
      const tbl = $('h2hTable');
      if (!tbl) return;
      const wins = {}, wl = {}, pf = {};
      teams.forEach(t => { wins[t] = {}; wl[t] = { w: 0, l: 0 }; pf[t] = 0; });
      matches.forEach(m => {
        if (!wins[m.w] || !wins[m.l]) return;
        wins[m.w][m.l] = m.ws - m.ls;
        wl[m.w].w++; pf[m.w] += m.ws;
        wl[m.l].l++; pf[m.l] += m.ls;
      });
      const sorted = matches.length
        ? teams.slice().sort((a, b) => (wl[b].w - wl[a].w) || (pf[b] - pf[a]))
        : teams.slice().sort((a, b) => a.localeCompare(b));
      const abbr = cfg.abbr || {};
      const name = t => esc(displayName(t));

      let html = '<thead><tr><th class="rh" scope="col">Row vs column</th>';
      sorted.forEach(t => { html += `<th class="ch" scope="col" title="${name(t)}">${esc(abbr[t] || t)}</th>`; });
      html += '<th class="sh" scope="col">W–L</th><th class="sh" scope="col">PF</th></tr></thead><tbody>';
      sorted.forEach(r => {
        html += `<tr data-team="${esc(r)}"><td class="rh">${name(r)}</td>`;
        sorted.forEach(c => {
          if (r === c) html += '<td class="cs">—</td>';
          else if (wins[r][c] !== undefined) html += `<td class="cw" title="${name(r)} def. ${name(c)} by ${wins[r][c]}"><span class="cw-tag">W</span><span class="cw-mg">+${wins[r][c]}</span></td>`;
          else if (wins[c][r] !== undefined) html += `<td class="cl" title="${name(c)} def. ${name(r)} by ${wins[c][r]}"><span class="cl-tag">L</span><span class="cl-mg">−${wins[c][r]}</span></td>`;
          else html += '<td class="cn">·</td>';
        });
        html += `<td class="sc"><span class="sc-w">${wl[r].w}</span><span class="sc-d">–</span><span class="sc-l">${wl[r].l}</span></td>`;
        html += `<td class="sc"><span class="sc-pf">${pf[r].toLocaleString()}</span></td></tr>`;
      });
      tbl.innerHTML = html + '</tbody>';
      if (!matches.length) addEmptyOverlay(tbl.closest('.table-shell'), cfg.emptyH2H);
    }

    // ── ARCHIVE ────────────────────────────────────────────────────
    function renderArchive() {
      const grid = $('archiveGrid');
      if (grid && cfg.archive) {
        grid.innerHTML = cfg.archive.map(c => {
          let leader = c.leader || '';
          if (!leader && typeof c.round === 'number') {
            const scored = teams.filter(t => ppr[t][c.round] != null);
            if (scored.length) {
              const top = scored.reduce((a, b) => (ppr[b][c.round] > ppr[a][c.round] ? b : a));
              leader = `🥇 <strong>${esc(displayName(top))}</strong><span class="card-score">${ppr[top][c.round].toFixed(2)}</span>`;
            }
          }
          const badge = { done: ['badge-done', 'Complete'], latest: ['badge-live', '● Latest'], soon: ['badge-soon', 'Soon'], gf: ['badge-gf', c.badgeText || 'Final'] }[c.status || 'done'];
          const cls = ['week-card', c.status === 'latest' && 'live', c.status === 'soon' && 'soon', c.status === 'gf' && 'gf-card'].filter(Boolean).join(' ');
          const kicker = c.kicker && c.kicker !== c.title ? `<span class="card-round">${esc(c.kicker)}</span>` : '<span></span>';
          const inner = `
            <div class="card-top">${kicker}<span class="card-badge ${badge[0]}">${badge[1]}</span></div>
            <div class="card-title">${c.title}</div>
            ${leader ? `<div class="card-leader">${leader}</div>` : ''}
            ${c.href && c.status !== 'soon' ? '<span class="card-arrow" aria-hidden="true">→</span>' : ''}`;
          return c.href && c.status !== 'soon'
            ? `<a class="${cls}" href="${esc(c.href)}">${inner}</a>`
            : `<div class="${cls}" aria-disabled="true">${inner}</div>`;
        }).join('');
      }
      const extras = $('extrasGrid');
      if (extras && cfg.extras) {
        extras.innerHTML = cfg.extras.map(x => `
          <a class="extra-card" href="${esc(x.href)}">
            <span class="extra-icon" aria-hidden="true">${x.icon}</span>
            <span class="extra-title">${x.title}</span>
            <span class="extra-desc">${esc(x.desc)}</span>
          </a>`).join('');
      }
    }

    // ── POLLS (Firebase) ───────────────────────────────────────────
    async function renderPolls() {
      const P = cfg.polls;
      if (!P || !$('rows-spoon')) return;
      const FB = 'https://www.gstatic.com/firebasejs/10.12.0/';
      const config = {
        apiKey: 'AIzaSyD_vPHSuGEOST39l-aMuy7rhw4dUGb2qvc',
        authDomain: 'ligma-league.firebaseapp.com',
        projectId: 'ligma-league',
        storageBucket: 'ligma-league.firebasestorage.app',
        messagingSenderId: '869683799608',
        appId: '1:869683799608:web:26e62dc39dd627f86e68cd',
      };
      const MAX = 999999;
      const pollTeams = P.teams;
      const polls = [['spoon', P.docs.spoon], ['champ', P.docs.champ]];

      const fail = (poll, msg) => {
        const box = $(`rows-${poll}`);
        if (box) box.innerHTML = `<div class="poll-msg">${esc(msg)}</div>`;
        const tot = $(`total-${poll}`);
        if (tot) tot.textContent = P.open ? 'Voting not open yet' : 'Results unavailable';
        const pill = box && box.closest('.poll-card') && box.closest('.poll-card').querySelector('.live-pill');
        if (pill && P.open) { pill.classList.add('closed'); pill.innerHTML = '<span class="live-pill-dot"></span>Opening soon'; }
      };

      let fs, db;
      try {
        const [appMod, fsMod] = await Promise.all([import(FB + 'firebase-app.js'), import(FB + 'firebase-firestore.js')]);
        fs = fsMod;
        const app = appMod.getApps().length ? appMod.getApps()[0] : appMod.initializeApp(config);
        db = fs.getFirestore(app);
      } catch (e) {
        console.error('Firebase failed to load:', e);
        polls.forEach(([p]) => fail(p, P.open ? P.unavailableText : 'Results could not load. Refresh the page to try again.'));
        return;
      }

      const odoHTML = n => {
        const c = Math.min(n, MAX), s = String(c).padStart(6, '0'), lit = 6 - String(c).length;
        return Array.from(s).map((d, i) => `<div class="odo-digit${i >= lit ? ' lit' : ''}" data-v="${d}">${d}</div>`).join('');
      };
      const totalText = n => n.toLocaleString() + ' vote' + (n !== 1 ? 's' : '') + (P.open ? '' : ' · Final tally');

      polls.forEach(async ([poll, docId]) => {
        const ref = fs.doc(db, 'votes', docId);
        if (P.open) {
          try {
            const snap = await fs.getDoc(ref);
            if (!snap.exists()) {
              const init = {};
              pollTeams.forEach(t => { init[t] = 0; });
              await fs.setDoc(ref, init);
            }
          } catch (e) {
            console.error('Poll setup failed:', e);
            fail(poll, P.unavailableText);
            return;
          }
        }
        let first = true;
        fs.onSnapshot(ref, snap => {
          if (!snap.exists()) { fail(poll, P.open ? P.unavailableText : 'No votes were recorded for this poll.'); return; }
          const data = snap.data();
          if (P.open) { first ? renderOpen(poll, data) : patchOpen(poll, data); }
          else renderClosed(poll, data);
          first = false;
        }, err => { console.error('Poll listener failed:', err); fail(poll, P.open ? P.unavailableText : 'Results could not load. Refresh the page to try again.'); });
      });

      function renderClosed(poll, data) {
        const box = $(`rows-${poll}`);
        const vals = pollTeams.map(t => ({ t, n: data[t] ?? 0 }));
        const total = vals.reduce((a, b) => a + b.n, 0);
        const maxV = Math.max(1, ...vals.map(v => v.n));
        vals.sort((a, b) => b.n - a.n);
        const winner = poll === 'champ' ? P.result && P.result.champ : P.result && P.result.spoon;
        box.innerHTML = vals.map((v, i) => `
          <div class="team-row${v.t === winner ? ' is-winner' : ''}">
            <div class="team-row-bar" style="width:${(v.n / maxV) * 100}%"></div>
            <span class="team-num">${i + 1}</span>
            <span class="team-name">${esc(v.t)}${v.t === winner ? `<span class="winner-tag">${poll === 'champ' ? 'Champion' : 'Spooned'}</span>` : ''}</span>
            <div class="odo">${odoHTML(v.n)}</div>
            <span class="team-pct">${total ? Math.round((v.n / total) * 100) : 0}%</span>
          </div>`).join('');
        $(`total-${poll}`).textContent = totalText(total);
      }

      function renderOpen(poll, data) {
        const box = $(`rows-${poll}`);
        const vals = pollTeams.map(t => data[t] ?? 0);
        const maxV = Math.max(...vals, 1);
        box.innerHTML = pollTeams.map((t, i) => `
          <div class="team-row">
            <div class="team-row-bar" style="width:${(vals[i] / maxV) * 100}%"></div>
            <span class="team-num">${i + 1}</span>
            <span class="team-name">${esc(t)}</span>
            <div class="odo" id="odo-${poll}-${i}">${odoHTML(vals[i])}</div>
            <button type="button" class="vote-btn" data-i="${i}" aria-label="Vote for ${esc(t)}">Vote</button>
          </div>`).join('');
        box.querySelectorAll('.vote-btn').forEach(b => b.addEventListener('click', () => castVote(poll, +b.dataset.i, b)));
        $(`total-${poll}`).textContent = totalText(vals.reduce((a, b) => a + b, 0));
      }

      function patchOpen(poll, data) {
        const vals = pollTeams.map(t => data[t] ?? 0);
        const maxV = Math.max(...vals, 1);
        const rows = document.querySelectorAll(`#rows-${poll} .team-row`);
        vals.forEach((n, i) => {
          const odo = $(`odo-${poll}-${i}`);
          if (odo) {
            const s = String(Math.min(n, MAX)).padStart(6, '0'), lit = 6 - String(Math.min(n, MAX)).length;
            odo.querySelectorAll('.odo-digit').forEach((el, j) => {
              if (el.dataset.v !== s[j]) {
                el.dataset.v = s[j];
                el.textContent = s[j];
                el.classList.toggle('lit', j >= lit);
                el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
              }
            });
          }
          const bar = rows[i] && rows[i].querySelector('.team-row-bar');
          if (bar) bar.style.width = (n / maxV) * 100 + '%';
        });
        $(`total-${poll}`).textContent = totalText(vals.reduce((a, b) => a + b, 0));
      }

      async function castVote(poll, i, btn) {
        const team = pollTeams[i];
        const ref = fs.doc(db, 'votes', polls.find(p => p[0] === poll)[1]);
        btn.disabled = true;
        try {
          await fs.runTransaction(db, async tx => {
            const snap = await tx.get(ref);
            const curr = snap.exists() ? (snap.data()[team] ?? 0) : 0;
            if (curr >= MAX) return;
            tx.update(ref, { [team]: curr + 1 });
          });
          btn.textContent = '+1';
          btn.classList.add('voted');
        } catch (e) {
          console.error('Vote failed:', e);
          btn.textContent = 'Retry';
        }
        setTimeout(() => { btn.textContent = 'Vote'; btn.classList.remove('voted'); btn.disabled = false; }, 900);
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // MYSTERY MATCHUP WHEEL
  // ═══════════════════════════════════════════════════════════════════
  const AFL_PLAYERS = [
    "Alex Neal-Bullen", "Archie Ludowyke", "Ben Keays", "Billy Dowling", "Brayden Cook", "Callum Ah Chee",
    "Charlie Edwards", "Chayce Jones", "Daniel Curtin", "Darcy Fogarty", "Finnbar Maley", "Hugh Bond",
    "Indy Cotton", "Isaac Cumming", "Izak Rankine", "Jake Soligo", "James Borlase", "James Peatling",
    "Jordan Dawson", "Jordon Butts", "Josh Rachele", "Josh Worrell", "Lachlan McAndrew", "Lachlan Sholl",
    "Luke Nankervis", "Luke Pedlar", "Mark Keane", "Max Michalanney", "Mitchell Hinge", "Mitchell Marsh",
    "Nick Murray", "Oscar Ryan", "Reilly O'Brien", "Riley Thilthorpe", "Rory Laird", "Sam Berry",
    "Sid Draper", "Taylor Walker", "Toby Murray", "Tyler Welsh", "Wayne Milera", "Zac Taylor",
    "Ben Murphy", "Bruce Reville", "Cam Rayner", "Charlie Cameron", "Cody Curtin", "Conor McKenna",
    "Daniel Annable", "Darcy Fort", "Darcy Gardiner", "Darcy Wilmot", "Darragh Joyce", "Dayne Zorko",
    "Eric Hipwood", "Harris Andrews", "Henry Smith", "Hugh McCluggage", "Jack Payne", "James Tunstill",
    "Jarrod Berry", "Jaspa Fletcher", "Josh Dunkley", "Kai Lohmann", "Keidean Coleman", "Koby Evans",
    "Lachie Neale", "Levi Ashcroft", "Lincoln McCarthy", "Logan Morris", "Luke Beecken", "Luke Lloyd",
    "Noah Answerth", "Oscar Allen", "Reece Torrent", "Ryan Lester", "Sam Draper", "Sam Marshall",
    "Shadeau Brain", "Tai Hayes", "Tom Doedee", "Ty Gallop", "Will Ashcroft", "Will McLachlan",
    "Zac Bailey", "Zane Zakostelsky", "Adam Cerra", "Adam Saad", "Ashton Moir", "Ben Ainsworth",
    "Ben Camporeale", "Billy Wilson", "Blake Acres", "Brodie Kemp", "Campbell Chesser", "Cooper Lord",
    "Elijah Hollands", "Flynn Young", "Francis Evans", "George Hewett", "Harry Charleson", "Harry Dean",
    "Harry McKay", "Harry O'Farrell", "Hudson O'Keeffe", "Jack Ison", "Jacob Weitering", "Jagga Smith",
    "Jesse Motlop", "Jordan Boyd", "Lachie Fogarty", "Lachlan Cowan", "Lewis Young", "Liam Reidy",
    "Lucas Camporeale", "Marc Pittonet", "Matt Duffy", "Matthew Carroll", "Matthew Cottrell", "Mitch McGovern",
    "Nic Newman", "Nick Haynes", "Oliver Florent", "Oliver Hollands", "Patrick Cripps", "Rob Monahan",
    "Sam Walsh", "Talor Byrne", "Wade Derksen", "Will Hayward", "Zac Williams", "Angus Anderson",
    "Beau McCreery", "Billy Frampton", "Bobby Hill", "Brayden Maynard", "Charlie West", "Dan Houston",
    "Daniel McStay", "Darcy Cameron", "Darcy Moore", "Edward Allan", "Harry DeMattia", "Harry Perryman",
    "Harvey Harrison", "Iliro Smit", "Isaac Quaynor", "Jack Buller", "Jack Crisp", "Jai Saxena",
    "Jakob Ryan", "Jamie Elliott", "Jeremy Howe", "Joel Cochran", "Jordan De Goey", "Josh Daicos",
    "Lachie Schultz", "Lachlan Sullivan", "Ned Long", "Nick Daicos", "Noah Howes", "Oscar Steene",
    "Patrick Lipinski", "Reef McInnes", "Roan Steele", "Sam Swadling", "Scott Pendlebury", "Steele Sidebottom",
    "Tew Jiath", "Tim Membrey", "Tyan Prindable", "Wil Parker", "William Hayes", "Zac McCarthy",
    "Andrew McGrath", "Angus Clarke", "Archer Day-Wicks", "Archer May", "Archie Perkins", "Archie Roberts",
    "Ben McKay", "Brayden Fiorini", "Cillian Bourke", "Darcy Parish", "Dyson Sharp", "Elijah Tsatas",
    "Harrison Jones", "Hussien El Achkar", "Isaac Kako", "Jacob Farrow", "Jade Gresham", "Jaxon Prior",
    "Jayden Nguyen", "Jordan Ridley", "Jye Caldwell", "Kayle Gerreyn", "Kyle Langford", "Lachlan Blakiston",
    "Lewis Hayes", "Liam McMahon", "Mason Redman", "Matt Guelfi", "Max Kondogiannis", "Nate Caddy",
    "Nic Martin", "Nick Bryan", "Nik Cox", "Peter Wright", "Rhys Unwin", "Saad El-Hawli",
    "Sam Durham", "Sullivan Robey", "Thomas Edwards", "Vigo Visentini", "Will Setterfield", "Xavier Duursma",
    "Zach Merrett", "Zach Reid", "Zak Johnson", "Adam Sweid", "Aiden Riddle", "Alex Pearce",
    "Andrew Brayshaw", "Bailey Banfield", "Brandon Walker", "Brennan Cox", "Caleb Serong", "Charlie Nicholls",
    "Christopher Scerri", "Cooper Simpson", "Corey Wagner", "Hayden Young", "Heath Chapman", "Hugh Davies",
    "Isaiah Dudley", "Jaeger O'Meara", "Jaren Carr", "Jeremy Sharp", "Jordan Clark", "Josh Treacy",
    "Joshua Draper", "Judd McVee", "Jye Amiss", "Karl Worner", "Leon Kickett", "Luke Jackson",
    "Luke Ryan", "Mason Cox", "Matthew Johnson", "Michael Frederick", "Murphy Reid", "Nathan O'Driscoll",
    "Neil Erasmus", "Ollie Murphy", "Oscar McDonald", "Patrick Voss", "Ryda Luke", "Sam Sturt",
    "Sam Switkowski", "Sean Darcy", "Shai Bolton", "Toby Whan", "Tobyn Murray", "Bailey Smith",
    "Brad Close", "Cillian Burke", "Connor O'Sullivan", "George Stevens", "Gryan Miers", "Harley Barker",
    "Hunter Holmes", "Jack Bowes", "Jack Henry", "Jack Martin", "Jacob Molier", "Jake Kolodjashnij",
    "James Worpel", "Jay Polkinghorne", "Jed Bews", "Jeremy Cameron", "Jesse Mellor", "Jhye Clark",
    "Joe Pike", "Keighton Matofai-Forbes", "Lawson Humphries", "Lennox Hofmann", "Mark Blicavs", "Mark O'Connor",
    "Max Holmes", "Mitch Knevitt", "Mitchell Edwards", "Nicholas Driscoll", "Oisin Mullin", "Oliver Dempsey",
    "Oliver Henry", "Oliver Wiltshire", "Patrick Dangerfield", "Rhys Stanley", "Sam De Koning", "Shannon Neale",
    "Shaun Mannagh", "Tanner Bruhn", "Toby Conway", "Tom Atkins", "Tom Stewart", "Tyson Stengle",
    "Zach Guthrie", "Alex Davies", "Asher Eastham", "Avery Thomas", "Bailey Humphrey", "Beau Addinsall",
    "Ben Jepson", "Ben King", "Ben Long", "Bodhi Uwland", "Caleb Graham", "Caleb Lewis",
    "Charlie Ballard", "Christian Petracca", "Cooper Bell", "Daniel Rioli", "Dylan Patterson", "Elliott Himmelberg",
    "Ethan Read", "Jai Murray", "Jake Rogers", "Jamarra Ugle-Hagan", "Jarrod Witts", "Jed Walter",
    "Joel Jeffrey", "John Noble", "Jy Farrar", "Koby Coulson", "Lachie Weller", "Lachlan Gulbin",
    "Leonardo Lombard", "Mac Andrew", "Matt Rowell", "Max Knobel", "Ned Moyle", "Nick Holman",
    "Noah Anderson", "Oscar Adams", "Sam Clohesy", "Sam Collins", "Touk Miller", "Wil Powell",
    "Will Graham", "Zak Evans", "Zeke Uwland", "Aaron Cadman", "Brent Daniels", "Callum Brown",
    "Clayton Oliver", "Cody Angove", "Connor Idun", "Conor Stone", "Darcy Jones", "Finn Callaghan",
    "Finnegan Davis", "Harrison Oliver", "Harry Himmelberg", "Harry Rowston", "Harvey Thomas", "Jack Buckley",
    "Jack Ough", "Jake Riccardi", "Jake Stringer", "James Leake", "Jayden Laverde", "Jesse Hogan",
    "Joe Fonti", "Josaia Delana", "Josh Kelly", "Kieren Briggs", "Lachie Ash", "Lachie Whitfield",
    "Leek Aleer", "Logan Smith", "Max Gruzewski", "Nathan Wardius", "Nicholas Madden", "Oliver Hannaford",
    "Oskar Taylor", "Phoenix Gothard", "Riley Hamilton", "Ryan Angwin", "Sam Taylor", "Stephen Coniglio",
    "Toby Bedford", "Toby Greene", "Toby McMullin", "Tom Green", "Xavier O'Halloran", "Aidan Schubert",
    "Bailey Macdonald", "Blake Hardwick", "Bodie Ryan", "Calsher Dear", "Cam Mackenzie", "Cameron Nairn",
    "Cody Anderson", "Connor Macdonald", "Conor Nash", "Dylan Moore", "Finn Maginness", "Flynn Perez",
    "Harry Morrison", "Henry Hustwaite", "Jack Dalton", "Jack Ginnivan", "Jack Gunston", "Jack Scrimshaw",
    "Jai Newcombe", "Jaime Uhr-Henry", "James Blanck", "James Sicily", "Jarman Impey", "Josh Battle",
    "Josh Ward", "Josh Weddle", "Karl Amon", "Lloyd Meek", "Mabior Chol", "Massimo D'Ambrosio",
    "Matt Hill", "Matthew LeRay", "Max Ramsden", "Mitch Lewis", "Ned Reeves", "Nick Watson",
    "Noah Mraz", "Oliver Greeves", "Sam Butler", "Tom Barrass", "Will Day", "William McCabe",
    "Aidan Johnson", "Andy Moniz-Wakefield", "Bailey Laurie", "Bayley Fritsch", "Blake Howes", "Brody Mihocek",
    "Caleb Windsor", "Changkuoth Jiath", "Christian Salem", "Daniel Turner", "Ed Langdon", "Harrison Petty",
    "Harry Sharp", "Harvey Langford", "Jack Henderson", "Jack Steele", "Jack Viney", "Jacob van Rooyen",
    "Jai Culley", "Jake Bowey", "Jake Lever", "Jake Melksham", "Jed Adams", "Kade Chandler",
    "Kalani White", "Koltyn Tholstrup", "Kysaiah Pickett", "Latrelle Pickett", "Luker Kentfield", "Matthew Jefferson",
    "Max Gawn", "Max Heath", "Oscar Berry", "Paddy Cross", "Ricky Mentha", "Riley Onley",
    "Shane McAdam", "Steven May", "Thomas Matthews", "Tom Campbell", "Tom McDonald", "Tom Sparrow",
    "Trent Rivers", "Xavier Lindsay", "Xavier Taylor", "Aidan Corr", "Bailey Scott", "Blake Thredgold",
    "Brayden George", "Caleb Daniel", "Callum Coleman-Jones", "Cameron Zurhaar", "Charlie Comben", "Charlie Spargo",
    "Colby McKercher", "Cooper Harvey", "Cooper Trembath", "Dylan Stephens", "Finn O'Sullivan", "George Wardlaw",
    "Griffin Logue", "Harry Sheezel", "Hugo Mikunda", "Jack Darling", "Jackson Archer", "Jacob Konstanty",
    "Josh Goater", "Jy Simpkin", "Lachy Dovaston", "Luke Davies-Uniacke", "Luke McDonald", "Luke Parker",
    "Luke Urquhart", "Matt Whitlock", "Nick Larkey", "Paul Curtis", "Riley Hardeman", "River Stevens",
    "Robert Hansen Jr", "Taylor Goad", "Toby Pink", "Tom Blamires", "Tom Powell", "Tristan Xerri",
    "Wil Dawson", "Zac Banch", "Zac Fisher", "Zane Duursma", "Aliir Aliir", "Balyn O'Brien",
    "Benny Barrett", "Brandon Zerk-Thatcher", "Christian Moraes", "Connor Rozee", "Corey Durdin", "Dante Visentini",
    "Darcy Byrne-Jones", "Esava Ratugolea", "Ewan Mackinlay", "Harrison Ramm", "Ivan Soldo", "Jack Lukosius",
    "Jack Watkins", "Jack Whitlock", "Jackson Mead", "Jacob Moss", "Jacob Wehr", "Jase Burgoyne",
    "Jason Horne-Francis", "Joe Berry", "Joe Richards", "Jordon Sweet", "Josh Lai", "Josh Sinn",
    "Kane Farrell", "Lachie Jones", "Logan Evans", "Mani Liddy", "Miles Bergman", "Mitch Georgiades",
    "Mitch Zadow", "Ollie Lord", "Ollie Wines", "Sam Powell-Pepper", "Todd Marshall", "Tom Anastasopoulos",
    "Tom Cochrane", "Will Brodie", "Will Lorenz", "Willem Drew", "Xavier Walsh", "Zak Butters",
    "Ben Miller", "Campbell Gray", "Dion Prestia", "Harry Armstrong", "Hugo Ralphsmith", "Jack Ross",
    "Jacob Hopper", "James Trezise", "Jasper Alger", "Jayden Short", "Jonty Faull", "Josh Gibcus",
    "Josh Smillie", "Judson Clarke", "Kaleb Smith", "Kane McAuliffe", "Liam Fawcett", "Luke Trainor",
    "Maurice Rioli", "Mykelti Lefau", "Nathan Broad", "Nick Vlastuin", "Noah Balta", "Noah Roberts-Thomson",
    "Oliver Hayes-Brown", "Patrick Retschko", "Rhyan Mansell", "Sam Banks", "Sam Cumming", "Sam Grlj",
    "Sam Lalor", "Samson Ryan", "Seth Campbell", "Steely Green", "Taj Hotton", "Tim Taranto",
    "Toby Nankervis", "Tom Brown", "Tom Burton", "Tom Lynch", "Tom Sims", "Tyler Sonsie",
    "Zane Peucker", "Alex Dodson", "Alix Tauru", "Angus Hastie", "Anthony Caminiti", "Bradley Hill",
    "Callum Wilkie", "Charlie Banfield", "Cooper Sharman", "Dan Butler", "Darcy Wilson", "Dougal Howard",
    "Eamonn Armstrong", "Hugh Boxshall", "Hugo Garcia", "Hunter Clark", "Isaac Keeler", "Jack Carroll",
    "Jack Higgins", "Jack Macrae", "Jack Silvagni", "Jack Sinclair", "James Barrat", "Kobe McDonald",
    "Kye Fincher", "Lance Collard", "Liam Henry", "Liam O'Connell", "Liam Ryan", "Liam Stocker",
    "Marcus Windhager", "Mason Wood", "Mattaes Phillipou", "Max Hall", "Max King", "Mitch Owens",
    "Nasiah Wanganeen-Milera", "Paddy Dow", "Patrick Said", "Rowan Marshall", "Ryan Byrnes", "Sam Flanders",
    "Tobie Travaglia", "Tom De Koning", "Angus Sheldrick", "Billy Cootee", "Braeden Campbell", "Brodie Grundy",
    "Caiden Cleary", "Callum Mills", "Chad Warner", "Charlie Curnow", "Corey Warner", "Dane Rampe",
    "Errol Gulden", "Harry Cunningham", "Harry Kyle", "Hayden McLean", "Isaac Heeney", "Jai Serong",
    "Jake Lloyd", "James Jordon", "James Rowbottom", "Jesse Dattoli", "Jevan Phillipou", "Joel Amartey",
    "Joel Hamling", "Justin McInerney", "Lewis Melican", "Liam Hetherton", "Logan McDonald", "Malcolm Rosas",
    "Matt Roberts", "Ned Bowman", "Nick Blakey", "Noah Chamberlain", "Patrick Snell", "Peter Ladhams",
    "Riak Andrew", "Riley Bice", "Sam Wicks", "Taylor Adams", "Tom Hanily", "Tom McCartin",
    "Tom Papley", "William Edwards", "William Green", "Archer Reid", "Bailey J. Williams", "Bo Allan",
    "Brady Hough", "Brandon Starcevich", "Clay Hall", "Cooper Duff-Tytler", "Deven Robertson", "Elijah Hewett",
    "Elliot Yeo", "Finlay Macrae", "Fred Rodriguez", "Hamish Davis", "Harley Reid", "Harry Barnett",
    "Harry Edwards", "Harry Schoenberg", "Harvey Johnston", "Jack Graham", "Jack Hutchinson", "Jack Williams",
    "Jacob Newton", "Jake Waterman", "Jamie Cripps", "Jobe Shanahan", "Josh Lindsay", "Liam Baker",
    "Liam Duggan", "Lucca Grego", "Malakai Champion", "Matt Flynn", "Matthew Owies", "Milan Murdock",
    "Noah Long", "Reuben Ginbey", "Rhett Bazzo", "Ryan Maric", "Sam Allen", "Sandy Brock",
    "Tim Kelly", "Tom Cole", "Tom Gross", "Tom McCarthy", "Tylah Williams", "Tylar Young",
    "Tyler Brockman", "Tyrell Dewar", "Willem Duursma", "Aaron Naughton", "Adam Treloar", "Arthur Jones",
    "Bailey Dale", "Bailey Williams", "Buku Khamis", "Cody Weightman", "Connor Budarick", "Cooper Hynes",
    "Ed Richards", "Harvey Gallagher", "James Harmes", "James O'Donnell", "Jedd Busslinger", "Joel Freijah",
    "Jordan Croft", "Josh Dolan", "Lachie Jaques", "Lachlan Bramble", "Lachlan Carmichael", "Lachlan McNeil",
    "Lachlan Smith", "Laitham Vandermeer", "Louis Emmett", "Luke Cleary", "Luke Kennedy", "Marcus Bontempelli",
    "Matthew Kennedy", "Michael Sellwood", "Nick Coffield", "Oskar Baker", "Rhylee West", "Riley Garcia",
    "Rory Lobb", "Ryan Gardner", "Ryley Sanders", "Sam Darcy", "Sam Davidson", "Tim English",
    "Tom Liberatore", "Will Darcy", "Will Lewis", "Zac Walker",
  ];

  const ONE_LINERS = [
    'An unstoppable duo or a total disaster waiting to happen?',
    'The fantasy gods have spoken. No takebacks.',
    'This pairing makes absolutely no sense. Perfect.',
    'Somewhere, a trade offer is already being drafted.',
    'The Ligma League just got a little more chaotic.',
    'This is either genius or completely cooked.',
    "The scouts couldn't have predicted this one.",
    'Pure coincidence. Or is it destiny?',
    "You didn't choose the matchup. The matchup chose you.",
    'A combination only the Wheel could conjure.',
    'Two legends. One cursed pairing.',
    'Nobody saw this coming. Not even the algorithm.',
    "Paz would not approve. And that's exactly why it works.",
    'Filing a protest immediately.',
    'The fantasy gods are testing us today.',
    'Somewhere a coach just spat out their tea.',
    "Don't overthink it. The Wheel is always right.",
    'This pairing has no business going this hard.',
    'One is elite. One is... in the Ligma League.',
    'Statistically improbable. Emotionally inevitable.',
    "If this were a trade, someone would get roasted in the group chat.",
    'The commentators would lose their minds.',
    'This combo wakes up at 3am thinking about contested marks.',
    'Would be an elite podcast duo, no notes.',
    'Chaos energy. Maximum chaos energy.',
  ];

  const SLICE_COLORS = [
    ['#8b1a1a', '#a52020'], ['#1b2a3b', '#243549'], ['#6b3a1a', '#8b4a22'],
    ['#0d1a2b', '#162233'], ['#7a1a2a', '#952030'], ['#1a2b1a', '#223322'],
    ['#5a1a3a', '#721e48'], ['#1a1b3a', '#22234a'], ['#3a1a1a', '#4a2020'],
    ['#1a3a3a', '#1e4a4a'], ['#2a1a3a', '#35224a'], ['#1a3a1a', '#224a22'],
  ];
  const TEXT_COLORS = ['#f0c050', '#a0c8f0', '#f0a060', '#80b8f0', '#f08080', '#80d0a0', '#d080b0', '#8090f0', '#f0c080', '#60d0c0', '#c090e0', '#80d880'];

  function initWheel(WHEEL_TEAMS) {
    const canvas = $('wheelCanvas');
    if (!canvas || !WHEEL_TEAMS.length) return;
    const ctx = canvas.getContext('2d');
    const N = WHEEL_TEAMS.length;
    const slice = (2 * Math.PI) / N;
    let angle = 0, spinning = false;

    function draw(rot) {
      const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2, r = Math.min(cx, cy) - 4;
      ctx.clearRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(cx, cy, r - 4, cx, cy, r + 4);
      glow.addColorStop(0, 'rgba(200,169,81,0.5)');
      glow.addColorStop(1, 'rgba(200,169,81,0)');
      ctx.beginPath(); ctx.arc(cx, cy, r + 2, 0, 2 * Math.PI); ctx.strokeStyle = glow; ctx.lineWidth = 6; ctx.stroke();
      for (let i = 0; i < N; i++) {
        const a0 = rot + i * slice, a1 = a0 + slice, mid = a0 + slice / 2;
        const [c1, c2] = SLICE_COLORS[i % SLICE_COLORS.length];
        const g = ctx.createLinearGradient(cx + Math.cos(a0) * r * 0.3, cy + Math.sin(a0) * r * 0.3, cx + Math.cos(a1) * r * 0.9, cy + Math.sin(a1) * r * 0.9);
        g.addColorStop(0, c1); g.addColorStop(1, c2);
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a0, a1); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r);
        ctx.strokeStyle = 'rgba(200,169,81,0.25)'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(mid);
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        ctx.fillStyle = TEXT_COLORS[i % TEXT_COLORS.length];
        ctx.font = "700 13px 'Oswald', sans-serif";
        const label = WHEEL_TEAMS[i].length > 16 ? WHEEL_TEAMS[i].slice(0, 15) + '…' : WHEEL_TEAMS[i];
        ctx.fillText(label, r - 14, 0);
        ctx.restore();
      }
      const hub = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
      hub.addColorStop(0, '#c8a951'); hub.addColorStop(1, '#8b6a20');
      ctx.beginPath(); ctx.arc(cx, cy, 28, 0, 2 * Math.PI); ctx.fillStyle = hub; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#1b2a3b'; ctx.font = "15px 'Bebas Neue', sans-serif"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('PPR', cx, cy + 1);
    }

    const winnerIdx = rot => {
      const norm = ((-rot - Math.PI / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      return Math.floor(norm / slice) % N;
    };

    function showResult(idx, player) {
      $('result-placeholder').style.display = 'none';
      const card = $('result-card');
      card.style.display = 'block';
      card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
      $('rc-team').textContent = WHEEL_TEAMS[idx];
      $('rc-player').textContent = player;
      $('rc-oneliner').textContent = '\u201c' + ONE_LINERS[Math.floor(Math.random() * ONE_LINERS.length)] + '\u201d';
    }

    function spin() {
      if (spinning) return;
      spinning = true;
      const btn = $('spinBtn');
      btn.disabled = true;
      $('spinBtnText').textContent = 'SPINNING\u2026';
      $('result-card').style.display = 'none';
      $('result-placeholder').style.display = 'block';
      const target = Math.floor(Math.random() * N);
      const player = AFL_PLAYERS[Math.floor(Math.random() * AFL_PLAYERS.length)];
      const extra = (5 + Math.random() * 3) * 2 * Math.PI;
      const stop = -Math.PI / 2 - (target * slice + slice / 2);
      const end = angle - ((angle - stop) % (2 * Math.PI)) - extra;
      const start = angle;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const dur = reduce ? 1 : 4500 + Math.random() * 1000;
      const t0 = performance.now();
      const ease = t => 1 - Math.pow(1 - t, 4);
      (function frame(now) {
        const t = Math.min((now - t0) / dur, 1);
        angle = start + (end - start) * ease(t);
        draw(angle);
        if (t < 1) return requestAnimationFrame(frame);
        angle = end; draw(angle);
        spinning = false; btn.disabled = false;
        $('spinBtnText').textContent = 'SPIN';
        showResult(winnerIdx(angle), player);
      })(t0);
    }

    draw(angle);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => draw(angle));
    $('spinBtn').addEventListener('click', spin);
    $('spinAgainBtn').addEventListener('click', spin);
  }
})();
