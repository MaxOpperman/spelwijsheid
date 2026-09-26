# Generic UI Components

## Status

Complete.

## Context

The repository contains shared `Button`, `LoadingState`, `Panel`, `Modal`, `ProgressBar`, and `StatsPanel` components. Several routes still implement their own loading indicators, action buttons, word-length selectors, and form inputs. These implementations repeat visual states and responsive rules while using different class names, dimensions, and theme values.

The goal is to provide small generic components for repeated controls and feedback states. The components must centralize shared interaction and styling without moving game rules, labels, or route-specific layout into `src/lib/components/`.

## User Scenarios

### Scenario 1: See a loading state

As a player, I see the same accessible loading treatment while a game, clue set, or word list is being prepared.

### Scenario 2: Use a common action

As a player, primary, secondary, reset, pause, and resume actions have consistent dimensions, focus behavior, disabled states, and theme support.

### Scenario 3: Choose a word length

As a player, I can select a word length through the same keyboard-accessible segmented control in Wordle, Impossible Wordle, and the solver.

### Scenario 4: Enter a value

As a player, text inputs have consistent surface, border, focus, disabled, placeholder, and responsive behavior across games and solvers.

### Scenario 5: Add a route

As a developer, I can use generic components with caller-provided labels and event handlers instead of copying control CSS into a route.

## Requirements

- **FR-001**: Provide a reusable `LoadingState` component with a required accessible label and optional detail text. It must support a default and compact presentation without duplicating spinner behavior.
- **FR-002**: Provide a reusable `Button` component with primary, secondary, and ghost variants. It must support `button`, `submit`, and `reset` types, disabled state, accessible naming, and caller-provided content.
- **FR-003**: Extend or replace the current `Button` contract only when the resulting API preserves existing callers or provides an explicit migration path. Do not move game actions or persistence logic into the component.
- **FR-004**: Provide a reusable `SegmentedControl` component for a finite set of labelled options. It must expose the selected value, support keyboard operation, use appropriate button semantics, and provide an accessible group label.
- **FR-005**: Migrate the repeated word-length selectors in Wordle, Impossible Wordle, and the Wordle solver to `SegmentedControl` without changing form actions or route behavior.
- **FR-006**: Provide a reusable `Input` component for text-like form controls. It must support label or accessible name, placeholder, value binding, disabled state, error state, and caller-provided input attributes.
- **FR-007**: Migrate repeated text input styling in Spelwijze, Pinpoint, and the Wordle solver to `Input` where the control contracts are compatible. Keep game-specific keyboard handling and validation in the route or owning component.
- **FR-008**: Generic components must consume semantic global tokens for colors, spacing, radii, shadows, focus, control heights, and motion. They must not contain route-specific colors or copy.
- **FR-009**: Generic components must provide consistent hover, active, disabled, focus-visible, loading, success, warning, and error states where the component supports those states.
- **FR-010**: Generic components must preserve reduced-motion behavior and must not create layout shifts when labels, loading indicators, or selected values change.
- **FR-011**: Generic components must support the existing responsive breakpoint and must not cause horizontal overflow at narrow viewports.
- **FR-012**: All generic controls must retain semantic HTML, accessible names, keyboard operation, visible focus indicators, and appropriate ARIA state. ARIA must not replace native semantics when native elements are sufficient.
- **FR-013**: Components must use i18n labels supplied by callers or existing shared keys. They must not hard-code game-specific text.
- **FR-014**: Existing `Panel`, `Modal`, `ProgressBar`, and `StatsPanel` components remain separate primitives. This specification must not merge unrelated component responsibilities.
- **FR-015**: Provide a reusable disclosure or menu primitive for repeated open/close interactions. It must support expanded state, Escape handling, outside-close behavior where applicable, focus return, and keyboard operation.
- **FR-016**: Provide a reusable documentation-page shell for the repeated how-to-play pages. It must accept a title, optional description, optional back link, and caller-provided content without owning game instructions.
- **FR-017**: Provide a reusable definition-list or key-value section for repeated labelled rows. It must preserve semantic `dl`, `dt`, and `dd` structure and support caller-provided values.
- **FR-018**: Provide a reusable result-list primitive for repeated word-result collections. It must support keyed items, empty state content, optional selection, and caller-provided item rendering.
- **FR-019**: Provide a reusable inline form-row primitive for a text input, optional status or counter, and submit action. It must compose `Input` and `Button` without owning validation, form actions, or domain state.
- **FR-020**: Provide a reusable callout or notice primitive for informational, success, warning, and error content. It must use semantic tone tokens and accept caller-provided content and optional actions.
- **FR-021**: New generic components must be introduced incrementally. A candidate must have at least two compatible consumers or a documented reuse case before migration.

## Component Contracts

### `LoadingState`

- Required prop: `label: string`
- Optional props: `detail?: string`, `compact?: boolean`
- Output: a status region with an accessible label and a decorative spinner
- Ownership: loading presentation only; the caller owns loading state and data fetching

### `Button`

- Content: caller-provided children or snippet
- Props: `variant`, `type`, `disabled`, and accessible naming attributes
- Output: a native `button` element with stable control dimensions
- Ownership: visual and interaction states only; the caller owns the action

### `SegmentedControl`

- Required props: `options`, `value`, and `label`
- Required behavior: emit or bind the selected option and expose the selected state
- Output: labelled group containing native buttons
- Ownership: selection presentation and keyboard interaction; the caller owns form submission and domain meaning

### `Input`

- Required prop: an accessible label or explicit accessible name
- Optional props: `value`, `placeholder`, `disabled`, `error`, `type`, and native input attributes
- Output: labelled native input with shared states
- Ownership: input presentation and binding; the caller owns parsing, validation, and submission

### `DisclosureMenu`

- Required props: trigger label and open state or a controlled toggle callback
- Optional props: menu items or child snippet, placement, close-on-outside-click, and close-on-navigation
- Output: a labelled disclosure or menu with `aria-expanded` and keyboard support
- Ownership: visibility, focus return, and menu interaction; the caller owns navigation and selection meaning

### `DocumentationPage`

- Required props: title and content snippet
- Optional props: description, back-link label, back-link destination, and layout variant
- Output: a constrained, responsive prose layout with semantic heading structure
- Ownership: document content, translations, and route metadata remain with the page

### `DefinitionList`

- Required prop: labelled row data or row snippet
- Optional props: section title and empty state
- Output: semantic `dl` markup with consistent section spacing
- Ownership: labels, values, formatting, and privacy decisions remain with the caller

### `ResultList`

- Required prop: keyed items and an item snippet
- Optional props: empty state, selectable mode, selected keys, and selection callback
- Output: responsive list or grid with stable item dimensions
- Ownership: result data, item formatting, domain classes, and selection meaning remain with the caller

### `InlineFormRow`

- Required content: an `Input` and submit `Button`, supplied through props or snippets
- Optional props: status text, counter, loading state, and responsive layout variant
- Output: stable inline form layout that does not own submission behavior
- Ownership: form action, validation, disabled conditions, and domain state remain with the caller

### `Callout`

- Required props: tone and content snippet
- Optional props: title, icon, dismiss action, and compact presentation
- Output: semantic status or complementary region with token-based tone styling
- Ownership: message content, translation, and action behavior remain with the caller

## Migration Targets

1. Adopt `LoadingState` in the WelcomeScreen, Pinpoint, Queens, Wordle, and Impossible Wordle loading paths.
2. Migrate route-local primary, secondary, reset, pause, resume, and new-game buttons to `Button` where their visual contract matches.
3. Replace duplicated word-length selector styles in Wordle, Impossible Wordle, and the Wordle solver with `SegmentedControl`.
4. Migrate compatible text inputs in GameView, Pinpoint, and the Wordle solver to `Input`.
5. Evaluate `DisclosureMenu` for the shared header submenus and language selector without moving navigation or locale logic into the primitive.
6. Evaluate `DocumentationPage` for the repeated how-to-play routes, keeping each page's instructions and examples local.
7. Evaluate `DefinitionList` for the repeated labelled sections in the about and profile surfaces.
8. Evaluate `ResultList` for word-result collections in GameView and the solver routes.
9. Evaluate `InlineFormRow` for the Spelwijze and Pinpoint entry forms after `Input` and `Button` adoption.
10. Evaluate `Callout` for repeated informational and warning blocks in documentation and account surfaces.
11. Keep board cells, keyboard keys, clue bands, solver-specific fields, and game-specific actions local when their behavior or visual identity is not generic.
12. Remove duplicate declarations only after the consuming route uses the generic component and its behavior is covered by tests.

## Non-Goals

- Do not change game rules, route actions, persistence, analytics, translations, or server behavior.
- Do not force game boards, virtual keyboards, clue bands, or solver-specific controls into generic components.
- Do not introduce a CSS framework or replace Svelte component styles without a migration need.
- Do not hide route-specific validation or keyboard behavior inside generic components.
- Do not change the visual identity of a game beyond the shared states required for consistency.

## Adoption Decisions

- `DisclosureMenu` remains available as a generic primitive, but the shared header and language selector retain their local implementations because they coordinate route state, locale state, focus behavior, and navigation closing in one boundary.
- `DocumentationPage` remains available for new documentation routes. Existing how-to-play pages retain local wrappers because their examples, board illustrations, and instructional markup differ by game.
- `DefinitionList` is intended for account and profile surfaces. The existing about page keeps its local sections until a second compatible data surface adopts the same semantic rows.
- `ResultList` remains available for future solver-result migration, but current word result collections retain local markup because pangram highlighting, checkbox state, and result pagination differ by route.
- `InlineFormRow` remains available for compatible forms. Pinpoint retains its local form because it requires a direct input element reference for focus restoration after enhanced submission.
- Board cells, virtual keyboards, clue bands, and solver-specific fields remain local because their interaction state and visual identity are domain-specific.

## Acceptance Criteria

- Each generic component has one documented prop or snippet contract and one owner under `src/lib/components/`.
- `LoadingState` is used by all compatible repeated loading paths, with an explicit rationale for any remaining local loading UI.
- `SegmentedControl` replaces the repeated word-length selector implementation without changing form submission behavior.
- Compatible action buttons and text inputs use the shared components without moving route-specific logic into them.
- Repeated header/language disclosure behavior, documentation shells, definition lists, result lists, inline form rows, and callouts are either migrated to shared components or have a written rationale for remaining local.
- Shared components pass light-theme, dark-theme, narrow-viewport, reduced-motion, keyboard, and focus-visible checks.
- Component tests cover normal, disabled, selected, empty, error, and state-transition paths that each component supports.
- Relevant route e2e tests continue to pass, including navigation, game start, word-length selection, input submission, and loading behavior.
- `pnpm check`, `pnpm check:style`, and the relevant unit and e2e test suites pass.
- No generic component contains game-specific copy, route-specific colors, or game business logic.
