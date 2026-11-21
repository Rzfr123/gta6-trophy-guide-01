// Vice City Ledger — a gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide is plain static files under app/: index.html, its ES modules, the
// stylesheet and app/data/trophies.json. It opens in desktop Chrome and works
// with the network off, loading nothing from outside app/. This program hands
// the entry in: it copies app/ and screenshots/ from beside this file to
// /output and writes /output/dossier.json with the vendored make.fun library
// (vendor/makefun-frontend.ts — the kit's copy, unchanged; the scorer rebuilds
// the dossier with its own copy and compares the two byte for byte, so that
// file must stay exactly as shipped).
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Serve the guide locally with any static server rooted at app/, for example:
//   python3 -m http.server --directory app

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Every path below is resolved against this file, never against the working
// directory, so the grader can run it from anywhere.
const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast, before copying anything, when the entry is incomplete: the
// trophy data must exist and parse as JSON with 55 trophies, and screenshots/
// must hold 3 or 4 images. A half-built output would fail the gate anyway,
// so surfacing it here saves a wasted grading run.
const trophyPath = join(here, 'app', 'data', 'trophies.json');
const trophyDoc = JSON.parse(readFileSync(trophyPath, 'utf8'));
if (!Array.isArray(trophyDoc.trophies) || trophyDoc.trophies.length !== 55) {
  throw new Error(`trophies.json must hold 55 trophies, found ${trophyDoc.trophies?.length ?? 0}`);
}
const shotCount = readdirSync(join(here, 'screenshots'))
  .filter((f) => /\.(png|jpe?g)$/i.test(f)).length;
if (shotCount < 3 || shotCount > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shotCount}`);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the bytes; the other
// limits refuse an entry the scorer would refuse (more than 4 screenshots or
// one over 256 KiB; more than 993 files and directories in app/ or 48 MiB of
// app files — app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
