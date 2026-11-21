// Roadmap detail: loads the platinum roadmap data and paints one card per
// stage into the detail panel below the existing stage cards. The module
// keeps its own fetched copy so a slow or failed fetch leaves the page
// usable — the tracker and the built-in stage cards still render.
let roadmapCache = null;

async function loadRoadmap() {
  if (roadmapCache) return roadmapCache;
  const res = await fetch('data/roadmap.json');
  if (!res.ok) throw new Error('roadmap.json ' + res.status);
  roadmapCache = await res.json();
  return roadmapCache;
}

function textEl(tag, text, cls) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  el.textContent = text;
  return el;
}

export async function renderRoadmapDetail() {
  const host = document.getElementById('roadmapDetail');
  if (!host) return;
  let doc;
  try {
    doc = await loadRoadmap();
  } catch {
    host.append(textEl('p', 'Roadmap detail could not be loaded.', 'srcNote'));
    return;
  }
  host.replaceChildren();
  host.append(textEl('h3', 'Platinum roadmap — ' + doc.hoursTotal + ' hours, difficulty ' + doc.difficulty));
  host.append(textEl('p', doc.saveDiscipline.rule + ' ' + doc.saveDiscipline.why, 'srcNote'));
  for (const stage of doc.stages) {
    const card = document.createElement('article');
    card.className = 'roadmapDetailCard';
    card.append(textEl('h4', stage.title + ' · ' + stage.hours + ' · ' + stage.trophies + ' trophies'));
    card.append(textEl('p', stage.goal));
    card.append(textEl('p', 'Before the point of no return: ' + stage.beforeIt, 'srcNote'));
    card.append(textEl('p', 'Point of no return: ' + stage.pointOfNoReturn, 'srcNote'));
    const steps = document.createElement('ol');
    for (const step of stage.steps) steps.append(textEl('li', step));
    card.append(steps);
    const checks = document.createElement('ul');
    for (const c of stage.checklist) {
      checks.append(textEl('li', c.label + ': ' + c.target + ' ' + c.unit));
    }
    card.append(checks);
    host.append(card);
  }
}
