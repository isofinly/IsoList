# IsoList

IsoList is a Next.js 15 (App Router) app for tracking movies, series, and anime. It uses Zustand for state, Google Drive for sync/backup, and a custom Fluent/Tailwind UI. All data is local-first, with optional Google OAuth for cloud sync and backup. No backend DB.

## Features

- **Media types:** `movie`, `series`, `anime` with rich metadata (title, status, rating, notes, genres, director, platform, dates, episodes, etc)
- **Status:** `completed`, `watching`, `planned`, `on-hold`, `dropped`
- **Calendar:** Monthly grid, color-coded, shows upcoming and TBD releases
- **Watchlist:** Sort/filter by status, date, title; separates future vs available; edit in-place
- **Sync:** Google Drive (OAuth2, PKCE), local/remote merge, conflict resolution, backup/restore, offline mode
- **No backend:** All state in browser, optional Drive sync

## Architecture

- **Next.js 15 App Router** (`src/app/`):
  - `/calendar` — Release calendar
  - `/watchlist` — Watchlist manager
  - `/ratings` — Ratings/completed
  - `/add` — Add new item
  - `/login` — Google OAuth
- **State:** `src/lib/store.ts` (Zustand, all media, sync status, conflict, etc)
- **Sync:** `src/lib/sync-manager.ts` (Drive, conflict detection, backup, merge)
- **Auth:** `src/lib/auth.ts` (Google OAuth, PKCE, token refresh)
- **Types:** `src/lib/types.ts` (MediaItem, enums)
- **UI:** `src/components/` (MediaCard, MediaForm, Navbar, dialogs, Fluent UI primitives)
- **Design:** Tailwind + custom CSS vars, OKLCH color, acrylic, reveal, dark/light

## Dev

```bash
git clone https://github.com/isofinly/isolist.git
cd isolist
npm install
npm run dev
```

Runs at `http://localhost:3000`. All code in `src/`. No DB, no server, just Next.js static + API routes for auth.

## Contributing

PRs welcome. Follow TypeScript, Zustand, and Fluent/Tailwind conventions. Test locally before submitting.

## License

See [LICENSE](LICENSE)
