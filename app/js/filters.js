// Filtering, ordering and the spoiler rule for the trophy list.
// Kinds are tags on each trophy: story, missable, collectibles, activities.
// A trophy can carry more than one kind; "online" matches nothing (the game
// lists no online trophies) and is shown as 0 on purpose.
export const GRADE_RANK = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export const STAGE_LABELS = {
  1: 'Stage 1 · Story, Chapters 1–2',
  2: 'Stage 2 · Story, Chapters 3–5 + finale',
  3: 'Stage 3 · Side stories & activities',
  4: 'Stage 4 · Collectibles, counts & 100%',
};

export function kindMatches(trophy, kind, earned) {
  switch (kind) {
    case 'all': return true;
    case 'story': return trophy.kinds.includes('story');
    case 'missable': return trophy.kinds.includes('missable');
    case 'collectibles': return trophy.kinds.includes('collectibles');
    case 'activities': return trophy.kinds.includes('activities');
    case 'online': return trophy.kinds.includes('online');
    case 'hidden': return trophy.hidden === true;
    case 'disputed': return Boolean(trophy.dispute);
    case 'unconfirmed': return trophy.unconfirmed === true;
    case 'notearned': return !earned.has(trophy.name);
    default: return true;
  }
}

export function spoilerMasks(trophy, spoilerOn, earned) {
  return spoilerOn && trophy.hidden === true && !earned.has(trophy.name);
}

export function applyFilters(trophies, { kind, grade, query }, earned) {
  const q = query.trim().toLowerCase();
  return trophies.filter((t) => {
    if (!kindMatches(t, kind, earned)) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (q) {
      const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function orderList(list, order) {
  const copy = [...list];
  if (order === 'grade') {
    copy.sort((a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade] || a.id - b.id);
  } else if (order === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    copy.sort((a, b) => a.stage - b.stage || a.id - b.id);
  }
  return copy;
}

export function nextUpQueue(trophies, earned, limit = 5) {
  return trophies
    .filter((t) => !earned.has(t.name))
    .sort((a, b) => a.stage - b.stage || a.id - b.id)
    .slice(0, limit);
}

export function stageProgress(trophies, earned) {
  const out = {};
  for (const t of trophies) {
    out[t.stage] = out[t.stage] || { total: 0, done: 0 };
    out[t.stage].total += 1;
    if (earned.has(t.name)) out[t.stage].done += 1;
  }
  return out;
}
