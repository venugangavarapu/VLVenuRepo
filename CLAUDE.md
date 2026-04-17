# CLAUDE.md — HealthNote Project Guide

## Project Overview

HealthNote is a zero-dependency, client-side web app for tracking BMI, daily calorie intake, macros, and weight trends. No build step, no server, no npm install — just open `index.html` in a browser.

---

## Architecture Decisions

- **No framework.** Vanilla JS only. Do not introduce React, Vue, or any component framework.
- **No build tooling.** No webpack, Vite, Babel, or TypeScript. All files are plain `.js` and `.css` loaded directly by the browser.
- **No backend.** All data lives in `localStorage`. Do not add API calls, authentication, or server-side logic.
- **No npm dependencies.** The only allowed external resource is Chart.js, loaded via CDN in `index.html`.
- **Single-page app.** Navigation is handled by showing/hiding `.section` divs — do not add routing or URL changes.
- **Data keys.** `localStorage` keys are prefixed `hn_` (`hn_profile`, `hn_food_log`, `hn_weight_log`, `hn_welcome`). Do not rename them — existing users would lose data.

### File responsibilities

| File | Responsibility |
|------|---------------|
| `index.html` | App shell, markup, CDN script tags |
| `style.css` | All styles — no inline styles except dynamic values (colors, widths) |
| `app.js` | All application logic — state, rendering, event handlers |
| `foods.js` | `FOOD_DB` array and `searchFoods()` only — no app logic here |
| `tests.js` | Unit tests — plain Node.js, no test framework |

---

## Coding Standards

### JavaScript

- Use `const` by default; `let` only when reassignment is needed. Never `var`.
- Prefer arrow functions for callbacks; named `function` declarations for top-level functions.
- No classes — use plain functions and objects.
- DOM queries go inside the function that needs them, not at module level (the DOM may not be ready).
- Guard DOM queries with optional chaining (`?.`) when the element may not exist.
- Async functions use `async/await`, not `.then()` chains.
- Numbers from user input must be explicitly parsed (`parseInt`, `parseFloat`) and validated before use.

### CSS

- Use CSS custom properties for repeated colors/values where practical.
- No external CSS frameworks (Bootstrap, Tailwind, etc.).
- Class names use kebab-case (e.g. `stat-card`, `nav-tab`).

### HTML

- Semantic elements where appropriate (`<nav>`, `<main>`, `<section>`).
- All interactive elements must be keyboard-accessible.
- IDs are used for JS hooks; classes are used for styling.

### General

- No comments unless the **why** is non-obvious (a hidden constraint, a workaround, a subtle invariant).
- No dead code, commented-out code, or `console.log` left in production paths.
- Keep functions small and focused. If a render function exceeds ~50 lines, consider splitting it.

---

## Preferred Libraries

| Purpose | Library | How loaded |
|---------|---------|------------|
| Charts | [Chart.js](https://www.chartjs.org/) | CDN in `index.html` |
| Everything else | Vanilla JS | — |

Do not add any other libraries without a strong reason and explicit discussion.

---

## Food Database (`foods.js`)

Each entry in `FOOD_DB` follows this format:

```js
[name, calories_per_100g, protein_g, carbs_g, fat_g, serving_label, serving_grams]
```

- `calories_per_100g` — integer or one decimal place
- Macros — one decimal place maximum
- `serving_label` — human-readable (e.g. `"1 cup"`, `"1 piece"`, `"100g"`)
- `serving_grams` — default quantity pre-filled in the food log form

Group new entries under an existing category comment, or add a new category comment if the group doesn't fit.

---

## Testing

- Tests live in `tests.js` and run with `node tests.js`.
- No test framework — use the built-in `assert(description, condition)` helper.
- Pure logic functions must be duplicated/stubbed in `tests.js` (the file cannot import browser globals).
- DOM-dependent functions should be tested by extracting pure logic into a separate helper and testing that helper.
- All tests must pass before merging to `main`. Exit code 1 = failure.

Run tests:
```bash
node tests.js
```

---

## Review Checklist

Before merging any change, verify:

### Correctness
- [ ] `node tests.js` passes with 0 failures
- [ ] Opened `index.html` in a browser and manually tested the changed feature
- [ ] Edge cases handled (empty input, missing profile, no food logged)

### Code quality
- [ ] No `var`, no unnecessary `let`
- [ ] No leftover `console.log` or commented-out code
- [ ] No new external libraries or CDN links added without discussion
- [ ] Functions are focused and reasonably sized

### Data integrity
- [ ] `localStorage` key names unchanged (`hn_*` prefix)
- [ ] New food entries follow the `FOOD_DB` format exactly
- [ ] Numeric inputs validated before use

### Git hygiene
- [ ] Commit message is descriptive and explains the **why**
- [ ] No unrelated changes bundled into the same commit
- [ ] Branch merged into `main` only after tests pass

---

## Local Development

```bash
# Open the app
start index.html        # Windows
open index.html         # Mac/Linux

# Run tests
node tests.js
```

No install step required.
