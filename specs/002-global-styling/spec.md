# Global Styling System

## Status

Proposed.

## Context

Global tokens and base rules live in `src/app.css`, but many Svelte files repeat surface, border, button, metric, progress, modal, and responsive declarations. The application already has light and dark token sets, shared font variables, and a global layout. The styling system should centralize repeated visual decisions while allowing game-specific board and puzzle styling to remain local.

## User Scenarios

### Scenario 1: Use the application in either theme

As a visitor, I see readable text, clear controls, and sufficient contrast in light and dark mode on every route.

### Scenario 2: Move between games

As a player, common panels, buttons, inputs, dialogs, progress indicators, and loading states look and behave consistently.

### Scenario 3: Add a new page

As a developer, I can use documented global tokens and utility classes instead of copying color, spacing, radius, shadow, and responsive CSS.

### Scenario 4: Resize the viewport

As a mobile player, shared controls remain usable, text fits its container, and pages do not overflow horizontally.

## Requirements

- **FR-001**: Define semantic global tokens in `src/app.css` for color roles, typography, spacing, radii, borders, shadows, control heights, and z-index layers.
- **FR-002**: Keep light and dark values behind the same semantic token names. Components must consume tokens rather than raw theme colors.
- **FR-003**: Define shared primitives for page surfaces, bordered panels, buttons, inputs, stat metrics, progress bars, loading states, overlays, and focus indicators.
- **FR-004**: Preserve the existing `--color-*` variables during migration or provide a deliberate compatibility mapping so route components do not break.
- **FR-005**: Establish one documented spacing and radius scale. Repeated values such as panel padding, 8px control radii, and common gaps must use tokens or shared component styles.
- **FR-006**: Establish consistent interactive states for hover, active, disabled, focus-visible, loading, success, warning, and error.
- **FR-007**: Focus indicators must remain visible in both themes and must not depend on hover.
- **FR-008**: Global styles must respect reduced-motion preferences for transitions and animations. Theme transitions may remain enabled only when they do not interfere with interaction.
- **FR-009**: Shared responsive rules must cover the existing small-screen layouts, including navigation, stats grids, action rows, inputs, and dialogs.
- **FR-010**: New global styles must not leak game-specific selectors into unrelated routes. Use component classes, semantic utility classes, or scoped component styles with explicit global tokens.
- **FR-011**: Avoid layout shifts caused by loading text, dynamic metrics, button labels, or responsive state changes. Define stable dimensions where a control or board requires them.
- **FR-012**: Verify color contrast and readable text sizes for normal and dark themes before migration is considered complete.

## Initial Token Groups

- `--color-*`: background, surface, text, muted text, primary, accent, warning, error, and focus roles.
- `--space-*`: page padding, panel padding, control gap, section gap, and grid gap.
- `--radius-*`: control, panel, overlay, and round indicator radii.
- `--shadow-*`: panel, elevated menu, and modal shadows.
- `--font-*`: body, heading, mono, label, and numeric display roles.
- `--control-*`: minimum touch target, input height, icon size, and progress height.
- `--layer-*`: navigation, backdrop, modal, and consent banner stacking order.

## Migration Targets

1. Normalize the repeated stats panel structure in the Queens, Wordle, and Impossible Wordle routes.
2. Normalize repeated panel, button, input, progress, modal, and loading styles in `GameView.svelte`, `WelcomeScreen.svelte`, and `GameState.svelte`.
3. Align route-local Wordle and Impossible Wordle controls with the shared button, input, focus, and feedback states.
4. Keep board tiles, letter states, solver-specific controls, and Pinpoint clue presentation local unless the structure is independently repeated.
5. Remove duplicate declarations only after the consuming component has adopted the shared token or primitive.

## Non-Goals

- Do not redesign the games or change their visual identity without a separate feature specification. Only allow redesign if components are similar.
- Do not introduce a new CSS framework.
- Do not replace Svelte scoped styles where a style is genuinely local.
- Do not change content, translations, game logic, persistence, or analytics behavior.

## Acceptance Criteria

- Global tokens and their light/dark values are documented in or next to `src/app.css`.
- Repeated shared styles have one source of truth and route pages use it without raw theme colors.
- Existing dark-mode, global-style, and responsive e2e tests pass.
- `pnpm check` and the relevant test suites pass with no new accessibility or CSS diagnostics.
- Keyboard focus, reduced-motion behavior, contrast, and narrow viewport behavior are verified for shared controls.
- Game-specific styles remain scoped to the game that owns the behavior.
