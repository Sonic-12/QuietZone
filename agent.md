# agent.md — QuietZone handoff

Last updated by: Claude, session 2026-10-15 (owner: Lohit)

## What this is
QuietZone: disaster information-gap dashboard (hackathon prototype). Flags areas lacking reliable reports or recent field verification. All data is synthetic. Score = verification priority, not emergency probability.

## Stack / run
Vite + React 19, Tailwind v4 (`@tailwindcss/vite`), lucide-react, leaflet (plain, no react-leaflet), LocalStorage. No backend.
- Dev: `npm install && npm run dev`
- Build: `npm run build` · Logic tests: `npm test` (node:test)

## Project state
Branch/VCS: none (not a git repo). Workspace was empty at start; project created from scratch in `quietzone/`.

### Completed
- Scoring (`src/lib/priority.js`): weights .40/.20/.25/.15, thresholds 75/50/25, age cap 72 h, fresh window 12 h; clamping, zero/missing safe, max-pop 0 safe; per-factor breakdown + explanation text.
- Effective status: stored "safe" expires to Verification Required after 12 h. Confirmed Emergency only via operator "Assistance required" outcome.
- Data (`src/lib/data.js`): 2 synthetic scenarios (delta flood 10 areas, cyclone 8 areas), reducer (investigate / report / verify), per-scenario LocalStorage, corrupt-storage recovery, activity feed with status/critical-flag events.
- Views: Overview (4 computed cards, Leaflet map + popup, ranking, "why report counts are not enough" panel, activity), Coverage Gaps (search, 3 filters, sort, read-only settings), Field Verification (queue + records), Methodology (+ limitations notice).
- Drawer: score breakdown, evidence, report logging, verification form with validation, history.
- Reset (confirm) and Load Demo Scenario (confirm).

### Verified (actual results, 2026-10-15)
- `npm test`: 8/8 pass. `npm run build`: succeeds.
- Playwright E2E (`/home/claude/qa/e2e.py`, not part of project): 38/38 pass — nav, popup fields, filters, sort, validation, verify flow, card updates, persistence after reload, scenario switch, reset/confirm, corrupt storage, no horizontal overflow at 1024 and 390 px, no app console errors.

### In progress
None.

### Pending / ideas (not started; ask owner first)
- Editable weights/thresholds UI (currently read-only by design).
- Marker keyboard access on map (ranking list is the keyboard path).
- Unit tests for the reducer; E2E script into the repo.

### Known issues
- OSM tiles need internet; offline the map shows labelled markers on grey (verified).
- Time is real clock; seed timestamps are relative to first load/reset.
- Verification checked in Chromium only.

## Decisions
- Only "Safe" and "Assistance required" reset the verification clock; "Unable to verify" and "Further investigation" are logged only.
- New report on safe/unknown area -> Verification Required (never Confirmed Emergency). Report counts are shown but not scored.
- "Population exposed" card = population in areas not currently verified safe.

## Session handoff checklist
- Open questions: should the project be zipped/deployed? Add git?
- Next possible task: ask owner.