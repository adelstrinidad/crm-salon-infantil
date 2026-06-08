---
name: quality-gates
description: >
  Defines merge and release quality gates for this Playwright scaffold. Use
  when deciding whether a change is done, reviewing PR readiness, setting CI
  checks, auditing skipped tests, or determining whether failures block release.
---

# Quality Gates Skill

## Context

This skill answers "is this change ready to merge or release?" It does not own
how to write the tests. Route implementation details to `test-standards`,
`api-testing`, `page-objects`, `data-strategy`, and `type-safety`.

Quality gates are intentionally boring: green checks, no hidden coverage gaps,
and failures classified with clear severity.

---

## Required Gates

| Gate | Requirement | Blocks? |
|---|---|---|
| TypeScript | `npx tsc --noEmit` passes | Yes |
| Lint/format | ESLint and Prettier pass without warnings | Yes |
| Affected tests | Modified or related specs pass | Yes |
| Smoke | Critical `@smoke` suite passes before release | Yes |
| API coverage | Every documented status code has a test or FIXME skip | Yes |
| Skips | No `test.skip` without `// FIXME:` and reason | Yes |
| Secrets | No credentials, tokens, URLs, or endpoint paths hardcoded | Yes |
| Test data | Factories/static TS data follow `data-strategy` | Yes |
| P0/P1 bugs | No open unwaived P0/P1 bugs | Yes |

Use the smallest meaningful check set for local work, then expand in CI or
before release.

---

## Local Done Checklist

For a normal code or test change:

```bash
npx tsc --noEmit
npx eslint .
npx playwright test tests/{area}/path/to/affected.spec.ts
```

If the repo exposes equivalent npm scripts, prefer those scripts. If a command
cannot run locally, report the reason and the remaining risk.

---

## Release Gate Checklist

Before release:

- `@smoke` is green.
- Relevant `@api` suites are green for changed contracts.
- No P0 bugs are open.
- P1 bugs are fixed or explicitly waived by the team.
- All `test.skip` calls include `// FIXME:` with a bug link or clear reason.
- All destructive tests include cleanup hooks.
- CI artifacts are uploaded for failed retries: traces, screenshots, videos,
  blob report, or HTML report as configured.

---

## Failure Policy

| Failure | Action |
|---|---|
| P0 | Stop release and escalate immediately |
| P1 | Block release unless explicitly waived |
| P2 | Include in release risk decision |
| P3/P4 | Track without blocking unless volume indicates systemic quality risk |
| Flake | Load `debugging`, prove with repeat runs, fix root cause |
| API mismatch | Use `api-testing` FIXME protocol; do not loosen schema |

---

## Anti-Patterns

```text
Bad: merging because only one test is failing.
Bad: raising timeouts to pass a gate.
Bad: deleting assertions to make CI green.
Bad: accepting a skipped test without a FIXME reason.
Bad: treating type generics as API validation without schema parse assertions.
```

---

## Related Skills

- `test-strategy` — deciding which coverage is required
- `debugging` — what to do when a gate is red
- `api-testing` — API coverage and FIXME protocol
- `common-tasks` — implementation checklist for generated artifacts
