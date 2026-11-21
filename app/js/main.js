// Vice City Ledger boot: load the trophy data, wire the controls, render.
// State lives in one object; progress (earned + counters) in localStorage
// via store.js. The app fetches only its own data/trophies.json, nothing else.
import { loadProgress, saveProgress, toggleEarned, setCount, exportProgress, importProgress } from './store.js';
import { applyFilters, orderList } from './filters.js';
import {
  renderAudit, renderHeaderCounts, renderList, renderDetail,
  renderNextUp, renderRailSources, renderRoadmap, renderMissables, renderSources,
} from './views.js';

const state = {
  tab: 'tracker',
  kind: 'all',
  grade: 'all',
  query: '',
  order: 'roadmap',
  spoiler: true,
  selected: 'Positive Mental Attitude',
  counts: {},
};

let doc = null;
let progress = loadProgress();
state.counts = progress.counts;

function earned() {
  return new Set(progress.earned);
}

function selectedTrophy() {
  return doc.trophies.find((t) => t.name === state.selected) || doc.trophies[0];
}

function renderAll() {
  const set = earned();
  renderHeaderCounts(doc, set);
  renderAudit(doc, set);
  const filtered = orderList(applyFilters(doc.trophies, state, set), state.order);
  renderList(doc, filtered, state, set,
    (t) => { state.selected = t.name; renderAll(); },
    (t) => { progress = toggleEarned(progress, t.name); state.counts = progress.counts; renderAll(); },
    (t) => { state.selected = t.name; state.spoiler = false; document.getElementById('spoiler').checked = false; renderAll(); });
  renderDetail(doc, selectedTrophy(), state, set,
    (t) => { progress = toggleEarned(progress, t.name); state.counts = progress.counts; renderAll(); },
    (t, d) => {
      if (!t.count) return;
      const cur = state.counts[t.name] ?? 0;
      state.counts[t.name] = setCount(progress, t.name, cur + d, t.count.need);
      renderAll();
    });
  renderNextUp(doc, set);
  renderRailSources(doc, selectedTrophy());
  renderRoadmap(doc, set);
  renderMissables(doc);
  renderSources(doc);
}

function switchTab(tab) {
  state.tab = tab;
  for (const b of document.querySelectorAll('.tabs button')) {
    b.classList.toggle('active', b.dataset.tab === tab);
  }
  for (const v of document.querySelectorAll('main .view')) v.hidden = true;
  document.getElementById(`view-${tab}`).hidden = false;
  document.getElementById('filterBar').style.display = tab === 'tracker' ? '' : 'none';
}

async function boot() {
  const res = await fetch('data/trophies.json');
  doc = await res.json();

  for (const b of document.querySelectorAll('.tabs button')) {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  }
  for (const b of document.querySelectorAll('#filterBar [data-kind]')) {
    b.addEventListener('click', () => {
      state.kind = b.dataset.kind;
      for (const x of document.querySelectorAll('#filterBar [data-kind]')) x.classList.toggle('active', x === b);
      renderAll();
    });
  }
  for (const b of document.querySelectorAll('.gradeFilter [data-grade]')) {
    b.addEventListener('click', () => {
      state.grade = state.grade === b.dataset.grade ? 'all' : b.dataset.grade;
      for (const x of document.querySelectorAll('.gradeFilter [data-grade]')) x.classList.toggle('active', x.dataset.grade === state.grade);
      renderAll();
    });
  }
  document.getElementById('search').addEventListener('input', (e) => { state.query = e.target.value; renderAll(); });
  document.getElementById('order').addEventListener('change', (e) => { state.order = e.target.value; renderAll(); });
  document.getElementById('spoiler').addEventListener('change', (e) => { state.spoiler = e.target.checked; renderAll(); });
  document.getElementById('exportBtn').addEventListener('click', () => exportProgress(progress));
  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      progress = await importProgress(file);
      state.counts = progress.counts;
      saveProgress(progress);
    } catch {
      alert('That file is not a Vice City Ledger progress export.');
    }
    e.target.value = '';
    renderAll();
  });

  renderAll();
}

boot();
