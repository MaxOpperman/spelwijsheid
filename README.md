# Spelwijsheid

This app contains some games that I like to play and some that I was eager to program. Currently the games are:

- Wordle
- Impossible Wordle (adverse choosing of words while you guess)
- Spelwijze (Volkskrant App Game)
- N-Queens (LinkedIn Game)
- Pinpoint (LinkedIn Game)

## Solvers

Because I am not always the best at finding the correct answer I have created some solvers as well for these games.

## Language Support

The app now supports multiple languages with locale-specific word lists:

- **Dutch (nl-NL)**: Uses the [OpenTaal wordlist](https://github.com/OpenTaal/opentaal-wordlist) with support for the Dutch 'ij' digraph
- **English (US & GB)**: Uses distinct dictionaries from [wooorm/dictionaries](https://github.com/wooorm/dictionaries) with regional spelling variations
  - **en-US**: American English spellings (e.g., "color")
  - **en-GB**: British English spellings (e.g., "colour")

Game state (progress, statistics, saved games) is maintained separately per locale, and the ij digraph handling is automatically disabled for English locales where it's not applicable.

## Data storage & privacy

Player progress, preferences and statistics are persisted **server-side in PostgreSQL** (via [Drizzle ORM](https://orm.drizzle.team/) + `pg`). Each visitor is identified by a random UUID stored in an `httpOnly` cookie; the session is bootstrapped client-side through `/api/session`.

- **Consent-first analytics** — a cookie-consent banner is shown to new visitors. Only functional storage is enabled by default; optional analytics (device/browser info and coarse geolocation) are stored only after the visitor opts in.
- **Cross-device linking** — with analytics consent, instances (different browsers, devices or cookie resets) that look like the same person are heuristically grouped under a shared identity for analytics and to sync preferences. Matching uses a salted device fingerprint (strong) or the same IP plus matching OS/browser/device type (weak); preferences propagate only on strong matches. Withdrawing analytics consent immediately unlinks the instance.
- **Geolocation** — IP addresses are resolved to a coarse location using MaxMind's [GeoLite2-City](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data) database. The database is auto-downloaded at container startup by `scripts/download-geoip.js` when MaxMind credentials are provided; without credentials, location fields simply stay empty.
- **Migrations** — the schema lives in `src/lib/server/db/schema.ts`; SQL migrations are generated into `./drizzle` and applied at startup by `scripts/migrate.js`.

## Svelte

This app is programmed in Svelte to broaden my experience with frameworks. A small sidenote is that I took some shortcuts with Claude Sonnet 4 / 4.5 but who doesn't nowadays :D

## Local development

### Prerequisites

- **Node.js** 24+ (the project is developed on Node 25)
- **Docker** (optional, but the easiest way to run a local PostgreSQL instance)

### 1. Install dependencies

```bash
npm install
```

> The `preinstall` hook runs `scripts/download-wordlist.js` to fetch the locale word lists into `static/`.

### 2. Configure environment variables

Copy the example file and adjust the values:

```bash
cp .env.example .env
```

| Variable              | Required | Default                         | Description                                                                                               |
| --------------------- | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`        | Yes      | –                               | PostgreSQL connection string used by the server-side user store.                                          |
| `DATABASE_POOL_MAX`   | No       | `pg` default (10)               | Optional cap on the connection-pool size. Used by the E2E harness (set to `1`).                           |
| `MAXMIND_ACCOUNT_ID`  | No       | –                               | MaxMind account ID; enables auto-download of the GeoLite2 database.                                       |
| `MAXMIND_LICENSE_KEY` | No       | –                               | MaxMind license key. Leave blank to disable geolocation.                                                  |
| `GEOIP_DB_PATH`       | No       | `/app/geoip/GeoLite2-City.mmdb` | Path where the GeoLite2 database is read/written. Set a writable local path for non-Docker runs.          |
| `FINGERPRINT_SALT`    | No       | `spelwijsheid-fp`               | Secret salt for device fingerprints used to group a person's instances. Set a random value in production. |
| `OLLAMA_API_URL`      | No       | `http://localhost:11434`        | Base URL of the Ollama API (used by AI-powered games).                                                    |
| `OLLAMA_MODEL`        | No       | `gpt-oss`                       | Ollama model used for generation.                                                                         |

### 3. Start a PostgreSQL database

You can use Docker or a native PostgreSQL installation.

#### Option A — Docker (quickest)

Start just the `db` service from the compose file:

```bash
docker compose up -d db
```

This launches `postgres:17-alpine` on port `5432` with the default credentials (user `spelwijsheid_user`, password `spelwijsheid_password`, database `spelwijsheid`), matching the `DATABASE_URL` in `.env.example`.

#### Option B — Native PostgreSQL (no Docker)

Install PostgreSQL 14+ via your platform's package manager ([postgresql.org/download](https://www.postgresql.org/download/)), for example:

- **Windows** — the [EDB installer](https://www.postgresql.org/download/windows/) or `winget install PostgreSQL.PostgreSQL`
- **macOS** — `brew install postgresql@17 && brew services start postgresql@17`
- **Linux (Debian/Ubuntu)** — `sudo apt install postgresql && sudo service postgresql start`

Then create a matching role and database (run `psql` as a superuser, e.g. `sudo -u postgres psql` on Linux or `psql -U postgres` on Windows/macOS):

```sql
CREATE ROLE spelwijsheid_user WITH LOGIN PASSWORD 'spelwijsheid_password';
CREATE DATABASE spelwijsheid OWNER spelwijsheid_user;
-- On PostgreSQL 15+ the `public` schema is locked down by default, so grant the
-- role ownership/privileges it needs to create tables and run migrations:
\connect spelwijsheid
GRANT ALL ON SCHEMA public TO spelwijsheid_user;
ALTER SCHEMA public OWNER TO spelwijsheid_user;
```

> If you created the database with a different owner (so migrations fail with
> `permission denied for database ...`), grant privileges to your role instead:
>
> ```sql
> ALTER DATABASE spelwijsheid OWNER TO spelwijsheid_user;
> \connect spelwijsheid
> GRANT ALL ON SCHEMA public TO spelwijsheid_user;
> ALTER SCHEMA public OWNER TO spelwijsheid_user;
> ```

Update `DATABASE_URL` in `.env` if you chose a different host, port, user, password or database name:

```
DATABASE_URL=postgres://spelwijsheid_user:spelwijsheid_password@localhost:5432/spelwijsheid
```

### 4. Apply database migrations

```bash
npm run db:migrate
```

Related Drizzle commands:

- `npm run db:generate` — generate a new migration after editing `schema.ts`
- `npm run db:push` — push the schema directly to the database (handy for quick local iteration)

### 5. (Optional) Download the GeoLite2 database

With MaxMind credentials set in `.env`:

```bash
npm run download:geoip
```

The script skips gracefully when credentials are missing or the local database is fresh (< 7 days old).

### 6. Run the dev server

```bash
npm run dev
```

The app is served at `http://localhost:5173` by default.

## Testing

The project ships with a full test pyramid.

```bash
# Unit + integration tests (Vitest)
npm test

# End-to-end tests (Playwright)
npm run test:e2e
```

- **Unit tests** cover pure helpers such as user-agent parsing, client-IP resolution and the GeoLite2 tar extractor.
- **Integration tests** exercise the storage layer and API endpoints against a **real PostgreSQL** running in-process via [PGlite](https://pglite.dev/) — no Docker required.
- **End-to-end tests** drive the app in Chromium via [Playwright](https://playwright.dev/), backed by a PGlite instance exposed over TCP. Install the browser once with `npx playwright install chromium`.

Additional quality checks:

```bash
npm run check        # svelte-check type checking
npm run check:style  # prettier + eslint
```

## Deployment

### Docker Compose (Local)

The application runs on port 3000 by default. You can customize the host port in `docker-compose.yml` if needed.

```bash
docker-compose up -d
```

The app will be available at `http://localhost:3000`

The compose stack also starts a `postgres:17-alpine` database (with a persistent `db-data` volume). On startup the app container automatically applies pending migrations and, when `MAXMIND_ACCOUNT_ID` / `MAXMIND_LICENSE_KEY` are provided, downloads the GeoLite2 database into the `geoip-data` volume before serving traffic.

### Self-Hosted with GitHub Actions

See the `runner/` directory for instructions on setting up a self-hosted GitHub Actions runner. You can customize the host port by setting the `HOST_PORT` GitHub repository secret in your repository settings.

### AI-powered games (Ollama)

Some games generate content at runtime by calling a local [Ollama](https://ollama.com) instance.

Configure the connection via environment variables (copy `.env.example` to `.env` on your runner):

| Variable         | Default                  | Description                      |
| ---------------- | ------------------------ | -------------------------------- |
| `OLLAMA_API_URL` | `http://localhost:11434` | Base URL of the Ollama API       |
| `OLLAMA_MODEL`   | `gpt-oss`                | Model name to use for generation |

**Session security** — the AI response (including any secret answer) is never serialised into the browser cookie. Instead, the server creates an in-memory session keyed by a random UUID; only the UUID is written to an `httpOnly` cookie. Sessions expire after 24 hours and are pruned lazily. See `src/routes/pinpoint/game-store.ts`.

**Fuzzy answer matching** — user input is compared against the correct answer using Levenshtein edit distance. Tolerance scales with answer length (0 for <= 4 chars, 1 for 5-7, 2 for 8+).

## Future work

If you have ideas: [create an issue](https://github.com/MaxOpperman/spelwijsheid/issues/new).
