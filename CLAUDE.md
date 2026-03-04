# Beampipe

Privacy-focused web analytics platform. An alternative to Google Analytics.

## Project Structure

```
beampipe/
├── server/          # Kotlin/Micronaut backend (Gradle)
├── ui/              # React dashboard SPA (Vite + Bun)
├── web/             # Marketing site (Astro)
├── docs/            # Documentation site (Astro)
├── packages/
│   └── tracker/     # Lightweight JS tracking snippet (~1KB)
├── Dockerfile       # Multi-stage production build
├── docker-compose.yml  # Local dev (PostgreSQL/TimescaleDB)
└── railway.toml     # Railway deployment config
```

## Server (`server/`)

- **Kotlin 2.0.21** on **Micronaut 4.4.4**, targets JVM 17
- **PostgreSQL + TimescaleDB** via **Exposed** ORM, migrations with **Flyway** (`server/src/main/resources/databasemigrations/`)
- **GraphQL** API at `/graphql` (graphql-kotlin schema generation)
- Event ingestion endpoint: `POST /event`
- Auth: JWT cookies + OAuth2 (GitHub, Slack)
- Integrations: Stripe (payments), Slack (notifications/reports), MaxMind GeoIP2

### Key server packages (`server/src/main/kotlin/io/beampipe/server/`)
- `api/` - HTTP endpoints (event capture, CORS, geo-tagging)
- `db/` - Exposed table definitions and DB setup
- `graphql/` - Query/mutation resolvers and schema wiring
- `auth/` - Authentication providers
- `slack/` - Slack bot and scheduled reports
- `stripe/` - Payment processing

### Build commands
```bash
./gradlew :server:shadowJar     # Fat JAR
./gradlew :server:test          # Tests (uses Testcontainers + PostgreSQL)
./gradlew :server:run           # Dev server
```

## UI (`ui/`)

- **React 18** + TypeScript, built with **Vite 6**
- **Tailwind CSS 4**, **urql** (GraphQL client), **Chart.js** + **D3** for visualizations
- Package manager: **Bun**

### Key routes (defined in `ui/src/App.tsx`)
- `/` - Dashboard (domain list)
- `/domain/:domain` - Full analytics view for a domain
- `/settings` - Account settings
- `/sign-in`, `/sign-up`, `/sign-out`, `/reset-password` - Auth pages

### Build commands
```bash
cd ui && bun run build        # Production build (also builds tracker)
cd ui && bun run dev          # Dev server
cd ui && bun run typecheck    # Type check
```

## Marketing Site (`web/`)

- **Astro 5.5** static site with **Tailwind CSS 4**
- Pages: home, blog, privacy policy
- Blog content in `web/src/content/posts/` (Markdown)
- Deployed to **Cloudflare Pages** via GitHub Actions

```bash
cd web && bun run build    # Build to web/dist/
```

## Tracker (`packages/tracker/`)

- Vanilla TypeScript, compiles to a tiny script for embedding on tracked sites
- Captures page views, custom events, referrers, screen width, UTM params
- Uses SipHash for anonymous visitor IDs

## Deployment

- **Server**: Docker on Railway (multi-stage Dockerfile builds UI + server + GeoIP DB)
- **Marketing site + docs**: Cloudflare Pages (`.github/workflows/deploy-sites.yml`)
- **CI**: GitHub Actions (`.github/workflows/ci.yml`) - Docker build, UI typecheck, server tests, web build

## Local Development

```bash
docker compose up -d              # Start PostgreSQL/TimescaleDB
./gradlew :server:run             # Start backend on :8080
cd ui && bun run dev              # Start frontend dev server
```

## Monorepo Setup

- **Bun workspaces** for JS packages (root `package.json` includes `packages/*`, `ui`, `web`, `docs`)
- **Gradle** for JVM (root `settings.gradle` includes `server`)
- Versioning managed by **release-please** (`release-please-config.json`)
