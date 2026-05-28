---
name: ai1st-arch-legacy-to-modern-design-lite
description: "Generate TO-BE Software Requirements Specification from AS-IS analysis."
disable-model-invocation: true
---

# TO-BE Specification (ai1st-arch-legacy-to-modern-design-lite)

Create TO-BE software requirements specification from AS-IS analysis.

**Role**: PO / Business Analyst
**Command**: `/ai1st-arch-legacy-to-modern-design-lite specify <MODULE_NAME>`

**Examples**:
- `/ai1st-arch-legacy-to-modern-design-lite specify claims`
- `/ai1st-arch-legacy-to-modern-design-lite specify payments`

<!-- KG Protocol Import -->
@.ai/legacy-analysis-process/kg-protocol.md

---

## Knowledge Graph Integration (OPTIONAL — enhances quality)

**Import**: `@.ai/legacy-analysis-process/kg-protocol.md` — defines the full KG Protocol.

**ai1st-arch-legacy-to-modern-design-lite uses these KG capabilities:**
- **Reuse or bootstrap** (Step 1): Reuse AS-IS entities from ai1st-arch-legacy-analysis-lite session, or bootstrap from RTM/LBR files
- **KG-First lookup** (all steps): Check KG for existing entities before creating new ones
- **Progressive enrichment** (Steps 3.5-5): Add `classified:` and `mapped:` observations to AS-IS entities
- **User stories** (Step 3.5): Create `US-{id}` entities with `mapped:` observations
- **Coverage gap detection** (Step 5): Find FR entities without `maps_to` relations

**Namespace additions for ai1st-arch-legacy-to-modern-design-lite (TO-BE):**
- ✅ All namespaces including `classified:` and `mapped:`

**KG-First in each step:**
- Step 1: `read_graph()` to recover AS-IS entities, or bootstrap from RTM/LBR files
- Step 3.5: `search_nodes("FR-")` to get all requirements for story mapping
- Step 4: `open_nodes(["BR-{id}"])` to classify rules (CORE/DYNAMIC/DERIVED, DROOLS YES/NO)
- Step 5: `search_nodes("FR-")` → find FRs without `maps_to` relation = COVERAGE GAP

**Fallback**: If KG MCP unavailable, all steps work via file-based approach.

---

## Purpose

Transform AS-IS documentation into TO-BE module-level SRS and user story structure for modernization.

**This command**:
1. Creates TO-BE folder structure
2. Generates CONTEXT.md with links to AS-IS documents
3. **Creates SRS-{module}.md** (high-level module SRS at arch-to-be-lite/ level)
4. Identifies user stories from AS-IS use case flows
5. For each user story, creates folder with **delta UC** (inherits AS-IS, documents only changes)
6. Updates RTM with TO-BE mapping

**Document creation order within ai1st-arch-legacy-to-modern-design-lite**:
1. `SRS-{module}.md` (module-level SRS — summary, screens, user stories, business rules, entities)
2. `UC-{user-story}.md` per user story (delta UC — establishes what changes per story)

**Document hierarchy** (ai1st-arch-legacy-to-modern-design-lite produces Levels 1-2, developer produces Level 3-4):

```
Level 1: Module SRS (ai1st-arch-legacy-to-modern-design-lite)
  SRS-{module}.md           → High-level module overview, screens, user stories, business rules

Level 2: User Story UC (ai1st-arch-legacy-to-modern-design-lite)
  UC-{user-story}.md        → Delta use case per user story (09.04 template, INHERITED/DELTA)

Level 3: User Story Spec (ai1st-po-specify, developer)
  spec.md                   → Business requirements per user story (spec-template, WHAT + WHY)

Level 4: Implementation Plan (ai1st-dev-plan, developer)
  plan.md                   → Technical design per user story (plan-template, HOW)
```

**Workflow Position**:
```
ai1st-arch-legacy-analysis-lite (AS-IS) → ai1st-arch-legacy-to-modern-design-lite (TO-BE SRS)  → ai1st-po-specify → ai1st-dev-plan
     PO/BA           PO/BA               Dev             Dev

  Produces:       Produces:           Produces:       Produces:
  UC, BRS, SRS    SRS-{module}.md     spec.md         plan.md
  LBR, RTM        UC per story        (per story)     data-model.md
  test.md         CONTEXT.md                          contracts/
```

---

## Step 0: KG Bootstrap or Reuse (OPTIONAL — if KG MCP available)

**Before Step 1**, check if KG has AS-IS entities from a prior ai1st-arch-legacy-analysis-lite session:

```
IF read_graph() returns entities from ai1st-arch-legacy-analysis-lite:
  → Log: "Reusing {N} entities from AS-IS analysis"
  → search_nodes("STEP-601") → verify all steps complete
  → search_nodes("GATE-601") → verify all gates approved
  → All TERM-*, BR-*, FR-*, INT-*, DTO-* entities available

IF KG is empty (new session):
  1. Bootstrap from Glossary/PROJECT-SCOPE (same as ai1st-arch-legacy-analysis-lite Step 0.1)
  2. Bootstrap from RTM-{module}.md:
     For each row: create_entities + create_relations
     Add observations: "context: imported-from = RTM-{module}.md"
  3. Bootstrap from LBR-{module}.md:
     For each rule: create_entities BR-{id}
     Add observations: "context: imported-from = LBR-{module}.md"

IF KG MCP unavailable:
  → Log: "KG unavailable — falling back to file-based approach"
  → Proceed with direct file reads
```

---

## Prerequisites

AS-IS analysis must be complete. Required files in `{ANALYSIS_ROOT}/arch-as-is-lite/`:

| File | Purpose |
|------|---------|
| `UC-{module}.md` | AS-IS use case (09.04 template) - **baseline for delta UCs** |
| `RTM-*.md` | Requirements Traceability Matrix (source of truth) |
| `LBR-business-rules.md` | Legacy business rules |
| `BRS-*.md` | Business requirements |
| `SRS-*.md` | System requirements |
| `TEST-{module}.md` | AS-IS test automation documentation - **baseline for test migration** |

---

## Output Structure

**CRITICAL**: Output folder is `arch-to-be-lite/` (matches ai1st-arch-legacy-analysis-lite's `arch-as-is-lite/`).

```
arch-to-be-lite/
├── SRS-{module}.md               ← Module-level TO-BE SRS (high level)
├── CONTEXT.md                    ← Links to AS-IS + business context
├── TEST-MIGRATION-{module}.md    ← Test migration plan (locator mappings, what changes vs stays)
└── specs/
    ├── {user-story-1}/
    │   ├── UC-{user-story-1}.md  ← Delta UC (inherits AS-IS, documents changes)
    │   └── design/               ← Created by ai1st-po-capture-ui
    ├── {user-story-2}/
    │   ├── UC-{user-story-2}.md
    │   └── design/
    └── ...
```

**After developer handoff** (ai1st-po-specify + ai1st-dev-plan add):
```
    └── {user-story-1}/
        ├── UC-{user-story-1}.md  ← From ai1st-arch-legacy-to-modern-design-lite
        ├── spec.md               ← From ai1st-po-specify (business requirements)
        ├── plan.md               ← From ai1st-dev-plan (technical design)
        └── design/               ← From ai1st-po-capture-ui
```

---

## Sub-Agent Spawning Instructions

When running ai1st-arch-legacy-to-modern-design-lite via sub-agent (e.g., `sessions_spawn`), the spawning agent MUST include these instructions in the task:

```
⚠️ CRITICAL FILE NAMING REQUIREMENTS:
1. Output folder: arch-to-be-lite/ (NOT arch-to-be/)
2. File format: {DOCTYPE}-{module}.md or SRS-{module}.md
3. Examples: SRS-claims.md, CONTEXT.md, UC-claim-detail.md
4. FORBIDDEN: numbered prefixes (01-*, 02-*), generic names (OVERVIEW, ARCHITECTURE)

Read the full process: .claude/commands/ai1st-arch-legacy-to-modern-design-lite.md
```

**Why**: Sub-agents lose context and may invent their own naming conventions. Explicit instructions prevent drift.

---

## Execution Flow

### Step 1: Create Folder Structure

```powershell
$toBeRoot = "{ANALYSIS_ROOT}/arch-to-be-lite"
# Create one folder per identified user story
New-Item -ItemType Directory -Path "$toBeRoot/specs/{user-story-1}" -Force
New-Item -ItemType Directory -Path "$toBeRoot/specs/{user-story-1}/design" -Force
New-Item -ItemType Directory -Path "$toBeRoot/specs/{user-story-2}" -Force
New-Item -ItemType Directory -Path "$toBeRoot/specs/{user-story-2}/design" -Force
```

### Step 2: Generate CONTEXT.md

Create `arch-to-be-lite/CONTEXT.md` with links to all relevant AS-IS documents:

```markdown
# TO-BE Context

**Module**: {module-name}
**Created**: {date}
**Status**: Draft

---

## Source Documents (AS-IS)

| Document | Location | Purpose |
|----------|----------|---------|
| **AS-IS Use Case** | [UC-{module}.md](../arch-as-is-lite/UC-{module}.md) | Baseline UC (09.04 template) |
| **RTM** | [RTM-{module}.md](../arch-as-is-lite/RTM-{module}.md) | Requirements Traceability (source of truth) |
| **Business Rules** | [LBR-business-rules.md](../arch-as-is-lite/LBR-business-rules.md) | Legacy rules for migration |
| **Business Requirements** | [BRS-{module}.md](../arch-as-is-lite/BRS-{module}.md) | Current requirements |
| **System Requirements** | [SRS-{module}.md](../arch-as-is-lite/SRS-{module}.md) | Technical requirements |
| **Test Documentation** | [test.md](../arch-as-is-lite/test.md) | AS-IS test automation |
| **Modernization Strategy** | [MODERNIZATION-STRATEGY.md](../arch-as-is-lite/MODERNIZATION-STRATEGY.md) | Migration approach |

## TO-BE Documents

| Document | Location | Purpose |
|----------|----------|---------|
| **Module SRS** | [SRS-{module}.md](SRS-{module}.md) | TO-BE module overview |
| **User Story: {story-1}** | [specs/{story-1}/](specs/{story-1}/) | Delta UC, spec, plan |
| **User Story: {story-2}** | [specs/{story-2}/](specs/{story-2}/) | Delta UC, spec, plan |

## Next Steps

1. [ ] Review SRS-{module}.md
2. [ ] Review delta UCs per user story
3. [ ] Run ai1st-po-capture-ui for design artifacts
4. [ ] Hand off to developer for ai1st-po-specify per user story
```

### Step 3: Generate SRS-{module}.md

Create `arch-to-be-lite/SRS-{module}.md` — high-level module overview following srs-template structure but at module level (NOT per-screen detail).

**Content** (business level, NO implementation code):

| Section | Content |
|---------|---------|
| Summary | What the module does, migration scope, out of scope |
| Permissions | Roles and access levels |
| Screens | Inventory of all screens/modals in the module |
| User Stories | User story list with links to specs/ folders |
| Key Business Rules | BR table from LBR (rule, description, source, classification) |
| Key Entities | Business-level entity descriptions (no TypeScript/Java) |
| Integration Points | External systems and API endpoints (existing, unchanged) |
| Non-Functional Requirements | NFRs for the module |
| Traceability | AS-IS refs → TO-BE user stories |
| Related Documents | Links to AS-IS docs and delta UCs |

**Content rules**:
- NO implementation code (no TypeScript, Java, Drools DRL, HTML)
- NO component file trees or folder structures
- NO library versions or third-party dependency tables
- Business-level descriptions only (WHAT, not HOW)
- Entities described as business concepts (attributes as bullet points, not interfaces)
- API endpoints listed as table (endpoint, method, purpose) — no request/response schemas

### Step 3.5: Identify User Stories

Analyze the AS-IS UC to identify user stories:

**Sources for user story identification**:
- AS-IS UC Happy Path steps → primary user story
- AS-IS UC Alternate Flows → additional user stories
- AS-IS UC Modals → may be separate stories or part of parent

**User story naming**: Use descriptive kebab-case (e.g., `claims-list`, `claim-detail`, `wht-summary`)

**Document user stories in SRS-{module}.md User Stories section**:

```markdown
| ID | User Story | Screen | Priority | Spec |
|----|-----------|--------|----------|------|
| US-001 | As a [role], I want to [action] so that [benefit] | [Screen] | Must/Should/Could | [specs/{story}/spec.md](specs/{story}/spec.md) |
```

#### Step 3.5 KG Integration (if KG available)

For each user story identified, create KG entities and map requirements:

```
# Create user story entity:
create_entities([{
  name: "US-001", entityType: "UserStory",
  observations: [
    "mapped: story = As a taxpayer, I want to view my claims list",
    "mapped: screen = Claims List",
    "mapped: priority = MUST"
  ]
}])

# Map existing FR entities to user stories:
search_nodes("FR-") → get all known requirements
For each FR that belongs to this story:
  create_relations([{
    from: "FR-001", to: "US-001", relationType: "maps_to"
  }])
  add_observations([{
    entityName: "FR-001",
    contents: ["mapped: user-story = US-001", "mapped: phase1 = MIGRATE"]
  }])

# Link story to AS-IS use case:
create_relations([{
  from: "US-001", to: "UC-{id}", relationType: "derived_from"
}])
```

### Step 4: Generate Delta TO-BE Use Cases

**CREATE ONE PER USER STORY**. Each delta UC establishes what changes (and what doesn't) from the user's perspective.

**Migration principle**: If the modernization objective is "no end-user impact, technology change only", then most UC sections are INHERITED from AS-IS. Only technology-specific sections change.

Create `arch-to-be-lite/specs/{user-story}/UC-{user-story}.md`:

**Template structure** (09.04 template, delta format):

| Section | Action | When to use |
|---------|--------|-------------|
| 1. Metadata | MODIFIED | Add `AS-IS Baseline` field linking to AS-IS UC |
| 2. Document Control | MODIFIED | Add TO-BE references |
| 3. Summary | INHERITED | Write "INHERITED from AS-IS" if no business change |
| 4. Actors | INHERITED | Same actors unless new roles added |
| 5. Preconditions | DELTA | Document authentication changes (session -> JWT) |
| 6. Trigger | DELTA | Document URL/route and entry point changes |
| 7. Happy Path | INHERITED | Same steps; add technology mapping table |
| 8. Alternate Flows | INHERITED | Same flows; note UI component changes |
| 9. Exceptions | INHERITED | Same handling; note enhancements (loading states) |
| 10. Postconditions | INHERITED | Usually no change |
| 11. Input Data | INHERITED | Same fields unless API changes |
| 12. Calculations | INHERITED | Same logic, different implementation |
| 13. Outputs | INHERITED | Usually no change |
| **14. Design** | **CHANGED** | **Primary section that differs** - Angular components, Material UI, component hierarchy |
| 15. Access Control | DELTA | Authentication mechanism change |
| 16. Acceptance Criteria | EXTENDED | Inherit all AS-IS criteria + add responsive/a11y/performance |
| 17. Related UCs | INHERITED | Usually no change |
| 18. Notes | MODIFIED | Address AS-IS anti-patterns resolved by TO-BE |

**Section status keywords**:
- **INHERITED**: "INHERITED from AS-IS UC-{id} Section N. No change."
- **DELTA**: Show AS-IS vs TO-BE comparison table for changed attributes
- **CHANGED**: Full rewrite of the section (typically only Section 14: Design)
- **EXTENDED**: Inherit AS-IS content + add new criteria

**Delta Summary table** (MANDATORY at end of document):

```markdown
## Delta Summary

| Section | Status | Notes |
| --- | --- | --- |
| 3. Summary | INHERITED | No change |
| 5. Preconditions | DELTA | Authentication: session -> JWT |
| 6. Trigger | DELTA | URL and entry point change |
| 7. Happy Path | INHERITED | Same steps, different implementation |
| **14. Design** | **CHANGED** | **Primary change: JSP -> Angular** |
| 16. Acceptance Criteria | EXTENDED | Adds responsive/a11y criteria |

**End-user visible changes**: NONE / [list changes]
**Technology changes**: Section 14 (Design) is the only substantive change
```

**When business flows DO change**: If modernization introduces new flows or removes legacy workarounds, use MODIFIED status and document both the AS-IS flow and the TO-BE replacement explicitly with rationale.

#### Step 4 KG Integration: Classification Phase (if KG available)

This is where business rules get classified for the first time. During AS-IS (ai1st-arch-legacy-analysis-lite), rules were discovered but NOT classified. Now classify:

```
For each business rule referenced in delta UC:
  1. open_nodes(["BR-{id}"])        ← exists from AS-IS
  2. Classify (first time!):
     add_observations([{
       entityName: "BR-001",
       contents: [
         "classified: type = CORE",              # CORE | DYNAMIC | DERIVED
         "classified: drools-candidate = NO",     # YES | NO
         "classified: rationale = Display logic only"
       ]
     }])
  3. The BR entity now has BOTH AS-IS discovery facts AND TO-BE classifications
```

**Classification rules:**
- `CORE`: Must work, non-negotiable business logic
- `DYNAMIC`: Configurable, may change by regulation
- `DERIVED`: Calculated from other values (not stored)
- `drools-candidate = YES`: Rule should move to Drools engine
- `drools-candidate = NO`: Rule stays in application code

---

### Step 5: Update RTM

Add TO-BE mapping columns to RTM:

```markdown
| AS-IS Ref | Description | TO-BE User Story | Status |
|-----------|-------------|-----------------|--------|
| SR-001 | Display claims list | US-001 | Draft |
| SR-002 | Filter claims | US-001 | Draft |
| SR-003 | View claim detail | US-002 | Draft |
| BR-001 | Tax type eligibility | US-001 | Draft |
```

#### Step 5 KG Integration: Coverage Gap Detection (if KG available)

After updating RTM, use KG to detect requirements that have no TO-BE mapping:

```
# Find all FR entities
search_nodes("FR-")

# For each FR, check if it has a maps_to relation:
# FR entities WITHOUT "mapped: user-story = ..." observation = COVERAGE GAP

# Report coverage gaps:
"COVERAGE GAP REPORT:
  FR-003: No user story mapping (Display claim audit trail)
  FR-007: No user story mapping (Export claims to Excel)
  → These requirements need TO-BE story assignment or explicit OUT-OF-SCOPE justification"
```

**Coverage gap action**: For each gap, either:
1. Assign to an existing user story (add `maps_to` relation)
2. Create a new user story for unmapped requirements
3. Mark as OUT-OF-SCOPE with justification in SRS-{module}.md

---

### Step 6: Generate TEST-MIGRATION-{module}.md

**Purpose**: Document how to migrate existing test automation to Angular. Focus on **updating existing tests**, not rewriting from scratch.

**Input**: `arch-as-is-lite/TEST-{module}.md` (AS-IS test documentation)

**Content structure**:

```markdown
# Test Migration Plan - {Module}

## 1. Migration Approach

| Aspect | Approach |
|--------|----------|
| Test Logic | ✅ KEEP - Same assertions and flows |
| Locators | 🔄 UPDATE - Map to Angular data-testid selectors |
| Wait Strategies | 🔄 UPDATE - Angular-aware waits |
| Page Objects | 🔄 UPDATE - Same structure, new selectors |
| Test Data | ✅ KEEP - Same fixtures and data |

## 2. Page Object Migration

### 2.1 {PageObjectName}.java → {PageObjectName}.ts

| AS-IS Locator | Element | TO-BE Selector |
|---------------|---------|----------------|
| `#claimsList` | Claims table | `[data-testid="claims-list"]` |
| `.claim-row` | Claim row | `[data-testid="claim-row"]` |
| `//button[text()='View']` | View button | `[data-testid="view-claim-btn"]` |

### 2.2 Method Migration

| AS-IS Method | TO-BE Method | Changes |
|--------------|--------------|---------|
| `getClaimsList()` | `getClaimsList()` | Selector only |
| `clickViewClaim(int row)` | `clickViewClaim(row: number)` | Selector + TypeScript |
| `waitForLoading()` | `waitForLoading()` | Angular await pattern |

## 3. Test Class Migration

| AS-IS Test Class | TO-BE Spec File | Changes |
|------------------|-----------------|---------|
| `ClaimsListTest.java` | `claims-list.spec.ts` | Framework (TestNG → Playwright/Cypress) |

## 4. Wait Strategy Updates

| AS-IS Pattern | TO-BE Pattern |
|---------------|---------------|
| `Thread.sleep(1000)` | ❌ Remove - use Angular waits |
| `WebDriverWait.until(visible)` | `await page.waitForSelector()` |
| Explicit waits | `await component.whenStable()` |

## 5. data-testid Convention

All Angular components must include `data-testid` attributes:

| Component | data-testid Pattern |
|-----------|---------------------|
| List container | `{module}-list` |
| List row | `{module}-row` |
| Detail view | `{module}-detail` |
| Action buttons | `{action}-{module}-btn` |
| Form fields | `{field}-input` |

## 6. Migration Checklist

- [ ] All page objects have TO-BE selector mappings
- [ ] All test methods documented for migration
- [ ] data-testid conventions defined
- [ ] Wait strategies updated for Angular
- [ ] Test data compatibility verified
```

**Key principles**:
- **Preserve test logic** — assertions and business validation stay the same
- **Update only selectors** — map old locators to new data-testid attributes
- **Document the mapping** — clear table from AS-IS to TO-BE for each element

---

### Step 7: Execute ai1st-po-specify for Each User Story (MANDATORY)

**Purpose**: Generate `spec.md` for each user story identified in Step 3.5.

**ai1st-po-specify is part of ai1st-arch-legacy-to-modern-design-lite workflow** — PO/BA runs it, not developer.

For each user story folder in `specs/`:
1. Read the delta UC (`UC-{user-story}.md`)
2. Read AS-IS sources (UC, LBR, RTM)
3. Generate `spec.md` following spec-template.md

**Migration project context for ai1st-po-specify:**

| Rule | Description |
|------|-------------|
| **All AS-IS requirements are mandatory** | There are no optional features in migration scope |
| **Priorities come from PROJECT-SCOPE.md and RTM** | Do not invent or assume priorities |
| **Scope is fixed** | AS-IS features = TO-BE features (no additions or removals unless explicitly stated in MODERNIZATION-STRATEGY.md) |
| **Traceability required** | Every requirement must trace back to AS-IS source (RTM, UC, LBR) |

**Context files for ai1st-po-specify:**
- `arch-as-is-lite/RTM-{module}.md` — source of truth for requirements
- `arch-as-is-lite/UC-{module}.md` — AS-IS use case baseline
- `arch-as-is-lite/LBR-{module}.md` — business rules
- `arch-to-be-lite/SRS-{module}.md` — TO-BE module overview
- `arch-to-be-lite/specs/{user-story}/UC-{user-story}.md` — delta UC for this story

**Output per user story:**
```
specs/{user-story}/
├── UC-{user-story}.md   ← From Step 4 (delta UC)
└── spec.md              ← From Step 7 (ai1st-po-specify)
```

---

## Handoff to Developer

After ai1st-arch-legacy-to-modern-design-lite completes (including ai1st-po-specify for all user stories), the PO/BA hands off to the developer:

```
PO/BA delivers (ai1st-arch-legacy-to-modern-design-lite):        Developer creates (ai1st-dev-plan):
├── SRS-{module}.md            
├── CONTEXT.md                 
├── TEST-MIGRATION-{module}.md 
└── specs/{user-story}/        
    ├── UC-{user-story}.md     
    └── spec.md          →     plan.md (technical design)
```

1. **PO/BA optionally runs ai1st-po-capture-ui** to add design artifacts per story
2. **Developer runs ai1st-dev-plan** per user story to create plan.md (technical design)

**Note**: Angular-specific technical specs (COMPONENT-SPEC, SERVICE-SPEC, STATE-SPEC, etc.) are **NOT** part of ai1st-arch-legacy-to-modern-design-lite. They are **implementation details** produced by developers during ai1st-dev-plan or implementation.

---

## Related Commands

| Command | Role | Output | Level |
|---------|------|--------|-------|
| ai1st-arch-legacy-analysis-lite | PO/BA | AS-IS analysis (UC, BRS, SRS, LBR, RTM, TEST, DTO, MODERNIZATION-STRATEGY) | Module |
| **ai1st-arch-legacy-to-modern-design-lite** | **PO/BA** | **SRS, CONTEXT, TEST-MIGRATION, specs/{UC + spec.md}** | **Module + Story** |
| ai1st-po-capture-ui | PO/BA or Dev | Design artifacts per story | Story |
| ai1st-dev-plan | Dev | plan.md per user story (technical design) | Story |

---

*Version: 3.4 | Updated: 2026-02-10*

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 3.4 | 2026-02-10 | Added: Knowledge Graph integration — KG Protocol import, Step 0 Bootstrap/Reuse, Step 3.5 User Story entities, Step 4 Classification phase (classified:/mapped: observations), Step 5 Coverage gap detection |
| 3.3 | 2026-02-09 | BREAKING: ai1st-po-specify execution is now part of ai1st-arch-legacy-to-modern-design-lite (Step 7), not developer handoff. Clarified that Angular-specific specs (COMPONENT-SPEC, SERVICE-SPEC, etc.) are NOT ai1st-arch-legacy-to-modern-design-lite outputs - they belong to ai1st-dev-plan (developer). |
| 3.2 | 2026-02-09 | Added: TEST-MIGRATION-{module}.md output (Step 6) for test migration planning |
| 3.1 | 2026-02-06 | Added: Migration Context for ai1st-po-specify handoff (mandatory requirements, scope rules, context files) |
| 3.0 | 2026-02-06 | Restructured: SRS at module level, user stories in specs/ folders, spec.md moved to ai1st-po-specify, removed FE/BE/BW/DM chapters from ai1st-arch-legacy-to-modern-design-lite |
| 2.1 | 2026-02-06 | Added: Delta TO-BE UC (Step 2.5), UC-first creation order, delta section status keywords, delta summary table |
| 2.0 | 2026-02-06 | Complete rewrite: PO/BA tool, CONTEXT.md, spec.md chapters, RTM integration |
| 1.0 | 2026-02-05 | Initial version (single spec generation) |
