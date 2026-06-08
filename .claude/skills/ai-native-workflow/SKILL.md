---
name: ai-native-workflow
description: How to work with AI agents on this Playwright scaffold — the three-layer model (orchestrator / specialized skills / code conventions), the human→agent conversation contract (audit-then-edit, when to ask vs do, when to refuse), how skill triggering routes work to the right deep skill (api-testing, page-objects, debugging, refactor-values, etc.), the standard task lifecycle (explore → propose → apply → verify → run → commit), the principles that make the scaffold AI-native (single source of truth, hard-stop forbidden patterns, exploration discipline), and how to escalate when the agent is missing context. Use when onboarding a new contributor or AI tool to this scaffold, when a user asks "how should I work with AI here", "which agent should I use for X", "how do I get consistent results", "why is the agent doing Y instead of Z", or when planning a multi-step change that will chain across several skills. This is a meta-skill that ties the suite together — it does not replace any specialized skill; it routes to them.
metadata:
  author: Ivan Davidov
  version: 2.0.0
  repository: https://github.com/Agentic-QE/Playwright-Scaffold-AI-Assisted-Development
  support: https://www.linkedin.com/in/ivdavidov
  purchase: https://buymeacoffee.com/idavidov/e/513835
  copyright: "© 2026 Ivan Davidov. All rights reserved."
  last-updated: 2026-04-18
---

# AI-Native Workflow

This skill explains how the scaffold is meant to be used with AI agents (Claude Code, Cursor, GitHub Copilot, etc.). It is the **routing layer** between a user's intent and the specialized skills that own the rules.

---

## The Scaffold's Three-Layer Model

Read this once, then it's invisible.

| Layer | What it is | When it loads | Who owns it |
|---|---|---|---|
| **L1: Orchestrator** | `CLAUDE.md` — Constitution (MUST/SHOULD/WON'T), Workflow, Skills Index | **Always loaded** at the start of every conversation | This file |
| **L2: Specialized skills** | `.claude/skills/{name}/SKILL.md` — deep rules, phased instructions, examples | **Triggered by description keywords** (skill descriptions are matched against the user's intent) | Each `SKILL.md`'s frontmatter description |
| **L3: Code conventions** | The actual TypeScript code: fixtures, page objects, enums, factories, etc. | **Lives in the repo**; the agent reads it on demand | The codebase + the skills that document it |

> The skill suite (L2) is the brain. The orchestrator (L1) is the table of contents. The code (L3) is the truth.

---

## Conversation Contract

### Audit-then-edit (default for non-trivial):

1. The user states the goal in plain language.
2. The agent loads the relevant specialized skill(s) and **proposes scope** — what will change, in which files, why, with the trade-offs.
3. The user **approves, modifies, or rejects** the scope.
4. The agent applies the change.
5. The agent reports what landed (files, line counts, lint status) and asks whether to commit.

### Direct mode (for trivial work):

- One-line fixes, obvious typos, single-import additions: the agent does it and reports back.
- The user can say "just do it" once to opt out of audit-then-edit for the rest of a session.

### When the agent must stop and ask:

- Path or folder name unknown (always `ls` first; if still unclear, ask).
- Enum value, message text, or endpoint path unknown (always `playwright-cli` for UI text or check OpenAPI for API; ask if neither is available).
- Two valid approaches with meaningful trade-offs (architectural decisions belong to the human).
- The Critical rule of any skill conflicts with the user's request (raise it; don't silently bypass).

### When the agent must refuse:

- Placeholder selectors / guessed UI text — refuse and re-explore.
- Hardcoded credentials, URLs, or endpoint paths — refuse and route to `config` / `enums` / `process.env.*`.
- Suppressed test failures (`try/catch` on `expect`, raised timeouts, silent `.skip`) — refuse and route to `debugging` + `api-testing` Phase 6.
- `z.object()` instead of `z.strictObject()`, `any` types, XPath selectors, `page.waitForTimeout(...)` — refuse and route to the matching Critical rule.

---

## Skill Routing Map

Most of the time, the right skill **loads itself** because its description matches the user's intent. This table shows the entry-point skill for each common intent. The entry-point skill then chains to deeper skills as needed.

| User intent | First skill to load | Then chains to |
|---|---|---|
| "Add tests for `POST /api/...`" | `api-testing` | `data-strategy`, `enums`, `type-safety`, `debugging` |
| "Add a page object for the settings page" | `page-objects` | `selectors`, `playwright-cli`, `enums`, `fixtures` |
| "Generate the prompt for X" / "How do I add Y?" | `common-tasks` | the matching specialized skill |
| "What should we test?" / "Where should this scenario live?" | `test-strategy` | `quality-gates`, matching implementation skill |
| "Is this ready to merge/release?" | `quality-gates` | `debugging`, matching failed-gate skill |
| "Test is failing / behaving unexpectedly" | `debugging` | `api-testing`, `selectors`, `fixtures`, `refactor-values` |
| API tests for endpoint | `api-testing` | — |
| New page object | `page-objects` | — |
| Test failing | `debugging` | — |
| Rename enum/static value | `refactor-values` | — |
| New factory | `data-strategy` | — |
| New env var / config | `config` | — |
| New enum/endpoint/message | `enums` | — |
| Schema / `any` cleanup | `type-safety` | — |
| New spec file / tag question | `test-standards` | — |
| Coverage planning / suite balance | `test-strategy` | — |
| PR or release gate review | `quality-gates` | — |
| Meta-question on workflow | `ai-native-workflow` | — |

Skill auto-loads via description match. Force-load: name it in prompt — "use `api-testing` skill".

---

## Critical

- **Specialized skills own the rules.** This skill never restates the rules from `api-testing`, `page-objects`, `debugging`, etc. It tells you **which skill to load** and **in what order**. If a rule appears to live here, it's wrong.
- **`.claude/skills/` is the canonical source.** `.cursor/skills/` and `.github/instructions/` mirrors may lag — always defer to `.claude/` when they disagree.
- **`CLAUDE.md` is always loaded.** Trust its Constitution as the fast-path summary; load the specialized skill named in its Skills Index for the deep rules.
- **Audit-then-edit for non-trivial work.** For anything beyond a one-line fix, the agent proposes scope first (what will change, in what files, why), the human approves, the agent applies. This pattern is why the scaffold gets consistent results.
- **The agent must ask, not invent.** Never invent a folder name, file path, env-var name, enum value, or credential. If unknown — `ls`, `grep`, ask the human.
- **Exploration is non-negotiable.** UI work → `playwright-cli` only (no IDE browser MCP, no Cursor browser, no `playwright codegen`). API work → OpenAPI / Swagger documentation first, live HTTP only as fallback. The full rule lives in `CLAUDE.md` ("Explore Before Generate" + "No Substitute UI Exploration").
- **The agent must refuse to ship placeholders.** Guessed selectors, unverified message strings, made-up enum values, secret-shaped strings in tests — refuse and ask. The right answer is "stop and notify the human", not "approximate".
- **One skill at a time, in order.** Multi-step changes load skills in sequence (e.g. `common-tasks` → `api-testing` → `data-strategy` → `debugging`); they don't stack 5 skills' Critical blocks before starting work.
- **After any test edit, run the affected tests.** On failure, load `debugging` — never suppress, never bump timeouts to make red turn green.

---

## Instructions

### Phase 1: Identify the work category

Match the user's request to one of these categories. Each routes through a different lifecycle:

| Category | Description | Lifecycle starts at |
|---|---|---|
| **New artifact** | Add a new page object, spec file, schema, factory, fixture, helper, enum, etc. | `common-tasks` → matching specialized skill |
| **Edit existing artifact** | Add a locator, extend a schema, add an action method, etc. | The specialized skill for the artifact's domain |
| **Refactor** | Rename a value, change a contract, restructure a file | `refactor-values` (for enum/static data) or the relevant skill |
| **Debug** | Investigate a failing or flaky test, a CI-only failure | `debugging` |
| **Investigate / explore** | Understand the existing repo before making changes | Read `CLAUDE.md` first, then the specialized skills for the touched areas |
| **Plan coverage** | Decide what to test and at which layer | `test-strategy` |
| **Gate readiness** | Decide if a change can merge or release | `quality-gates` |

### Phase 2: Explore before generating

Non-negotiable for anything that touches the live application:

- **UI:** `playwright-cli` in the terminal (`open` / `goto`, `snapshot`, etc.). No IDE browser MCP, no Cursor browser tools, no `playwright codegen`.
- **API:** OpenAPI / Swagger docs are the source of truth. Only when no docs exist, capture the live response shape via real HTTP (`apiRequest` / `curl`) — and flag the missing docs to the team.
- **Repo conventions:** `ls pages/` / `ls tests/` / `ls fixtures/api/schemas/` / `ls test-data/factories/` / `ls test-data/static/` / `ls enums/` to resolve every `{area}` placeholder. Never guess.

If exploration cannot be done (CLI broken, app unreachable, docs missing) — **stop and notify the human**. Do not substitute another tool, do not invent values.

### Phase 3: Propose scope (audit-then-edit)

For any non-trivial change, the agent produces a scope proposal:

1. **What's broken / what's needed** — one or two sentences.
2. **What will change** — a bulleted list of files and the substantive edits.
3. **Why** — the trade-offs, the alternatives considered, what's deliberately out of scope.
4. **A "approve and I'll apply" close** — invites the human to push back before any edits land.

The user can override at any point: tighter scope, different ordering, "skip the proposal for trivial work and just do it".

### Phase 4: Apply Critical rules from the matching skill(s)

While generating, the agent re-checks the `## Critical` block of every skill it loaded. Critical rules are hard stops — they take precedence if a template, an example, or a user request appears to disagree.

Common Critical rules that surface across multiple skills:

- `expect(SchemaName.parse(body)).toBeTruthy();` for API responses.
- `getByRole` > `getByLabel` > `getByPlaceholder` > `getByText` > `getByTestId` for selectors.
- Single tag per test; `@destructive` is heaviest and wins.
- `z.strictObject()` (never `z.object()`), no `any`, no XPath, no `page.waitForTimeout(...)`.
- `process.env.*` for URLs/credentials; `enums/{area}/*` for paths/messages.
- Static data is `.ts` with `as const` exports — never `.json`.

If a Critical rule conflicts with the user's request, the agent raises the conflict explicitly. The human decides.

### Phase 5: Verify with the matching skill's checklist

The phased instructions of each specialized skill end with a verification step (often the `## Examples` or a Phase 6 / 7 checklist). Walk through it before declaring the work complete:

- `common-tasks` Phase 6 — generic Verification Checklist (19 boxes).
- `api-testing` Phase 5 — full status-code coverage matrix audit.
- `page-objects` Phase 5 — fixture registration check.
- `refactor-values` Phase 5 — `tsc --noEmit` + `eslint .` + targeted tests.
- `quality-gates` — merge/release readiness checklist and P0/P1 gate policy.

### Phase 6: Run the affected tests

Mandatory. Then:

- **Green:** proceed to Phase 7.
- **Red:** load `debugging`. Do **not** suppress, raise timeouts, or `.skip` without `// FIXME:`. For agent-driven debugging without a GUI, Playwright 1.59+ provides `npx playwright trace open <trace.zip>` (headless trace inspection with `actions` / `action <id>` / `snapshot <id>` subcommands) and `npx playwright test --debug=cli` (agentic step-over via `playwright-cli attach`) — both documented in `debugging`.
- **Suite-only failures:** test independence issue (`test-standards` Phase 9, then `debugging`).
- **CI-only failures:** download CI artifacts and replay locally (`debugging` CI-only replay workflow).

### Phase 7: Commit with a message that explains the *why*

After the user approves the result, commit with a message that:

- Names the **why** in the title (1 line, imperative, specific).
- Lists the substantive changes in the body (bullets).
- Calls out cross-cutting concerns (rules enforced, behaviour changed, files migrated).
- Stays focused — one logical change per commit. Multi-skill refactors land as multiple commits.

The orchestrator's existing commits in this branch (`Refine X skill ...`, `Sync CLAUDE.md ...`, `Add debugging skill ...`) are the reference shape.

---

## Principles That Make the Scaffold AI-Native

The scaffold is engineered so an LLM can reason from a small surface and produce consistent output. Five principles drive this:

1. **Single source of truth for every value class.**
   - URLs / credentials → `process.env.*` (declared in `env/.env.example`).
   - Endpoint paths / route constants / UI message strings / storage-state paths → `enums/{area}/*` and `enums/util/*`.
   - Dynamic test data → `test-data/factories/{area}/*`.
   - Invalid / boundary test data → `test-data/static/{area}/*`.

2. **Hard-stop forbidden patterns** — every Critical block lists NEVER rules with concrete anti-examples. Forbidden patterns are not soft preferences; they are refusal triggers.

3. **Mandatory exploration discipline** — `playwright-cli` for UI, OpenAPI/docs first for API. The agent doesn't speculate about UI text or response shapes.

4. **Strict folder discipline** — every artifact has exactly one home (and the path uses an `{area}` placeholder that the agent resolves with `ls`). Skill triggering by description keyword works because the folder maps cleanly to the skill name.

5. **Phased instructions inside skills** — each specialized skill walks the agent through numbered phases with checklists. The agent doesn't have to invent a workflow per task; it follows the skill's phases.

These five principles together produce **consistent results across sessions, agents, and contributors** — which is the operational definition of "AI-native" in this codebase.

---

## Examples

### Example 1: "Add tests for a new endpoint" (multi-skill chain)

User says: *"Add API tests for `POST /api/products`."*

Lifecycle:

1. **Phase 1** — New artifact (API test).
2. **Phase 2** — Read `CLAUDE.md` → load `common-tasks` (template) → it routes to `api-testing` (deep rules). Confirm OpenAPI exists for `/api/products`; if not, fall back to `apiRequest` exploration. `ls fixtures/api/schemas/`, `ls tests/`, `ls enums/`.
3. **Phase 3** — Propose scope: schema name + location, factory name + location, spec file structure, coverage plan covering every status code from the OpenAPI block, validation tiers (universal `INVALID_*` + per-field omission + path-param fuzzing).
4. **Phase 4** — Apply: `z.strictObject` (`type-safety`), `expect(Schema.parse(body)).toBeTruthy();` (`api-testing` / `type-safety`), `ApiEndpoints.PRODUCTS` (`enums`), Faker factory (`data-strategy`), single-tag `@api` (`test-standards`).
5. **Phase 5** — Verify against `api-testing` Phase 5 coverage matrix and `common-tasks` Phase 6 checklist.
6. **Phase 6** — Run `npx playwright test tests/{area}/api/products.spec.ts`. On red, load `debugging`.
7. **Phase 7** — Commit: *"Add POST /api/products tests with full coverage matrix"*.

### Example 2: "Rename an enum value safely"

User says: *"Backend renamed `/api/users/login` to `/api/auth/login`. Update us."*

Lifecycle:

1. **Phase 1** — Refactor.
2. **Phase 2** — Load `refactor-values`. `ls enums/` to find the file owning the login path. `grep -r "users/login"` to map every usage.
3. **Phase 3** — Propose scope: one enum change + all files that import it.
4. **Phase 4** — Apply the rename. No hardcoded strings introduced.
5. **Phase 5** — `tsc --noEmit` + `eslint .` (`refactor-values` Phase 5).
6. **Phase 6** — Run affected tests. On red, load `debugging`.
7. **Phase 7** — Commit: *"Rename login endpoint constant: /api/users/login → /api/auth/login"*.

---

## Troubleshooting

**The agent generated something that doesn't follow the scaffold's conventions.**
Cause: The relevant specialized skill wasn't loaded — the agent worked from generic Playwright knowledge.
Fix: Name the skill explicitly in the prompt ("use the `api-testing` skill"). The skill will load and the Critical block will catch what was missed.

**I got different answers from Claude (`.claude/`) vs Cursor (`.cursor/`).**
Cause: The mirrors lag. `.claude/skills/` is the canonical source.
Fix: Defer to `.claude/`. If you can, point the other tool at the `.claude/` files (or wait for the sync sweep that brings the mirrors up to date).

**The agent is asking too many questions; I just want it to do the work.**
Cause: Audit-then-edit is the default. It's deliberate for non-trivial work.
Fix: Say "just do it" once. The agent switches to direct mode for the rest of the session for trivial work. For substantive changes, audit-then-edit is the right default — turning it off uniformly leads to drift.

**The agent invented a folder name / enum value / env-var name.**
Cause: Critical rule violated — the agent should have stopped and asked.
Fix: Direct it to re-check via `ls` (paths), `playwright-cli` (UI text), `env/.env.example` (env vars), or the OpenAPI doc (API contracts). If still unknown, the agent must stop and ask the human.

**The agent skipped exploration and invented selectors.**
Cause: Forbidden by Critical (`page-objects`, `selectors`, `CLAUDE.md` "No Substitute UI Exploration").
Fix: Reject the output. Re-prompt requiring `playwright-cli` exploration. Ship nothing until selectors come from observed UI.

**The agent loaded five skills' Critical blocks and is overwhelmed.**
Cause: Skill stacking. Specialized skills load on demand, not all at once.
Fix: Load one entry-point skill (the "First skill to load" column above). It chains to deeper skills only as needed. If you genuinely need three skills' rules at once, the work is too big for one task — split it.

**The agent's commit message says only "Update tests".**
Cause: Phase 7 skipped.
Fix: Reject the message; require a body that names the *why* and the substantive changes. The orchestrator's commit history (`Refine X skill ...`, `Sync CLAUDE.md ...`, `Add debugging skill ...`) is the reference shape.

**The agent wants to run `npm test` after every micro-change.**
Cause: Misreading "run the affected tests" as "run the full suite".
Fix: Re-read Phase 6 — affected tests, not the full suite. `npx playwright test <file>` is the default; `npm test` only at the end of a logical change.

**The agent suppressed a test failure (raised timeout, added `try/catch`, removed an assertion).**
Cause: Critical rule violation — `debugging` Critical forbids suppression.
Fix: Reject the change. Re-load `debugging` and follow the failure protocol. For genuine API mismatches, `api-testing` Phase 6 (`test.skip` + `// FIXME:`).

---

## See Also

- `CLAUDE.md` — the always-loaded orchestrator; this skill complements it (orchestrator = what the rules are; this skill = how the human and agent work together).
- `common-tasks` — copy-paste prompt templates that this workflow points at for specific artifacts.
- `debugging` — the failure-investigation half of the lifecycle (Phase 6 routes here on red).
- `api-testing` — the deep skill for API work; Phase 6 owns the behaviour-mismatch protocol referenced throughout this skill.
- `refactor-values` — the deep skill for changing existing values; this workflow's Refactor lifecycle routes here.
- `page-objects`, `selectors`, `playwright-cli` — the UI authoring chain that this workflow's "Add a page object" lifecycle routes through.
- `test-standards`, `data-strategy`, `type-safety`, `enums`, `config`, `fixtures`, `helpers` — the rest of the specialized suite. This workflow does not restate their rules; it tells you when to load them.
- `test-strategy`, `quality-gates` — planning and readiness layers above implementation.
