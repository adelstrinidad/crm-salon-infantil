# Knowledge Graph Protocol

<!-- This protocol governs AI agent behavior when using Knowledge Graph MCP during legacy analysis and modernization workflows. All five commands (ai1st-arch-legacy-sys-analysis, ai1st-arch-legacy-analysis-lite, ai1st-arch-legacy-to-modern-design, ai1st-arch-legacy-to-modern-design-lite, n-630) import this protocol. -->

## Core Principles

### I. KG as Active Working Memory

The Knowledge Graph is the AI's **working memory** during analysis sessions — not just a storage layer. The AI must actively consult KG at every step to prevent terminology drift, entity duplication, and scope violations.

- **Git-versioned markdown files** remain the persistent source of truth
- **KG** is the session's working memory (entities, relations, observations)
- **ai1st-ops-sync-knowledge** bridges KG → git files at session end

### II. KG-First Rule (NON-NEGOTIABLE)

> **Before creating ANY new entity, term, ID, abbreviation, or relation, the AI MUST first query KG.**
> - If a matching entity exists → use it (add observations)
> - If no match → create new entity
> - NEVER invent a domain term without checking `open_nodes(["TERM-{term}"])`
> - NEVER create a business rule without checking `search_nodes("{rule keywords}")`

**Lookup sequence for every new discovery:**
```
1. search_nodes("{keywords}") → check for existing entity
2. If found → add_observations to existing entity
3. If not found → create_entities with appropriate namespace observations
4. For domain terms → open_nodes(["TERM-{term}"]) → use KG-verified meaning
5. For scope decisions → search_nodes("SCOPE-{component}") → respect boundaries
```

### III. Progressive Enrichment

Entities grow over time through independently appendable observations. No field is ever "required" at creation time. AS-IS analysis adds discovery facts. TO-BE analysis adds classification facts.

### IV. Fallback When KG Unavailable

All KG operations are **optional enhancements**. If KG MCP is unavailable:
- Log: `"KG unavailable — falling back to file-based approach"`
- Continue with direct file reads (Glossary.md, PROJECT-SCOPE.md)
- Document generation proceeds normally using markdown files as source
- VV validation agents use PowerShell scripts (unchanged)

---

## Observation Format

### Atomic Key-Value Pattern

Each observation is a **single fact** with a namespace prefix:

```
"{namespace}: {key} = {value}"
```

### Namespace Definitions

| Prefix | Added During | Meaning | Example |
|--------|-------------|---------|---------|
| `context:` | Bootstrap (Step 0) | Facts from authoritative documents | `context: meaning = Additional Tax` |
| `discovered:` | AS-IS analysis (ai1st-arch-legacy-sys-analysis/ai1st-arch-legacy-analysis-lite) | Raw facts from code analysis | `discovered: source = Validator.java#L102` |
| `verified:` | Gate 0.5 / VV agents | Grep-confirmed facts | `verified: code-evidence = AdditionalTax.java` |
| `classified:` | TO-BE analysis (ai1st-arch-legacy-to-modern-design/ai1st-arch-legacy-to-modern-design-lite) | Classification decisions | `classified: type = CORE` |
| `mapped:` | TO-BE analysis (ai1st-arch-legacy-to-modern-design/ai1st-arch-legacy-to-modern-design-lite) | TO-BE mapping decisions | `mapped: user-story = US-001` |
| `gate:` | Human gates | Human decisions | `gate: decision = APPROVED` |
| `process:` | Process tracking | Step progress | `process: status = complete` |

### Namespace Discipline

- **AS-IS commands** (ai1st-arch-legacy-sys-analysis, ai1st-arch-legacy-analysis-lite): Use `context:`, `discovered:`, `verified:`, `gate:`, `process:` only
- **TO-BE commands** (ai1st-arch-legacy-to-modern-design, ai1st-arch-legacy-to-modern-design-lite): Use all namespaces. Add `classified:` and `mapped:` to enrich existing AS-IS entities
- **Gap analysis** (n-630): Uses ALL namespaces — reads both AS-IS and TO-BE, adds `discovered:` for gap findings, `classified:` for severity. New entity types: `UIGap` (GAP-{module}-{NNN}), `ScreenMapping` (SCREEN-{name}). New relations: `gaps_from`, `affects`, `maps_to`.
- **NEVER** modify or delete existing observations — only append new ones
- **NEVER** use `classified:` or `mapped:` during AS-IS analysis (classification is unknown at that point)

---

## Entity Types

### Process Entities

| Entity Type | Name Pattern | When Created | Purpose |
|-------------|-------------|-------------|---------|
| `Session` | `SESSION-{module}` | Step 0 | Session state, variables, timestamps |
| `ProcessStep` | `STEP-{cmd}-{N}` | At step start | Track step progress and outputs |
| `Gate` | `GATE-{cmd}-{N}` | At gate | Track human decisions |

### Domain Entities (AS-IS — discovered during ai1st-arch-legacy-sys-analysis/ai1st-arch-legacy-analysis-lite)

| Entity Type | Name Pattern | When Created | Initial Observations |
|-------------|-------------|-------------|---------------------|
| `Module` | `MOD-{name}` | Bootstrap | `context: scope = IN_SCOPE` |
| `GlossaryTerm` | `TERM-{abbrev}` | Bootstrap | `context: meaning = ...` |
| `ScopeBoundary` | `SCOPE-{item}` | Bootstrap | `context: status = IN_SCOPE / OUT_OF_SCOPE` |
| `StatusValue` | `STATUS-{enum}` | Bootstrap or Step 1 | `context: business-term = ...` |
| `BusinessRule` | `BR-{id}` | Step 1 | `discovered: rule = ...` |
| `Requirement` | `FR-{id}` | Step 1 | `discovered: description = ...` |
| `UseCase` | `UC-{id}` | Step 2 | `discovered: name = ...` |
| `Endpoint` | `INT-{id}` | Step 1 | `discovered: path = ...` |
| `DataObject` | `DTO-{id}` | Step 1 | `discovered: fields = ...` |

### Domain Entities (TO-BE — added during ai1st-arch-legacy-to-modern-design/ai1st-arch-legacy-to-modern-design-lite)

| Entity Type | Name Pattern | When Created | Initial Observations |
|-------------|-------------|-------------|---------------------|
| `UserStory` | `US-{id}` | ai1st-arch-legacy-to-modern-design-lite Step 3.5 | `mapped: story = As a...` |
| `DeltaUC` | `DUC-{story}` | ai1st-arch-legacy-to-modern-design-lite Step 4 | `mapped: delta-sections = ...` |
| `ComponentSpec` | `SPEC-{type}-{name}` | ai1st-arch-legacy-to-modern-design Phase 2-4 | `mapped: angular-component = ...` |

---

## Relation Types

### AS-IS Relations (created during ai1st-arch-legacy-sys-analysis/ai1st-arch-legacy-analysis-lite)

| Relation | From → To | Meaning |
|----------|-----------|---------|
| `belongs_to` | BR/FR/UC/INT/DTO → Module | Scoping |
| `traces_to` | BR → source location | Code traceability |
| `validates` | BR → FR | Rule implements requirement |
| `applied_in` | BR → UC | Rule used in use case step |
| `uses_term` | BR/FR → GlossaryTerm | Terminology link |
| `has_status` | entity → StatusValue | Status code mapping |

### TO-BE Relations (added during ai1st-arch-legacy-to-modern-design/ai1st-arch-legacy-to-modern-design-lite to existing entities)

| Relation | From → To | Meaning |
|----------|-----------|---------|
| `maps_to` | FR → UserStory | AS-IS req → TO-BE story |
| `derived_from` | US → UC | Story origin |
| `modifies` | DeltaUC → UC | Delta to AS-IS UC |
| `depends_on` | US → US | Story dependency |
| `specifies` | ComponentSpec → US | Component implements story |

### Principle: Relations Are Progressive

ai1st-arch-legacy-sys-analysis/ai1st-arch-legacy-analysis-lite create entities and AS-IS relations. ai1st-arch-legacy-to-modern-design/ai1st-arch-legacy-to-modern-design-lite ADD new relations to existing entities without modifying AS-IS relations. The graph grows, never shrinks.

---

## Bootstrap Protocol (Step 0)

### When to Bootstrap

Bootstrap runs at the **start of every analysis session** (ai1st-arch-legacy-sys-analysis, ai1st-arch-legacy-analysis-lite, ai1st-arch-legacy-to-modern-design, ai1st-arch-legacy-to-modern-design-lite), BEFORE any analysis work.

### Bootstrap Sequence

```
Step 0: Bootstrap Knowledge Graph

1. CHECK: read_graph() — if entities exist from prior session, log and skip bootstrap
   → "KG has {N} entities from prior session. Skipping bootstrap."

2. READ Glossary.md (resolved path from ai1st-arch-legacy-analysis-lite Step 0.55 — module-local or shared)
   → CREATE TERM-{abbrev} entities
   Each with: "context: meaning = {definition}", "context: source = Glossary.md",
              "context: source-path = {resolved path}"

3. READ PROJECT-SCOPE.md
   → CREATE MOD-{name} entity for in-scope module
   → CREATE SCOPE-{item} entities for IN/OUT scope boundaries
   Each with: "context: status = IN_SCOPE / OUT_OF_SCOPE", "context: paths = ..."

6. CREATE SESSION-{module} entity
   With: "context: project-root = {path}", "context: analysis-root = {path}",
         "context: command = n-{NNN}", "context: started = {ISO timestamp}"

7. VERIFY: read_graph() → confirm entities loaded
   → Log: "KG bootstrap: {N} terms, {N} scopes, {N} statuses loaded"
```

### Bootstrap for TO-BE Commands (ai1st-arch-legacy-to-modern-design/ai1st-arch-legacy-to-modern-design-lite)

If running in a new session (no AS-IS entities in KG):

```
ADDITIONAL: Bootstrap from AS-IS output documents

8. READ RTM-{module}.md → CREATE FR-{id}, BR-{id} entities + relations
   Each with: "context: imported-from = RTM-{module}.md"

9. READ LBR-{module}.md → ENRICH BR-{id} entities with rule details
   Each with: "context: imported-from = LBR-{module}.md"
```

---

## Process Step Tracking

### Step Lifecycle

```
# Step starts:
create_entities([{
  name: "STEP-601-1",
  entityType: "ProcessStep",
  observations: ["process: status = in_progress", "process: started = {ISO}"]
}])

# Step completes:
add_observations([{
  entityName: "STEP-601-1",
  contents: [
    "process: status = complete",
    "process: completed = {ISO}",
    "process: entities-created = BR:{N}, FR:{N}, INT:{N}",
    "process: artifacts = DEPENDENCIES-{module}.md"
  ]
}])
```

### Gate Lifecycle

```
# Gate reached:
create_entities([{
  name: "GATE-601-1",
  entityType: "Gate",
  observations: [
    "gate: status = BLOCKED",
    "gate: entity-counts = BR:{N}, FR:{N}, INT:{N}, TERM:{N}",
    "gate: artifacts-complete = {list}",
    "gate: artifacts-pending = {list}"
  ]
}])

# Gate approved:
add_observations([{
  entityName: "GATE-601-1",
  contents: [
    "gate: status = APPROVED",
    "gate: decision = APPROVED",
    "gate: timestamp = {ISO}",
    "gate: notes = {human feedback if any}"
  ]
}])
```

### Session Resume After /clear

```
Resume sequence:
1. open_nodes(["SESSION-{module}"]) → restore variables, command, timestamps
2. search_nodes("STEP-{cmd}") → find all step entities, determine last completed step
3. search_nodes("GATE-{cmd}") → confirm gate decisions
4. search_nodes("TERM-") → terminology still available (no re-read of Glossary needed)
5. search_nodes("BR-") → all business rules available
6. search_nodes("SCOPE-") → scope boundaries available
→ AI immediately knows where to resume, with full entity context
```

### Cross-Command Continuity (ai1st-arch-legacy-analysis-lite → ai1st-arch-legacy-to-modern-design-lite)

```
# ai1st-arch-legacy-to-modern-design-lite checks prior AS-IS completion:
search_nodes("STEP-601") → finds all ai1st-arch-legacy-analysis-lite steps
search_nodes("GATE-601") → confirms all gates approved
→ "AS-IS analysis complete. {N} entities available for TO-BE enrichment."
```

---

## Entity Lifecycle Examples

### Business Rule: Full Lifecycle (AS-IS → TO-BE)

```
# 1. CREATED during ai1st-arch-legacy-analysis-lite Step 1 (discovery):
Entity: BR-001  Type: BusinessRule
  "discovered: rule = Hide due date column for AT claim types"
  "discovered: source = ListTaxpayerClaims.jsp#L500"
  "discovered: pattern = balanceAmount"

# 2. VERIFIED during ai1st-arch-legacy-analysis-lite Step 1 (grep confirmation):
  "verified: grep-confirmed = 2026-02-10"

# 3. DOCUMENTED during ai1st-arch-legacy-analysis-lite Step 2 (written to file):
  "verified: documented-in = LBR-claims.md"

# 4. CLASSIFIED during ai1st-arch-legacy-to-modern-design-lite Step 4 (TO-BE classification):
  "classified: type = CORE"
  "classified: drools-candidate = NO"
  "classified: rationale = Display logic, not business rule engine material"

# 5. MAPPED during ai1st-arch-legacy-to-modern-design-lite Step 3.5 (TO-BE story assignment):
  "mapped: user-story = US-001"
  "mapped: phase1 = MIGRATE"
```

### Glossary Term: Full Lifecycle

```
# 1. BOOTSTRAPPED from Glossary.md (Step 0):
Entity: TERM-AT  Type: GlossaryTerm
  "context: meaning = Additional Tax"
  "context: source = Glossary.md"
  "context: incorrect-usage = NOT Accommodation Tax"

# 2. VERIFIED during Gate 0.5 (code search):
  "verified: code-evidence = AdditionalTax.java exists"
  "verified: enum-values = CLAIM_INCOME_AT, CLAIM_WITHHOLDING_AT"
  "gate: stakeholder-confirmed = 2026-02-10"

# 3. ENRICHED during Step 1 (usage discovery):
  "discovered: used-in = ListTaxpayerClaims.jsp#L498"
  "discovered: ui-behavior = AT claims have empty due date column"
```

### Status Value: Full Lifecycle

```
# 1. BOOTSTRAPPED from PROJECT-SCOPE.md (Step 0):
Entity: STATUS-CLAIM-PAID  Type: StatusValue
  "context: business-term = Paid"
  "context: code-logic = BALANCE_AMOUNT = 0"
  "context: value-type = DERIVED (not a stored field)"
  "context: source = PROJECT-SCOPE.md"

# 2. VERIFIED during Step 1 (code confirmation):
  "verified: code-evidence = No status enum exists; derived from balanceAmount"
  "discovered: derivation-logic = balanceAmount.compareTo(BigDecimal.ZERO) == 0"
```

---

## KG-First Lookup Patterns

### Term Lookup (during extraction)

```
When AI encounters a domain abbreviation (AT, WHT, VAT, IT, etc.):

1. open_nodes(["TERM-{abbrev}"])
2. Read "context: meaning" observation → use this exact term
3. If "context: incorrect-usage" exists → avoid those interpretations
4. If term not in KG:
   a. search_nodes("{abbreviation}") for partial matches
   b. If still not found: create TERM entity with "discovered:" namespace
   c. Flag for review: add "discovered: needs-review = true"
```

### Scope Check (during file analysis)

```
When AI is about to analyze a file or component:

1. Extract component name from file path
2. search_nodes("SCOPE-{component}")
3. If found and "context: status = OUT_OF_SCOPE":
   → Skip file, log: "Skipped {file}: out of scope per KG"
4. If not found:
   → Proceed with analysis (assume in-scope unless proven otherwise)
```

### Duplicate Check (before creating business rule)

```
When AI discovers a business rule in code:

1. Extract keywords from the rule (e.g., "balance", "payment", "AT")
2. search_nodes("{keyword1} {keyword2}")
3. If similar entity found:
   → Read its observations
   → If same rule from different code location:
     add_observations: "discovered: also-found-in = {new location}"
   → If different rule: create new entity with next ID
4. If no match: create new BR-{id} entity
```

### Status Value Check (during code analysis)

```
When AI encounters status-like values or enums:

1. search_nodes("STATUS-{value}")
2. If found: use documented "context: business-term" and "context: value-type"
3. If not found:
   a. Create STATUS entity with "discovered:" observations
   b. Flag: "discovered: needs-verification = true"
   c. Do NOT assume meaning — document only what code shows
```

---

## Token Budget Reference

| Operation | Approx Tokens | Notes |
|-----------|--------------|-------|
| `create_entities` (single) | ~100-150 | Includes entity + observations |
| `create_entities` (batch of 5) | ~300-500 | More efficient than individual calls |
| `create_relations` (batch of 5) | ~200-300 | |
| `add_observations` (single entity) | ~80-120 | |
| `read_graph` | ~200-500 | Depends on graph size |
| `search_nodes` | ~100-200 | |
| `open_nodes` (1-3 entities) | ~100-200 | |

**Session budgets:**
| Command | KG Overhead | % of Session |
|---------|------------|-------------|
| ai1st-arch-legacy-analysis-lite (LITE AS-IS) | ~17,000 | ~2% |
| ai1st-arch-legacy-to-modern-design-lite (LITE TO-BE) | ~8,500 | ~2% |
| ai1st-arch-legacy-sys-analysis (FULL AS-IS) | ~25,000 | ~2% |
| ai1st-arch-legacy-to-modern-design (FULL TO-BE) | ~12,000 | ~2% |
| n-630 (UI Gap Analysis) | ~10,000 | ~1% |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-10 | Initial KG Protocol: KG-first rule, progressive enrichment, bootstrap, process tracking, observation namespaces |
| 1.0.1 | 2026-02-10 | Moved from `.ai/0_core_memory/` to `.ai/legacy-analysis-process/` (legacy-analysis-specific) |
| 1.1.0 | 2026-02-17 | Added n-630 UI Gap Analysis: UIGap and ScreenMapping entity types, gaps_from/affects/maps_to relations, cross-cutting namespace usage |

---

*This protocol is imported by: ai1st-arch-legacy-sys-analysis, ai1st-arch-legacy-analysis-lite, ai1st-arch-legacy-to-modern-design, ai1st-arch-legacy-to-modern-design-lite, n-630 commands via `@.ai/legacy-analysis-process/kg-protocol.md`*
