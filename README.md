# Wayfind

Monorepo containing the Wayfind web app, mobile app, and shared Firebase config.

## Layout

- `apps/web/` — Next.js + Firebase (see its README)
- `apps/mobile/` — Flutter app (not yet scaffolded)
- `firebase/` — Firestore rules, indexes, other project-wide Firebase config
- `design/` — shared design tokens (colors, spacing, etc.)
- `docs/` — shared docs (data model, architecture notes)

## Branch naming

- `feat/web/<slug>` — web-only feature
- `feat/mobile/<slug>` — mobile-only feature
- `feat/shared/<slug>` — touches more than one app (e.g. schema change)
- `fix/<scope>/<slug>` — bug fix
- `chore/<slug>` — housekeeping

## Running

Web:
```bash
cd apps/web
npm install
npm run dev
```

## Deploying Firestore rules

From the repo root:
```bash
firebase deploy --only firestore:rules
```