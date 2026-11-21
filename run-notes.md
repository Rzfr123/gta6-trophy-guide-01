# Run notes — gta6-trophy-guide-01 "Vice City Ledger"

Built 21 Nov 2026, ~15:16–16:10 WIB. Deadline 21 Nov 18:00 WIB (11:00 UTC).
Entry: offline web app, guide + tracker for all 55 GTA VI PS5 trophies.
Repo: https://github.com/Rzfr123/gta6-trophy-guide-01 (created 21 Nov 2026, after the 19 Nov opening).

## (a) Top-entry analysis (user's method: look at the top of the leaderboard first)

Leaderboard fetched 21 Nov ~15:17 WIB via the make.fun API (6,556 rated entries at the time;
field later grew past 9,000 submissions). Top of the dev board:
- #1 tidy-meteor-25 "Trophy tracker" — 0.954816
- #2 kiencx "Mile Zero Casebook v3: 446/446 claims cited, 300 on 2+ sites, 65 pages from 23 sites" — 0.954816
- #3 bacot-kintil "The Leonida Ledger" — 0.953558
- #4 plntky "EXIT 55: every step cited, 22 sites" — 0.953558
- #5 swift-pika-45, #6 bold-shark-708 "Leonida Platinum Roadmap", #7 klencho "Neon Tide — cited guide & tracker",
  #8 keen-sparrow-96 "55/55 cited — 450 cited facts, 37 disputes", #9 el-net "Leonida Platinum Ledger: all 55 cited,
  missable box on every trophy page, points of no return, claim-level audit strip, spoiler shield",
  #10 ronigrv "Leonida Route Card: 535 cited claims, YOUR COUNT, missable windows, roadmap"

I viewed the judged artifact sheets (dossier contact sheets) of #1, #2 and #4. The winning pattern,
imitated here and modified into our own original guide (nothing copied byte-for-byte):
1. **Dense 3-pane layout**: filterable checklist left (grouped by roadmap stage), guide detail centre,
   Next-Up queue + per-trophy source list right.
2. **Audit strip** with quantified, checkable claims: 55/55 official name/description/grade, 1P 2G 6S 46B,
   28 PSN-hidden, N/N steps cited, N backed by 2+ sources, pages/sites + read date, missable count,
   disputes shown both ways, unconfirmed marked. Our strip is computed from the data at runtime, so it
   cannot disagree with the guide.
3. **Per-step citations** ([n] chips inline) + a numbered source list with "read <date> · N claims here".
4. **Count trackers** with −/+ buttons (ours: 18 meditations, 250 stunts, 42 range golds, 14 drone races,
   20 race wins, 8 strands, 3 card sets, 100 WAiNK, 50 challenges, 100 vehicles, 5 vaults, 52 areas,
   9 gangs, 8 garages, 10 Scooter Bros, $250k/$100k, 500 choices, 9 activity types, 3 shops, 5 enemies).
5. **Spoiler shield** toggle (hides hidden story trophies until earned, with Reveal), Export/Import,
   "Saved in this browser".
6. **"Sources differ — both versions shown"** dispute boxes with an "Our call" line, and unconfirmed
   triggers marked rather than invented (the judge gives no credit for an uncited specific step).
7. **Roadmap progress** per stage + a Missables page with the single possible missable and save discipline.

What we deliberately did NOT copy: names ("Leonida Platinum Log", "Mile Zero Casebook", "EXIT 55"),
their look (light paper / neon), their step text, or their exact counts. Our look is a dark night ledger;
our steps are our own words.

## (b) The finished guide

Serve `app/` with any static server and open `index.html` (no build step, no network).
Key files: `app/index.html`, `app/css/style.css`, `app/js/main.js` (boot),
`app/js/store.js` (localStorage progress, export/import), `app/js/filters.js` (kinds, search, spoiler rule),
`app/js/views.js` (checklist, detail, roadmap, missables, sources), `app/data/trophies.json`
(55 trophies + 15 sources + 4-stage roadmap). Screenshots in `screenshots/` (cover = tracker with the
Positive Mental Attitude guide open, spoiler shield on, 13/55 earned seeded).

Content grounding (all read 21 Nov 2026):
- Official names/descriptions/grades: the kit starter's frozen list (Exophase / PSNProfiles, 18 Nov 2026),
  verified name-for-name against it — 55/55 exact, 1P 2G 6S 46B.
- Roadmap numbers (PowerPyx, KeenGamer): difficulty 4/10, ~200 hours, 5 chapters, 60–80h story,
  100% checklist after the story (70 of 80 challenges; 200/277 vehicles; 100/255 animals; robberies,
  underwater discoveries, shooting ranges, drone races and Bret quests need everything), cheats disable
  trophies, no mission replay, 15 manual save slots.
- The one possibly-missable trophy (PowerPyx, KeenGamer, TechForNerd, HappyGamer): Positive Mental
  Attitude — Chapter 1 balcony meditation at Jason's house, morning after "Down to Earth"; follow Lucia
  and choose Accept. Whether it is required is unconfirmed (it raises the counter but is not a marked
  spot; only 15 of 18 are needed for 100%) — shown as a dispute, both versions, with our call.
- 18 meditations / 10 locations, 42 shooting-range golds / 12 ranges, 14 drone-race locations, 250 stunts
  (397 total), 5 bank vaults of 8, 39 gang operations, 15 card sets for 100%, 100 WAiNK / 33 underwater /
  100 flamingos for 100% (KeenGamer, PowerPyx, GTA-Zone).
- Honest limits, stated in the app: per-trophy hidden flags are our reconstruction of PSNProfiles'
  28-hidden list (story + side-story finales + cryptic-description trophies = 28; the 27 visible ones are
  those PSN shows from the start) — the total matches PSNProfiles, individual flags are not separately
  verifiable from the sources we could open (PSNProfiles itself returned 403 to our fetch). 6 trophies'
  exact triggers are marked UNCONFIRMED (Catch Me If You Can, Challenging Tank, Capital Offense,
  Personal Best, Bad Luck I Guess, The Truth Is Out There) rather than invented. Grade split noted:
  one guide lists 5S/47B vs PowerPyx + PSNProfiles 6S/46B; we follow the latter.

## (e) Local gate results (run from /tmp, absolute invocation, twice)

- `MAKEFUN_OUTPUT_DIR=/tmp/out1 node <repo>/main.ts` and same for out2: both succeed; `diff -r` identical.
- Dossier 1,040,604 bytes (< 1.5 MiB); dossier text 110,448 bytes (< 163,840).
- First load 6 files, 12,393 bytes gzip-9 (38,970 raw); whole app 7 files, 107,974 bytes
  (limits: 993 files, 48 MiB). Output 1,840,251 bytes total incl. screenshots + dossier.
- Screenshots: 4 JPEG, 1280×800, 132–215 KiB each (< 256 KiB); long side ≤ 1280, short side ≥ 480.
- trophies.json: 55 trophies, every name exact vs the official list, every guide non-blank;
  151/151 steps cited, 149 backed by 2+ sources; grades 1/2/6/46; hidden 28; story 12;
  missable 1; collectibles 7; activities 35; online 0.
- Network probe (Playwright, all requests logged): 7 requests, all same-origin (index, css, 4 js,
  trophies.json); 0 external requests. Checkbox toggle, tab switch, search, count buttons exercised live.
- Bug found by the probe and fixed: clicking a checklist checkbox was re-rendered away by the row's
  own click handler before the change event fired (earned stayed 0/55). Fixed by stopping propagation
  on the checkbox click; re-probed: toggle works (1/55).
- vendor/makefun-frontend.ts sha256 matches the kit's copy exactly.
- README 905 bytes (< 4096), with live badges + bounty link. Claim file `.makefun/owner.json`
  names wallet bDXdfcW6wZ1hmDZnnH4eJLhXEbYUkV7AAKZHagdnoPg.

## (f) Honest judgement of its chances

Field is brutal: ~6,500+ rated entries, top rate ~0.955, and the top 10 are all heavy citation
machines (400–500+ cited claims, 20+ sites, dispute tracking). Our entry matches their structure
(audit strip, 3-pane, cited steps, counts, spoiler shield, roadmap, missables, sources) but is
thinner on raw citation volume: 151 steps / 15 pages / 14 sites vs their 300–500 claims / 20–65 pages.
Against the house anchors (weak→strong) it should beat the starter-level guides clearly; against the
top-10 style entries it is a credible mid-to-upper entry but unlikely to crack the top 50 (which pays
$3) — the judge's first criterion is the tracker/data (we are complete there), the second is roadmap +
missables (we are strong there), the third is cited guidance (we are solid but outgunned on volume).
Realistic expectation: a valid entry, a decent provisional rate, paid place unlikely. The main risk to
validity is nil on the local gates; the residual risk is the finalist review's hidden-flag and
originality checks, which we have documented honestly in the app.

## Handoff for the coordinator (bundle + submit)

- DO NOT re-shoot: screenshots in `screenshots/` are final (seeded 13/55, PMA 6/18).
- Repo + commit sha are in the build agent's report (this file's header + git log).
- Prompt file `~/workspace/makefun/gta6-trophy-guide-01-prompt.txt` ("Kerjakan juga yang lain") untouched.
- No submission made by this agent; quota untouched (0 made, can_submit=true at build time).
