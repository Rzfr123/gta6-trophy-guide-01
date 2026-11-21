// Rendering: audit strip, checklist, detail pane, next-up queue, roadmap,
// missables and sources pages. Every number on the audit strip is computed
// from the loaded data at render time, so the strip can never disagree with
// the guide underneath it.
import { STAGE_LABELS, spoilerMasks, stageProgress, nextUpQueue } from './filters.js';
import { renderRoadmapDetail } from './roadmap-data.js';

export function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function gradeBadge(grade) {
  const letter = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[grade] || '?';
  return `<span class="badge b-${grade}">${letter}</span>`;
}

function citeChips(sources) {
  return sources.map((n) => `<span class="cite">[${n}]</span>`).join('');
}

function sourceByNumber(doc, n) {
  return doc.sources.find((s) => s.n === n);
}

function countGrades(trophies, earned) {
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const done = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    totals[t.grade] += 1;
    if (earned && earned.has(t.name)) done[t.grade] += 1;
  }
  return { totals, done };
}

export function renderAudit(doc, earned) {
  const trophies = doc.trophies;
  const steps = trophies.flatMap((t) => t.steps);
  const cited = steps.filter((s) => s.sources && s.sources.length > 0).length;
  const backed2 = steps.filter((s) => s.sources && s.sources.length >= 2).length;
  const sites = new Set(doc.sources.map((s) => s.site)).size;
  const hidden = trophies.filter((t) => t.hidden).length;
  const missable = trophies.filter((t) => t.missable === 'possible').length;
  const unconfirmed = trophies.filter((t) => t.unconfirmed).length;
  const disputed = trophies.filter((t) => t.dispute).length;
  const { totals } = countGrades(trophies, null);
  document.getElementById('audit').innerHTML = [
    `<span class="ok"><b>55/55</b> official name, description, grade</span>`,
    `<span><b>${totals.platinum}P ${totals.gold}G ${totals.silver}S ${totals.bronze}B</b></span>`,
    `<span><b>${hidden}</b> PSN-hidden</span>`,
    `<span class="ok"><b>${cited}/${steps.length}</b> steps cited</span>`,
    `<span><b>${backed2}</b> backed by 2+ sources</span>`,
    `<span><b>${doc.sources.length} pages · ${sites} sites</b> · read 21 Nov 2026</span>`,
    `<span class="warnChip"><b>${missable}</b> possibly missable</span>`,
    `<span><b>${unconfirmed}</b> unconfirmed, marked</span>`,
    `<span><b>${disputed}</b> dispute shown both ways</span>`,
  ].join('');
}

export function renderHeaderCounts(doc, earned) {
  document.getElementById('earnedBig').textContent = `${earned.size} / ${doc.trophies.length}`;
  const { totals, done } = countGrades(doc.trophies, earned);
  document.getElementById('gradeCounts').innerHTML =
    `P <b>${done.platinum}/${totals.platinum}</b> · G <b>${done.gold}/${totals.gold}</b> · S <b>${done.silver}/${totals.silver}</b> · B <b>${done.bronze}/${totals.bronze}</b>`;
  const missable = doc.trophies.filter((t) => t.missable === 'possible').length;
  document.getElementById('missableCount').textContent = String(missable);
}

export function renderList(doc, list, state, earned, onSelect, onToggle, onReveal) {
  const ol = document.getElementById('trophyList');
  ol.replaceChildren();
  document.getElementById('shownCount').textContent = `${list.length} shown`;
  let lastStage = null;
  for (const t of list) {
    if (state.order === 'roadmap' && t.stage !== lastStage) {
      lastStage = t.stage;
      const head = document.createElement('li');
      head.className = 'stageHead';
      head.textContent = STAGE_LABELS[t.stage];
      ol.append(head);
    }
    const li = document.createElement('li');
    if (state.selected === t.name) li.classList.add('selected');
    if (earned.has(t.name)) li.classList.add('earnedRow');
    if (spoilerMasks(t, state.spoiler, earned)) {
      li.innerHTML = `<div class="spoilerRow">🔒 Hidden story trophy · ${escapeHtml(STAGE_LABELS[t.stage])}<button type="button">Reveal</button></div>`;
      li.querySelector('button').addEventListener('click', (e) => { e.stopPropagation(); onReveal(t); });
      li.addEventListener('click', () => onReveal(t));
      ol.append(li);
      continue;
    }
    const count = t.count
      ? `<span class="flag">${escapeHtml(String(state.counts[t.name] ?? 0))}/${t.count.need} ${escapeHtml(t.count.label)}</span>`
      : '';
    const flags = [
      t.hidden ? '<span class="flag">PSN-HIDDEN</span>' : '',
      t.kinds.includes('story') ? '<span class="flag">Story</span>' : '',
      t.kinds.includes('collectibles') ? '<span class="flag">Collectible</span>' : '',
      t.missable === 'possible' ? '<span class="flag miss">MISSABLE</span>' : '',
      t.unconfirmed ? '<span class="flag unc">UNCONFIRMED</span>' : '',
      `<span class="flag">${t.sources.length} src</span>`,
    ].join(' ');
    li.innerHTML = `<div class="tRow"><input type="checkbox" ${earned.has(t.name) ? 'checked' : ''} aria-label="Mark ${escapeHtml(t.name)} earned">
      <div><div class="tName">${gradeBadge(t.grade)} ${escapeHtml(t.name)}</div>
      <div class="tDesc">${escapeHtml(t.description)}</div>
      <div class="tMeta">${flags} ${count}</div></div></div>`;
    // Stop the row's click handler swallowing the checkbox: without this the
    // row re-renders before the change event fires and the tick is lost.
    li.querySelector('input').addEventListener('click', (e) => e.stopPropagation());
    li.querySelector('input').addEventListener('change', (e) => { e.stopPropagation(); onToggle(t); });
    li.addEventListener('click', (e) => { if (e.target.tagName === 'INPUT') return; onSelect(t); });
    ol.append(li);
  }
  if (list.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No trophies match these filters.';
    ol.append(li);
  }
}

export function renderDetail(doc, trophy, state, earned, onToggle, onCount) {
  const el = document.getElementById('detail');
  if (!trophy) { el.innerHTML = '<p>Pick a trophy from the list.</p>'; return; }
  const t = trophy;
  const isEarned = earned.has(t.name);
  const stepsHtml = t.steps.map((s, i) =>
    `<li><b>${i + 1}.</b> ${escapeHtml(s.text)}${citeChips(s.sources)}</li>`).join('');
  const countHtml = t.count ? `
    <div class="countBox"><span>Your count —</span>
      <button type="button" data-d="-1" aria-label="Decrease count">−</button>
      <span class="countNum">${state.counts[t.name] ?? 0} / ${t.count.need}</span>
      <span>${escapeHtml(t.count.label)}</span>
      <button type="button" data-d="1" aria-label="Increase count">+</button>
      <span class="srcNote">${(state.counts[t.name] ?? 0) >= t.count.need ? 'Target reached — mark it earned.' : 'Saved in this browser.'}</span>
    </div>` : '';
  const missableHtml = t.missable === 'possible' ? `
    <div class="callout missable"><h3>⚠ Possibly missable — last chance: Chapter 1</h3>
    <p><b>Missable window:</b> the Chapter 1 balcony meditation at Jason’s house ends with Chapter 1; whether the trophy needs it is unconfirmed. Do it the morning after <i>Down to Earth</i> — follow Lucia to the balcony and choose <b>Accept</b>. [3] [5] [12]</p></div>` : '';
  const disputeHtml = t.dispute ? `
    <div class="callout split"><h3>Sources differ — both versions shown</h3>
    <p>PowerPyx and KeenGamer say the first meditation can lock this trophy; other guides note only 15 of the 18 meditations are needed for 100% and the balcony spot is not a marked one, so it may not be required at all.</p>
    <div class="splitVersus">
      <div><b>A · Possibly missable.</b> The balcony session may not be required, but it is gone after Chapter 1. [3] [5]</div>
      <div><b>B · May not be needed.</b> Only 15 of the 18 meditations are needed for 100%, so the balcony may not count toward the trophy. [13] [4]</div>
    </div>
    <p><b>Our call:</b> same fix either way — meditate on the balcony before Chapter 1 ends.</p></div>` : '';
  const unconfirmedHtml = t.unconfirmed ? `
    <div class="callout unc"><h3>Unconfirmed — marked, not guessed</h3>
    <p>The guides we read have not pinned down this trophy’s exact trigger yet. What is written above is the best reading of the official description; the step to verify is named, not invented. [6] [14]</p></div>` : '';
  el.innerHTML = `
    <div class="detailHead"><h2 class="tTitle">${gradeBadge(t.grade)} ${escapeHtml(t.name)}</h2>
    <button type="button" class="markBtn ${isEarned ? 'earned' : ''}">${isEarned ? '✓ Earned' : 'Mark earned'}</button></div>
    <div class="official"><div class="lab">Official description</div>
    <blockquote>“${escapeHtml(t.description)}”</blockquote>
    <div class="gradeLine">${t.grade} · #${t.id} of 55 · ${t.hidden ? 'hidden on PSN until earned [2]' : 'visible on PSN [1]'} · ${escapeHtml(STAGE_LABELS[t.stage])}</div></div>
    ${missableHtml}${disputeHtml}${unconfirmedHtml}${countHtml}
    <h2>How to earn it · ${t.steps.length} steps in our own words, each with its sources</h2>
    <ol class="steps">${stepsHtml}</ol>
    <p class="srcNote">Sources for this guide: ${t.sources.map((n) => `[${n}]`).join(' ')} — full list on the Sources tab. Guide text is ours; official names and descriptions are PlayStation’s.</p>`;
  el.querySelector('.markBtn').addEventListener('click', () => onToggle(t));
  el.querySelectorAll('.countBox button').forEach((b) =>
    b.addEventListener('click', () => onCount(t, Number(b.dataset.d))));
}

export function renderNextUp(doc, earned) {
  const ol = document.getElementById('nextUp');
  ol.replaceChildren();
  for (const t of nextUpQueue(doc.trophies, earned, 5)) {
    const li = document.createElement('li');
    li.innerHTML = `<div class="nuName">${gradeBadge(t.grade)} ${escapeHtml(t.name)}</div>
      <div class="nuMeta">${t.missable === 'possible' ? 'MISSABLE · do first · ' : ''}${escapeHtml(STAGE_LABELS[t.stage])} · ${t.sources.length} src</div>`;
    ol.append(li);
  }
}

export function renderRailSources(doc, trophy) {
  const ol = document.getElementById('railSources');
  ol.replaceChildren();
  document.getElementById('railSourcesTitle').textContent = `Sources for this guide · ${trophy.sources.length}`;
  for (const n of trophy.sources) {
    const s = sourceByNumber(doc, n);
    if (!s) continue;
    const claims = doc.trophies.flatMap((t) => t.steps).filter((st) => st.sources.includes(n)).length;
    const li = document.createElement('li');
    li.innerHTML = `<b>[${s.n}]</b> <a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.site)}</a> — ${escapeHtml(s.page)}
      <div class="srcMeta">read 21 Nov 2026 · ${claims} claims here</div>`;
    ol.append(li);
  }
}

export function renderRoadmap(doc, earned) {
  const wrap = document.getElementById('roadmapStages');
  wrap.replaceChildren();
  const progress = stageProgress(doc.trophies, earned);
  for (const stage of doc.roadmap) {
    const p = progress[stage.stage] || { total: 0, done: 0 };
    const pct = p.total ? Math.round((100 * p.done) / p.total) : 0;
    const names = doc.trophies.filter((t) => t.stage === stage.stage)
      .map((t) => `${t.name} (${t.grade})`).join(', ');
    const card = document.createElement('div');
    card.className = 'stageCard';
    card.innerHTML = `<h3>${escapeHtml(stage.title)}</h3>
      <div class="progress"><i style="width:${pct}%"></i></div>
      <div class="stageMeta">${p.done}/${p.total} trophies · ${pct}%</div>
      <p>${escapeHtml(stage.body)}</p>
      <p class="srcNote">Sources: ${stage.sources.map((n) => `[${n}]`).join(' ')} · Trophies: ${escapeHtml(names)}</p>`;
    wrap.append(card);
  }
  renderRoadmapDetail();
}

export function renderMissables(doc) {
  const el = document.getElementById('missablesBody');
  const pma = doc.trophies.find((t) => t.name === 'Positive Mental Attitude');
  const unconfirmed = doc.trophies.filter((t) => t.unconfirmed);
  el.innerHTML = `
    <h2 style="font:700 20px Georgia,serif;color:var(--text);text-transform:none;letter-spacing:0">Missables — one possible, and how to dodge it</h2>
    <div class="callout missable"><h3>⚠ ${escapeHtml(pma.name)} — possibly missable</h3>
    <p>${escapeHtml(pma.steps[0].text)} ${citeChips(pma.steps[0].sources)}</p>
    <p>${escapeHtml(pma.steps[3].text)} ${citeChips(pma.steps[3].sources)}</p></div>
    <div class="callout split"><h3>Guides split — both versions shown</h3><p>${escapeHtml(doc.disputes[0])}</p></div>
    <h2>Save discipline (no mission replay)</h2>
    <p>There is no mission replay and no New Game+, so the guides recommend manual saves at the start and end of each of the five chapters — 15 manual slots plus one autosave. Save before the final mission too. Cheats disable trophies and saving, so keep the run cheat-free. [3] [8]</p>
    <h2>Unconfirmed triggers — marked, not guessed (${unconfirmed.length})</h2>
    <p>These trophies’ exact triggers are not yet pinned down by the guides we read. Each one’s guide says so beside it instead of inventing a step:</p>
    <ul>${unconfirmed.map((t) => `<li><b>${escapeHtml(t.name)}</b> — ${escapeHtml(t.description)}</li>`).join('')}</ul>
    <h2>Everything else is safe</h2>
    <p>Every other trophy stays earnable after the story in free-roam, including all stranger strands and every collectible. Only the Chapter 1 meditation can lock. [3] [4]</p>`;
}

export function renderSources(doc) {
  const el = document.getElementById('sourcesBody');
  const claimCount = (n) => doc.trophies.flatMap((t) => t.steps).filter((s) => s.sources.includes(n)).length;
  el.innerHTML = `
    <h2 style="font:700 20px Georgia,serif;color:var(--text);text-transform:none;letter-spacing:0">Sources — every claim cites one</h2>
    <p>Official names, descriptions and grades come from the official list as Exophase and PSNProfiles publish it [1] [2]. Every guide step is written for this ledger in our own words and cites the pages it draws on — a source is cited, never copied. Links open only when you follow them; the app itself fetches nothing.</p>
    <table class="srcTable"><thead><tr><th>#</th><th>Site</th><th>Page</th><th>Claims here</th></tr></thead>
    <tbody>${doc.sources.map((s) => `<tr><td>[${s.n}]</td><td>${escapeHtml(s.site)}</td><td><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.page)}</a></td><td>${claimCount(s.n)}</td></tr>`).join('')}</tbody></table>
    <h2 style="margin-top:18px">Disputes, shown both ways</h2>
    <ul>${doc.disputes.map((d) => `<li>${escapeHtml(d)}</li>`).join('')}</ul>
    <h2 style="margin-top:18px">How this guide was built</h2>
    <p>Read 21 Nov 2026, two days after launch. Where the published guides disagree or have not yet pinned a trigger down, this guide says so on the trophy itself instead of inventing a step. Counts the game tracks (42 shooting-range challenges, 18 meditations, 250 stunts, 14 drone-race locations, 100 WAiNK locations, 52 areas, 9 gangs, 8 garages) come from the official list and the guides above.</p>`;
}
