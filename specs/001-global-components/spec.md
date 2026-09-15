# Global UI Components

## Status

Proposed.

## Context

The application has several reusable UI patterns spread across route files and local component styles. The shared shell already renders `src/routes/Header.svelte`, `src/lib/components/DarkModeToggle.svelte`, `src/lib/components/LangDropdown.svelte`, and `src/lib/components/ConsentBanner.svelte`. The three statistics panels at `src/routes/queens/StatsPanel.svelte`, `src/routes/wordle/StatsPanel.svelte`, and `src/routes/wordle-impossible/StatsPanel.svelte` also share the same panel, metric, and responsive layout patterns.

The goal is to make repository-wide UI primitives explicit without erasing differences between games.

## User Scenarios

### Scenario 1: Navigate the application

As a visitor, I can use one consistent header, theme control, language selector, mobile menu, and footer shell on every route.

### Scenario 2: Read game statistics

As a player, I can read statistics in a consistent panel structure while each game supplies its own metrics and optional distributions.

### Scenario 3: Use common feedback states

As a player, I see consistent loading, empty, success, error, modal, and confirmation states across games and solvers.

### Scenario 4: Extend a game

As a developer, I can compose a new page from shared primitives without copying layout or interaction CSS into a route component.

## Requirements

- **FR-001**: Provide a repository-wide `AppShell` or equivalent layout contract for header, main content, footer, and consent UI. The existing `+layout.svelte` remains the integration point.
- **FR-002**: Keep navigation behavior in one component boundary. The component must support active routes, desktop submenus, mobile navigation, keyboard access, and closing menus after navigation.
- **FR-003**: Keep theme and locale controls reusable and accessible. Controls must expose an accessible name, visible focus state, and state through ARIA attributes where applicable.
- **FR-004**: Provide a configurable `StatsPanel` primitive for a title, metric items, optional current value, and optional distribution or detail rows. Game-specific formatting and labels remain inputs or slots.
- **FR-005**: Provide shared primitives for `Panel`, `Button`, `LoadingState`, `EmptyState`, `Modal`, and `ProgressBar` where the same structure occurs in more than one route or component.
- **FR-006**: Shared primitives must use i18n keys supplied by the caller or existing common keys. They must not hard-code game-specific copy.
- **FR-007**: Shared primitives must support light and dark themes through the global CSS tokens. They must not introduce route-specific colors or inline theme values.
- **FR-008**: Shared components must preserve responsive behavior at the existing mobile breakpoint and must not cause horizontal overflow.
- **FR-009**: Components with dialogs, menus, or controls must preserve keyboard operation, focus management, and semantic roles.
- **FR-010**: Migration must be incremental. Existing game-specific components may continue to own game rules, state, and domain markup.

## Candidate Components

| Component            | Evidence                                                                   | Boundary                                    |
| -------------------- | -------------------------------------------------------------------------- | ------------------------------------------- |
| `AppShell`           | `src/routes/+layout.svelte`                                                | Application chrome only                     |
| `AppHeader`          | `src/routes/Header.svelte`                                                 | Navigation and shell controls               |
| `ThemeToggle`        | `src/lib/components/DarkModeToggle.svelte`                                 | Theme preference control                    |
| `LocaleSelector`     | `src/lib/components/LangDropdown.svelte`                                   | Locale selection                            |
| `ConsentBanner`      | `src/lib/components/ConsentBanner.svelte`                                  | Consent interaction and presentation        |
| `StatsPanel`         | Three route-local `StatsPanel.svelte` files                                | Shared metric layout; game data stays local |
| `LoadingState`       | `GameState.svelte`, Queens, Wordle, and Impossible Wordle routes           | Loading presentation                        |
| `Modal`              | Completion modal in `src/lib/components/GameView.svelte` and route dialogs | Dialog shell and focus behavior             |
| `Button` and `Panel` | Repeated button, surface, border, and shadow rules in game components      | Visual primitives only                      |

## Non-Goals

- Do not merge different game rules or game state machines.
- Do not force all statistics into one data model.
- Do not replace the existing i18n system.
- Do not change persistence, analytics consent, or server-side session behavior.
- Do not remove intentional game-specific layouts or visual identity.

## Acceptance Criteria

- Every proposed primitive has one documented prop or slot contract and one clear owner under `src/lib/components/`.
- At least the three statistics panels can be migrated without duplicating their panel and metric layout CSS.
- Header, language, theme, modal, and menu interactions retain existing e2e behavior.
- Keyboard and screen-reader checks cover the shared menu, selector, toggle, and modal primitives.
- `pnpm check`, the focused component tests, and relevant e2e tests pass after migration.
- No route-specific business logic is moved into a global component.
