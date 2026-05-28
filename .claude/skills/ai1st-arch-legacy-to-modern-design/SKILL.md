---
name: ai1st-arch-legacy-to-modern-design
description: "Generate complete TO-BE modernization spec-kit (5 files) from AS-IS requirements analysis."
disable-model-invocation: true
---

# Legacy to Modern Design (ai1st-arch-legacy-to-modern-design)

Create TO-BE component specification kit from AS-IS legacy requirements.

**Command**: `/ai1st-arch-legacy-to-modern-design <COMPONENT_ID> from <SRS_FILE_PATH>`

**Example**: `/ai1st-arch-legacy-to-modern-design SRS-UI-001 from {ANALYSIS_ROOT}/arch-as-is-lite/SRS-{module}.md`

<!-- KG Protocol Import -->
@.ai/legacy-analysis-process/kg-protocol.md

---

## Knowledge Graph Integration (OPTIONAL — enhances quality)

**Import**: `@.ai/legacy-analysis-process/kg-protocol.md` — defines the full KG Protocol.

**ai1st-arch-legacy-to-modern-design uses these KG capabilities:**
- **Reuse or bootstrap** (Phase 1): Reuse AS-IS entities from ai1st-arch-legacy-analysis-lite/ai1st-arch-legacy-sys-analysis session, or bootstrap from SRS/RTM
- **KG-First lookup** (all phases): Check KG for existing DTOs, endpoints, terms before creating specs
- **Progressive enrichment** (Phases 2-5): Add `classified:` and `mapped:` observations to AS-IS entities
- **Component specs** (Phases 2-4): Create `SPEC-FE-{name}`, `SPEC-BE-{name}` entities
- **Process tracking**: `STEP-610-{N}` entities track 6-phase progress

**Namespace additions for ai1st-arch-legacy-to-modern-design (TO-BE):**
- ✅ All namespaces including `classified:` and `mapped:`

**KG-First in each phase:**
- Phase 1: `search_nodes("FR-")` to get AS-IS requirements for this component
- Phase 2: `open_nodes(["BR-{id}"])` to get business rules for acceptance criteria
- Phase 3: `search_nodes("DTO-")` and `search_nodes("INT-")` before defining interfaces
- Phase 4: `search_nodes("INT-{endpoint}")` to verify endpoint exists before documenting
- Phase 5: `search_nodes("BR-")` to reference rules for test case generation

**Fallback**: If KG MCP unavailable, all phases work via file-based approach.

---

## Purpose

Transform individual AS-IS requirements into TO-BE implementation specifications. This is a LITE version of the full TO-BE modernization process (ai1st-arch-legacy-sys-analysis), designed for:
- Individual UI components
- Single user stories
- Sprint-level deliverables
- Incremental migration work

**Use Full Process (ai1st-arch-legacy-sys-analysis) For**: Entire module strategy, ADRs, database migration planning.

---

## Prerequisites

Before running, ensure these files exist:

| File | Purpose |
|------|---------|
| `SRS-{module}.md` | AS-IS System Requirements (source of component specs) |
| `MODERNIZATION-STRATEGY.md` | Technology decisions (Angular version, patterns) |
| `PROJECT-SCOPE.md` | Module boundaries and test framework |
| `.ai_project_memory/angular-frontend-constitution.md` | Angular coding standards |

---

## Process Guide

See: `{PROJECT_ROOT}/.ai/legacy-analysis-process/process-steps/to-be-greenfield/how-to-perform-modernization-analysis-lite.md`

---

## Input Format

The command expects a component/requirement ID from the SRS document:

```markdown
### 4.1 Claims List Component (SRS-UI-001)

**Current Implementation**: `ListTaxpayerClaims.jsp` (lines 471-605)
**Angular Target**: `ClaimsListComponent`

| Requirement | Description |
|-------------|-------------|
| SRS-UI-001.1 | Display claims in a responsive table |
| SRS-UI-001.2 | Show columns: Claim Type, Tax Period... |
```

---

## Output: Spec-Kit Folder Structure

Creates folder with 5 specification files:

```
{ANALYSIS_ROOT}/arch-to-be/specs/UC-{NN}-{component-name}/
├── UC-{NN}-{component-name}.md       # Use case specification
├── SPEC-FE-{component-name}.md       # Frontend (Angular) specification
├── SPEC-BE-{api-name}.md             # Backend API specification (if needed)
├── TEST-{component-name}.md          # Test plan (unit + E2E)
└── tasks.md                          # Implementation tasks
```

---

## Execution Flow

```
PHASE 1: Context Loading
├── Read SRS file, locate component by ID
├── Read MODERNIZATION-STRATEGY.md for tech decisions
├── Read PROJECT-SCOPE.md for test framework
├── Read angular-frontend-constitution.md for standards
│
PHASE 2: Use Case Specification (UC-XX.md)
├── Extract user story from AS-IS requirements
├── Transform SRS-XX.x → FR-XX.x functional requirements
├── Define main flow, alternative flows, exception flows
├── Write acceptance criteria (Gherkin format)
├── Reference UI components (Angular Material)
│
PHASE 3: Frontend Specification (SPEC-FE.md)
├── Define Angular component structure (standalone, OnPush)
├── Create TypeScript interfaces from API response
├── Define input/output signals
├── Document conditional logic (from SRS requirements)
├── Create pipes/utilities (formatting, etc.)
│
PHASE 4: Backend Specification (SPEC-BE.md)
├── Document existing REST endpoint (if consuming)
├── Define request/response schemas
├── Note: Backend typically unchanged in migration
│
PHASE 5: Test Plan (TEST.md)
├── Unit tests (Jasmine/Karma) - target 80% coverage
├── E2E tests - reference existing Selenium page objects
├── Visual regression baselines
│
PHASE 6: Tasks (tasks.md)
├── Generate implementation task list
├── Include dependencies between tasks
├── Reference Angular constitution patterns
```

---

## Checklist Template

### Phase 1: Use Case Specification

- [ ] **UC-{NN}-{component}.md created**
- [ ] Header metadata (priority, route, AS-IS source)
- [ ] User story format (As a... I want... So that...)
- [ ] BRD traceability table (SRS-XX → FR-XX)
- [ ] Main flow (numbered steps)
- [ ] Functional requirements transformed from AS-IS
- [ ] Alternative flows (empty state, error state)
- [ ] Acceptance criteria (Gherkin scenarios)
- [ ] UI component references (Angular Material)

### Phase 2: Frontend Specification

- [ ] **SPEC-FE-{component}.md created**
- [ ] Component decorator (standalone, OnPush, selector)
- [ ] TypeScript interfaces for data models
- [ ] Signals for state (input/output)
- [ ] Conditional logic documented
- [ ] Formatting pipes/utilities
- [ ] Template structure outline

### Phase 3: Backend Specification

- [ ] **SPEC-BE-{api}.md created** (or marked N/A)
- [ ] Endpoint definition (method, path, auth)
- [ ] Request schema (JSON)
- [ ] Response schema (JSON)
- [ ] Error responses (400, 401, 404, 500)
- [ ] Note if backend unchanged

### Phase 4: Test Plan

- [ ] **TEST-{component}.md created**
- [ ] Unit test scenarios (describe/it blocks)
- [ ] E2E test references (existing Selenium page objects)
- [ ] Coverage target (80%)
- [ ] Visual regression baselines identified

### Phase 5: Implementation Tasks

- [ ] **tasks.md created**
- [ ] Tasks in dependency order
- [ ] Each task is atomic and estimable
- [ ] References to constitution patterns

---

## Duration

| Phase | Duration |
|-------|----------|
| Phase 1: Use Case | 15-30 min |
| Phase 2: Frontend Spec | 20-40 min |
| Phase 3: Backend Spec | 10-20 min |
| Phase 4: Test Plan | 15-30 min |
| Phase 5: Tasks | 10-15 min |
| **Total** | **~1-2 hours** |

---

## Comparison: Full vs LITE

| Aspect | Full TO-BE (ai1st-arch-legacy-sys-analysis) | LITE TO-BE (ai1st-arch-legacy-to-modern-design) |
|--------|-------------------|-------------------|
| Duration | 10-14 hours | 1-2 hours |
| Scope | Entire system | Single component |
| ADRs | Yes (5-10) | No (use existing) |
| UI Mockups | Full design system | Reference existing |
| Database | Migration planning | N/A |
| Gates | 2 mandatory | 0 (self-review) |
| Output | 12+ Arc42 sections | 5 spec files |

---

## Example Output

For `SRS-UI-001 Claims List Component`:

```
arch-to-be/specs/UC-01-claims-list/
├── UC-01-claims-list.md          # 150-200 lines
├── SPEC-FE-claims-list.md        # 100-150 lines
├── SPEC-BE-claims-api.md         # 50-80 lines
├── TEST-claims-list.md           # 80-120 lines
└── tasks.md                       # 30-50 lines
```

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/ai1st-arch-legacy-sys-analysis` | Full AS-IS analysis (9 steps) |
| `/ai1st-arch-legacy-analysis-lite` | LITE AS-IS analysis (2 steps) |
| `/ai1st-arch-legacy-to-modern-design` | TO-BE spec-kit - 5 files (this command) |
| `/ai1st-arch-legacy-to-modern-design-lite` | TO-BE single spec file |

---

*Version: 1.0 | Created: 2026-02-05*
