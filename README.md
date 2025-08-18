# Kanban Board – Modern Task & Project Workflow

A fast, responsive Kanban board for managing boards, columns, tasks, and subtasks with smooth drag-and-drop, optimistic updates, and a polished UI.

![Kanban Board](./preview.png)

## Tech Stack

- **Frontend**
  - [Next.js](https://nextjs.org/) (App Router, Next 15) – Full‑stack React framework
  - [React](https://react.dev/) 19 – UI library
  - [TypeScript](https://www.typescriptlang.org/) – Type‑safe code
  - [Tailwind CSS](https://tailwindcss.com/) v4 – Utility‑first styles
  - [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) – Accessible components
  - [dnd-kit](https://dndkit.com/) – Drag and drop
  - [TanStack Query](https://tanstack.com/query/latest) – Server state & caching
  - [Framer Motion](https://www.framer.com/motion/) – Animations/reorder
  - [sonner](https://sonner.emilkowal.ski/) – Toaster notifications
  - [next-themes](https://github.com/pacocoursey/next-themes) – Dark/Light themes
  - [Lucide Icons](https://lucide.dev/) – Icons

- **Backend**
  - Next.js API Routes (Node.js runtime)
  - [PostgreSQL](https://www.postgresql.org/) via `pg`

- **Tooling & Infra**
  - Turbopack dev server
  - [ESLint](https://eslint.org/), [Prettier](https://prettier.io/)
  - [Playwright](https://playwright.dev/) – E2E testing
  - Optional DB via companion repo (Docker Compose)

## Features

- **Authentication**
  - Demo login flow with persisted session
  - Protected boards route & logout

- **Boards & Columns**
  - Create, edit, and delete boards
  - Edit board dialog with column color picker and Framer Motion reorder
  - Reorder columns, server‑side persisted

- **Tasks & Subtasks**
  - Create, edit, move between columns, and reorder
  - Task details dialog with subtasks
  - Optimistic toggles for subtasks and status changes with rollback on error

- **Drag & Drop**
  - Precise drop targets: top/middle/bottom within and across columns
  - Natural hover indicators and overlays

- **UX & Responsiveness**
  - Polished, responsive layout with mobile‑friendly gestures
  - Skeletons while data loads (top bar remains visible)
  - Dark/Light themes (no hydration flicker)

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (local/remote)
- npm, pnpm, or yarn

### Setup

1. Clone the repo

```bash
git clone <repository-url>
cd kanban-board
```

2. Install dependencies

```bash
npm install
# or
pnpm install
# or
yarn
```

3. Configure environment

```bash
cp .env.example .env
# Edit .env and set your DATABASE_URL and any other required values
```

4. Start the app (dev)

```bash
npm run dev
```

The app will run at http://localhost:3000

### Database (optional local Docker)

This app expects a PostgreSQL connection via `DATABASE_URL`.
If you want a ready‑to‑run local database and migrations, use the companion repo:

- kanban-board-db (Docker Compose, migrations, and deployment tooling)

Once your DB is up, ensure `DATABASE_URL` in `.env` points to it.

## Development Scripts

- Dev server (Turbopack)

```bash
npm run dev
```

- Type check

```bash
npm run type-check
```

- Lint

```bash
npm run lint
```

- Build & start

```bash
npm run build && npm start
```

- Playwright tests

```bash
# runs with dev server auto-start (per playwright.config)
npx playwright test
# headed / UI modes
npx playwright test --headed
npx playwright test --ui
```

## Project Structure

```
app/                   # Next.js App Router (pages, layouts, API routes)
  api/                 # REST endpoints (boards, columns, tasks, subtasks, auth)
  boards/              # Boards routes and client page
components/            # UI components (AppTopBar, Sidebar, dialogs, dnd, ui/*)
controllers/           # Route handlers delegating to services
hooks/                 # React hooks (auth, boards, tasks, dnd)
lib/                   # Auth helpers, DB connection, utils
providers/             # App-wide providers (React Query, Theme)
public/                # Static assets (logos, og-image)
repositories/          # Data access layer for Postgres
services/              # Business logic (auth, board, task, column)
types/                 # Shared TypeScript types
utils/                 # Routing helpers and small utilities
```

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "feat: add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

If you deploy, set `NEXT_PUBLIC_SITE_URL` for accurate Open Graph/Twitter preview URLs, and ensure `DATABASE_URL` is configured for your environment.
