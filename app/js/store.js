// Progress store: earned trophies plus per-trophy count trackers.
// Saved in localStorage under one key; export writes a JSON file and import
// reads one back. The store never touches the network.
export const STORE_KEY = 'vice-city-ledger-v1';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { earned: [], counts: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { earned: [], counts: {} };
    const earned = Array.isArray(parsed.earned)
      ? parsed.earned.filter((n) => typeof n === 'string')
      : [];
    const counts = parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {};
    return { earned, counts };
  } catch {
    return { earned: [], counts: {} };
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or blocked in this browser: in-memory state still works.
  }
}

export function earnedSet(progress) {
  return new Set(progress.earned);
}

export function toggleEarned(progress, name) {
  const set = earnedSet(progress);
  if (set.has(name)) set.delete(name);
  else set.add(name);
  progress.earned = [...set];
  saveProgress(progress);
  return progress;
}

export function setCount(progress, name, value, need) {
  const clamped = Math.max(0, Math.min(need, Math.round(value)));
  progress.counts[name] = clamped;
  saveProgress(progress);
  return clamped;
}

export function exportProgress(progress) {
  const payload = {
    app: 'vice-city-ledger',
    exportedAt: new Date().toISOString(),
    earned: progress.earned,
    counts: progress.counts,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vice-city-ledger-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importProgress(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const earned = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(earned)) throw new Error('not a progress file');
  const counts = parsed && typeof parsed === 'object'
    && parsed.counts && typeof parsed.counts === 'object' ? parsed.counts : {};
  return { earned: earned.filter((n) => typeof n === 'string'), counts };
}
