# Personal Website

Milan Hokkanen's personal website — bio, project showcase, and blog. Built on **SolidStart** + **Better Auth**, running on **Deno**.

The site is single-user by design: only Milan can sign in, and account creation is blocked at the database layer once the first user exists. The authenticated `/dashboard` is private and used for account settings.

## Tech stack

- **[Deno](https://deno.land/)** — runtime, formatter, linter, type checker
- **[SolidStart](https://start.solidjs.com/)** + **[SolidJS](https://www.solidjs.com/)** — SSR, file-based routing, server actions
- **[Vite 7](https://vite.dev/)** — build tool with HMR
- **[Better Auth](https://better-auth.com/)** — email/password + passkeys + 2FA (TOTP), Turnstile captcha
- **[Drizzle ORM](https://orm.drizzle.team/)** + **[LibSQL](https://turso.tech/libsql)** — SQLite-compatible storage
- **[Tailwind CSS v4](https://tailwindcss.com/)** + **[Kobalte](https://kobalte.dev/)** / **[Corvu](https://corvu.dev/)** / **[Ark UI](https://ark-ui.com/)** — styling and accessible primitives
- **[TanStack Solid Form](https://tanstack.com/form)** — forms
- **[Zod v4](https://zod.dev/)** — validation
- **[AWS S3 SDK](https://docs.aws.amazon.com/sdk-for-javascript/)** + **[RustFS](https://github.com/rustfs/rustfs)** — S3-compatible object storage (RustFS for local dev via Docker)
- **[Lefthook](https://github.com/evilmartians/lefthook)** — pre-commit hooks (`fmt`, `lint`, `check`)

## Prerequisites

- [Deno](https://docs.deno.com/runtime/getting_started/installation/) (latest stable)
- [Docker](https://docs.docker.com/get-started/get-docker/) — for the local RustFS container

## Getting started

```bash
deno install
deno task db:generate    # migrations are not committed — generate them locally
deno task db:migrate
deno task dev            # Vite + RustFS concurrently
```

The app runs on [http://localhost:3028](http://localhost:3028). The first sign-up request creates the single user; every subsequent attempt is rejected by a `databaseHooks.user.create.before` hook in `src/server/auth.ts`.

### Environment variables

Copy `.env.example` to `.env` and fill in the values. You'll need: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, the Turnstile keys (`VITE_TURNSTILE_SITE_KEY`, `VITE_TURNSTILE_SECRET_KEY`), the host URL (`VITE_HOST_URL`), and S3 credentials (`S3_*`, `VITE_S3_PUBLIC_URL`). For local dev, `S3_ENDPOINT=http://localhost:9000` plus the matching `RUSTFS_*` values point at the Docker container.

## Available scripts

| Command | Description |
| --- | --- |
| `deno task dev` | Vite dev server + RustFS Docker, concurrently |
| `deno task dev:app` | Vite dev server only (port 3028) |
| `deno task build` | Production build (uses `.env.prod`) |
| `deno task start` | Run the production build |
| `deno task db:generate` | Generate Drizzle migration files |
| `deno task db:migrate` | Apply migrations |
| `deno task db:studio` | Drizzle Studio on port 8000 |
| `deno task db-prod:migrate` / `db-prod:studio` | Same against `.env.prod` |
| `deno task check` | `fmt` + `lint` + `check` over `./src/` |

## Project structure

```
src/
├── routes/            file-based routes (UI + the /api/auth/* catch-all)
├── components/        Solid components (UI primitives in components/ui/)
├── contexts/          Solid contexts (e.g. session)
├── hooks/             Solid hooks
├── lib/               client-safe helpers (auth-client, request middleware, utils)
├── actions/           server actions ("use server" mutations)
├── queries/           server queries ("use server" reads)
├── server/            server-only modules — never imported outside "use server"
│   ├── auth.ts        Better Auth instance
│   ├── db/            Drizzle client + schemas + relations
│   └── services/      pure server logic (S3, etc.)
└── types/             types reused across client and server
```

The hard rule: **anything under `src/server/` must only be reached from a `"use server"` boundary** (server actions, queries, the auth API route, or other server modules). Importing from a component would bundle libsql/secrets into the client.

## Roadmap

- Public pages: `/`, `/about`, `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`
- Content storage: TBD (Markdown/MDX in-repo vs DB-backed)
