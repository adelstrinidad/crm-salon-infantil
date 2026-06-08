---
name: test-strategy
description: >
  Defines the QA automation strategy for this Playwright scaffold: test pyramid
  decisions, risk-based coverage, when to choose API vs UI vs E2E tests,
  smoke/sanity/regression scope, destructive-test policy, and release-readiness
  planning. Use when planning coverage, reviewing suite balance, deciding where
  a scenario belongs, or creating a test plan before implementation.
---

# Test Strategy Skill

## Context

This skill answers "what should we test, at which layer, and why?" It does not
own spec syntax, API schemas, selectors, fixtures, or test data mechanics. Route
those details to `test-standards`, `api-testing`, `selectors`, `fixtures`, and
`data-strategy`.

The strategy is risk-based: cover the highest business and technical risk at
the lowest reliable test layer.

---

## Test Pyramid

| Layer | Use For | Avoid |
|---|---|---|
| API | Contracts, auth, validation, CRUD status matrices, negative cases | Visual or interaction behavior |
| Functional UI | One user-facing feature or page behavior | Full business journeys |
| E2E | Critical cross-feature journeys that prove system integration | Repeating every API/UI edge case |
| Setup/auth | Preparing reusable state such as storage files | Assertions unrelated to setup validity |

Default to API tests for backend contracts and validation because they are
faster, more deterministic, and easier to cover deeply. Use UI tests for
behaviors users perceive. Use E2E sparingly for the few journeys that must work
as a complete product path.

---

## Scenario Placement

| Scenario | Preferred Location |
|---|---|
| Endpoint status codes and response schemas | `tests/{area}/api/` |
| Request body validation and auth matrix | `tests/{area}/api/` |
| Form validation messages and interactive states | `tests/{area}/functional/` |
| Navigation, button behavior, visible feedback | `tests/{area}/functional/` |
| Checkout/login/full purchase journey | `tests/{area}/e2e/` |
| Cross-role or destructive workflow | API or E2E, tagged `@destructive` if state-changing |

If a UI scenario requires many backend preconditions, create state through API
setup and verify through the UI only where the user-visible behavior matters.

---

## Suite Tags

| Tag | Strategic Meaning |
|---|---|
| `@smoke` | Minimal deploy gate for critical happy paths |
| `@sanity` | Fast confidence subset after focused changes |
| `@regression` | Broader feature coverage before release |
| `@api` | API-only contract and behavior tests |
| `@e2e` | Complete user journey across features |
| `@destructive` | State-changing test that must include cleanup; always wins |

Each test has exactly one tag. `@functional` is not part of this framework.

---

## Coverage Planning

Before writing tests for a feature, produce a small plan:

```text
Feature: checkout
Risk: payments and order creation are release-blocking.

API coverage:
- POST /orders: 201, 401, 403, 422 field validation, 405
- GET /orders/{id}: 200, 404, path fuzzing, 405

Functional UI coverage:
- should show validation messages for missing checkout fields
- should update totals when quantity changes

E2E coverage:
- should complete checkout for a valid cart

Out of scope:
- visual styling and third-party payment provider sandbox outages
```

For API work, the coverage plan must enumerate every OpenAPI status code before
code is generated. For UI work, exploration with `playwright-cli` is required
before selectors or page objects are changed.

---

## Bug Severity

Use this when deciding whether a failure blocks release or should be filed for
later work.

| Severity | Meaning | Action |
|---|---|---|
| P0 | Security issue, data loss, app unavailable, critical path impossible | Stop and escalate immediately |
| P1 | Major feature broken with no acceptable workaround | Block release until fixed or explicitly waived |
| P2 | Important behavior broken with workaround or limited scope | File bug and include in release decision |
| P3 | Minor functional, copy, or usability issue | File bug; does not usually block release |
| P4 | Cosmetic/docs-only issue | Track as backlog |

API contract mismatches are bugs. Do not loosen schemas or drop tests to hide
them; use the `api-testing` FIXME protocol.

---

## Anti-Patterns

```text
Bad: test every validation rule through E2E only.
Bad: call a destructive backend mutation @smoke because it is important.
Bad: add a UI test for every API status code.
Bad: mark a failing critical journey as non-blocking without severity rationale.
```

---

## Related Skills

- `quality-gates` — release and merge readiness checks
- `test-standards` — spec-file structure after scenarios are chosen
- `api-testing` — API coverage matrix implementation
- `playwright-cli` — mandatory UI exploration before UI implementation
- `debugging` — failure investigation and escalation
