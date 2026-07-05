# RepoNarrator

AI-generated GitHub READMEs, informed by your resume.

Users connect a GitHub account and supply a resume (upload or shared link). RepoNarrator reads
their repositories and uses LangChain to generate or improve each project's README — matching
the writing to the user's real skills and voice — then pushes it back as a pull request or a
direct commit.

## Repository layout

`frontend/` and `backend/` are **independent projects** — each has its own `package.json`,
lockfile, and dependencies. Nothing is shared between them; install and run each separately.

```
reponarrator/
├── frontend/                  # TanStack Start + React 19, shadcn/ui, Tailwind v4
└── backend/                   # NestJS + TypeORM (PostgreSQL) — modular monolith
    ├── database/
    │   ├── migrations/        # TypeORM migrations
    │   └── seeds/             # Plan seed data
    ├── workers/                # Background job workers (LangChain generation queue)
    ├── data-source.ts         # TypeORM CLI data source
    └── src/
        ├── modules/           # Feature modules (users, admin, plans, subscriptions,
        │                      #   resumes, repos, generations, audit), each with
        │                      #   controllers/ services/ repositories/ entities/ dto/
        ├── host/              # App bootstrap: app.module.ts, main.ts
        └── shared/
            ├── Domain/        # Enums + cross-module interfaces
            ├── Configuration/ # Env/config loading
            ├── Common/        # Filters, interceptors, guards, pipes
            ├── Contracts/     # Repository interfaces (dependency inversion)
            ├── Factories/     # Base factories (e.g. queue-backed mail factory)
            └── Services/      # Cross-cutting services (encryption, storage, ...)
```

Email templates and rendering live entirely inside `backend/workers/mail/` — the
worker runs as an independent process and shares nothing with `src/`.

## Subscription tiers

| | Free | Starter | Pro |
|---|---|---|---|
| Repos analyzable | 3 | 25 | Unlimited |
| Generations / month | 5 | 75 | 750 |
| Model tier | economy | standard | premium |
| Private repos | — | ✓ | ✓ |
| Push mode | manual / PR | PR | PR or direct |

Limits live in the `plans` table and are tunable without a redeploy.

## Getting started

Each app is set up and run independently, and each has its own `.env.example`.

```bash
# Backend (NestJS on :4000)
cd backend
cp .env.example .env        # fill in DATABASE_URL, GitHub OAuth, Stripe, LLM keys, etc.
npm install
npm run migration:run
npm run seed
npm run start:dev
npm run worker:mail         # mail worker, in its own terminal

# Frontend (TanStack Start on :3000), in a separate terminal
cd frontend
cp .env.example .env        # set VITE_BASE_URL to the backend API
npm install
npm run dev
```

Postgres and Redis are expected to be reachable at the URLs in `.env` — point `DATABASE_URL`
and `REDIS_URL` at whatever instances you run locally.

## Admin access

Admins are a **separate table** from users with their own login. Admin accounts are restricted
to the `@reponarratoradmin.com` email domain (enforced by both the auth service and a database
`CHECK` constraint).
