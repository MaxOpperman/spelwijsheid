# ASD-STE100 Agent Operating Standard

## 1. Purpose

This document defines the operating rules for AI coding agents working in the Spelwijsheid repository. It is intended to ensure consistent, safe, and maintainable changes aligned with the project’s architecture, privacy requirements, and local development workflow.

## 2. Scope

This standard applies to all repository work, including:

- feature development
- bug fixes
- tests and verification
- refactors
- database and migration changes
- configuration updates
- documentation updates

The agent must work within the repository root and prefer minimal, reversible, well-scoped changes.

## 3. Project Context

Spelwijsheid is a SvelteKit application that hosts browser-based word and logic games, including Wordle, impossible Wordle, Spelwijze, N-Queens, and Pinpoint. The project includes solver utilities, locale-aware word lists, PostgreSQL-backed persistence, and optional analytics with consent-first privacy controls.

### Primary project areas

- Application UI and routes: `src/routes/`
- Shared app logic: `src/lib/`
- Server-side logic and database access: `src/lib/server/`
- Svelte components: `src/lib/components/`
- Database schema and migrations: `src/lib/server/db/schema.ts`, `drizzle/`
- Tests: `test/`, `test-e2e/`
- Local static data: `static/`

## 4. Operating Principles

Follow the ASD-STE100 standard for all produced code and text.

### 4.1 Minimal scope

- Do not broaden the task beyond the requested change.
- Prefer targeted edits over sweeping rewrites.
- Preserve project conventions and existing patterns unless a change requires a deliberate exception.

### 4.2 Test-first validation

- The code requires 100% test line coverage, condition coverage, branch coverage, and function coverage.
- For behavior changes, add or update a failing test before implementing the fix when feasible.
- Keep tests focused on observable behavior rather than implementation details.
- Prefer real behavior over mock-heavy test setup.

### 4.3 Safety and privacy

- Never expose secrets, credentials, tokens, or private user data in code or logs.
- Respect the consent-first analytics and server-side persistence model.
- Do not alter privacy-sensitive behavior without a clear requirement and matching documentation.

### 4.4 Reproducibility

- Do not follow bad patterns that do not allign with this `AGENTS.md`. This document is leading and should be followed.
- Prefer project-native scripts from `package.json` over ad hoc shell commands.

## 5. Repository-Specific Rules

### 5.1 Database changes

- Schema changes belong in `src/lib/server/db/schema.ts`.
- Generated migrations live under `drizzle/`.
- If a schema changes, update relevant migration output and check whether test fixtures need adjustment.
- Do not hand-edit migration history unless the task explicitly requires it.

### 5.2 Frontend changes

- Prefer Svelte component patterns already used in the repo.
- Keep UX changes coherent with the project’s existing game styles and routing structure.
- Ensure new or changed routes remain consistent with server/client data flow.

### 5.3 Privacy, analytics, and sessions

- Preserve cookie consent gating and functional-only default privacy behavior.
- Do not introduce client-side persistence of sensitive information unless explicitly requested and designed according to the project’s privacy model.
- Keep session logic server-side and avoid serializing secret state into browser cookies.

## 6. Acceptance Criteria for Agent Work

A task is only complete when all of the following are true:

- the requested change is implemented
- the patch is scoped to the actual problem
- relevant tests are added or updated
- the smallest required verification has passed
- the result is consistent with repo conventions and privacy expectations

## 7. Prohibited Actions

The agent must not:

- add secrets, tokens, or credentials to repository files
- silently change project defaults or environment assumptions
- rewrite unrelated code to “clean up” a file without necessity
- disable or bypass safeguards, tests, or privacy checks
- claim completion without running the relevant verification command
