# TO-BE Modernization Analysis - LITE

Transform AS-IS requirements into TO-BE implementation specifications at component level.

**Commands**:
- `/ai1st-arch-legacy-to-modern-design` - Generate complete spec-kit (5 files)
- `/ai1st-arch-legacy-to-modern-design-lite` - Generate single spec file

---

## When to Use

| Use LITE | Use Full |
|----------|----------|
| Individual UI components (SRS-UI-XXX) | Entire module modernization |
| Single user stories | Technology stack decisions |
| Sprint-level deliverables | Database migration planning |
| Incremental migration work | Architecture Decision Records |

**Use Full Process For**: See `how-to-perform-modernization-analysis.md`

---

## Prerequisites

Before running LITE commands, ensure these files exist:

| File | Purpose |
|------|---------|
| `SRS-{module}.md` | AS-IS System Requirements (source of component specs) |
| `MODERNIZATION-STRATEGY.md` | Technology decisions (Angular version, patterns) |
| `PROJECT-SCOPE.md` | Module boundaries and test framework |
| `.ai_project_memory/angular-frontend-constitution.md` | Angular coding standards |

---

## Output Structure

Both commands produce files in the same folder structure:

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

### ai1st-arch-legacy-to-modern-design: Complete Spec-Kit (5 files)

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

### ai1st-arch-legacy-to-modern-design-lite: Single Spec File

Generate one file at a time using the same phases above:

| Spec Type | Phase | Output |
|-----------|-------|--------|
| `use-case` | Phase 2 | UC-{NN}-{component}.md |
| `frontend` | Phase 3 | SPEC-FE-{component}.md |
| `backend` | Phase 4 | SPEC-BE-{api}.md |
| `test-plan` | Phase 5 | TEST-{component}.md |
| `tasks` | Phase 6 | tasks.md |

---

## Checklist by Phase

### Phase 1: Context Loading

- [ ] SRS file located and component ID found
- [ ] MODERNIZATION-STRATEGY.md read
- [ ] PROJECT-SCOPE.md read
- [ ] angular-frontend-constitution.md read

### Phase 2: Use Case Specification

- [ ] **UC-{NN}-{component}.md created**
- [ ] Header metadata (priority, route, AS-IS source)
- [ ] User story format (As a... I want... So that...)
- [ ] BRD traceability table (SRS-XX → FR-XX)
- [ ] Main flow (numbered steps)
- [ ] Functional requirements transformed from AS-IS
- [ ] Alternative flows (empty state, error state)
- [ ] Acceptance criteria (Gherkin scenarios)
- [ ] UI component references (Angular Material)

### Phase 3: Frontend Specification

- [ ] **SPEC-FE-{component}.md created**
- [ ] Component decorator (standalone, OnPush, selector)
- [ ] TypeScript interfaces for data models
- [ ] Signals for state (input/output)
- [ ] Conditional logic documented
- [ ] Formatting pipes/utilities
- [ ] Template structure outline

### Phase 4: Backend Specification

- [ ] **SPEC-BE-{api}.md created** (or marked N/A)
- [ ] Endpoint definition (method, path, auth)
- [ ] Request schema (JSON)
- [ ] Response schema (JSON)
- [ ] Error responses (400, 401, 404, 500)
- [ ] Note if backend unchanged

### Phase 5: Test Plan

- [ ] **TEST-{component}.md created**
- [ ] Unit test scenarios (describe/it blocks)
- [ ] E2E test references (existing Selenium page objects)
- [ ] Coverage target (80%)
- [ ] Visual regression baselines identified

### Phase 6: Implementation Tasks

- [ ] **tasks.md created**
- [ ] Tasks in dependency order
- [ ] Each task is atomic and estimable
- [ ] References to constitution patterns

---

## Template Structures

### Use Case (UC-{NN}.md)

```markdown
# UC-{NN}: {Component Name}

**Priority**: High | Medium | Low
**Route/Location**: {URL path or screen location}
**AS-IS Source**: {file.jsp:lines}

## BRD Traceability
| SRS Requirement | UC Requirement | Description |
|-----------------|----------------|-------------|
| SRS-UI-001.1 | FR-001.1 | Display claims in table |

## User Story
As a {role}
I want to {action}
So that {benefit}

## Main Flow
1. User navigates to {route}
2. System fetches data from API
3. System displays {component}
4. User interacts with {element}

## Functional Requirements
- **FR-001.1**: {requirement from SRS}
- **FR-001.2**: {requirement from SRS}

## Alternative Flows
### Empty State
- When no data: Show "No results found" message

### Error State
- When API fails: Show error message with retry option

## Acceptance Criteria
```gherkin
Scenario: {scenario name}
  Given {context}
  When {action}
  Then {expected result}
```

## UI Components
- Angular Material: mat-table, mat-paginator
- Design patterns: {from constitution}
```

### Frontend Specification (SPEC-FE.md)

```markdown
# Frontend Specification: {Component Name}

## Component Definition
```typescript
@Component({
  selector: 'app-{component-name}',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class {ComponentName}Component {
  // Signals
  data = signal<{Type}[]>([]);
  loading = signal(false);

  // Computed
  isEmpty = computed(() => this.data().length === 0);
}
```

## TypeScript Interfaces
```typescript
interface {EntityName} {
  id: string;
  // ... fields from API response
}
```

## Input/Output Signals
| Signal | Type | Direction | Description |
|--------|------|-----------|-------------|
| data | {Type}[] | input | Data to display |
| selected | EventEmitter<{Type}> | output | Selection event |

## Conditional Logic
| Condition | Behavior | Source |
|-----------|----------|--------|
| claimType === 'AT' | Hide due date | SRS-UI-001.4 |

## Pipes/Utilities
- `TaxAmountPipe`: Format numbers with 3 decimals + OMR suffix
```

### Backend Specification (SPEC-BE.md)

```markdown
# Backend Specification: {API Name}

## Endpoint
```
GET /api/v1/{resource}
Authorization: Bearer {jwt}
```

## Request
```json
{
  "filters": { },
  "pagination": { "page": 1, "pageSize": 20 }
}
```

## Response
```json
{
  "data": [ { /* entity */ } ],
  "pagination": { "page": 1, "pageSize": 20, "total": 100 }
}
```

## Error Responses
| Code | Condition | Response |
|------|-----------|----------|
| 400 | Invalid input | { "error": "Validation failed" } |
| 401 | Unauthorized | { "error": "Token invalid" } |

## Note
Backend unchanged - Angular consumes existing REST endpoints.
```

### Test Plan (TEST.md)

```markdown
# Test Plan: {Component Name}

## Unit Tests (Jasmine/Karma)

### {ComponentName}Component
```typescript
describe('{ComponentName}Component', () => {
  it('should display data in table', () => { });
  it('should show empty state when no data', () => { });
  it('should format amounts with 3 decimals', () => { });
  it('should hide due date for AT claims', () => { });
});
```

### {PipeName}Pipe
```typescript
describe('{PipeName}Pipe', () => {
  it('should format 1234.567 as "1,234.567 OMR"', () => { });
});
```

## E2E Tests (Selenium/TestNG)

**Existing Page Objects**:
- `ClaimsAndPaymentsPage.validateClaimsTab()`

**New Test Methods Needed**:
- `verifyClaimsTableColumns()`
- `verifyAmountFormatting()`
- `verifyAtClaimsDueDateHidden()`

## Coverage Targets
| Layer | Target |
|-------|--------|
| Component | 80% |
| Service | 80% |
| Pipes | 90% |
```

### Implementation Tasks (tasks.md)

```markdown
# Implementation Tasks: {Component Name}

## Dependencies
- [ ] Angular project scaffolded
- [ ] Angular Material installed
- [ ] Claims API available

## Tasks

### 1. Create Component
- [ ] Create `claims-list.component.ts` (standalone, OnPush)
- [ ] Create `claims-list.component.html` (mat-table)
- [ ] Create `claims-list.component.scss` (responsive)

### 2. Create Models
- [ ] Create `claim.model.ts` interface
- [ ] Add to `models/index.ts` barrel export

### 3. Create Utilities
- [ ] Create `tax-amount.pipe.ts`
- [ ] Add unit tests for pipe

### 4. Write Tests
- [ ] Unit tests for component (target: 80%)
- [ ] Unit tests for pipe (target: 90%)

### 5. Integration
- [ ] Add to routing module
- [ ] Update Selenium page object
- [ ] Run E2E regression
```

---

## Comparison: Full vs LITE

| Aspect | Full TO-BE | LITE TO-BE |
|--------|------------|------------|
| Duration | 10-14 hours | 1-2 hours |
| Scope | Entire system | Single component |
| ADRs | Yes (5-10) | No (use existing) |
| UI Mockups | Full design system | Reference existing |
| Database | Migration planning | N/A |
| Gates | 2 mandatory | 0 (self-review) |
| Output | 12+ Arc42 sections | 5 spec files |

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/ai1st-arch-legacy-sys-analysis` | Full AS-IS analysis (9 steps) |
| `/ai1st-arch-legacy-analysis-lite` | LITE AS-IS analysis (2 steps) |
| `/ai1st-arch-legacy-to-modern-design` | TO-BE spec-kit - 5 files |
| `/ai1st-arch-legacy-to-modern-design-lite` | TO-BE single spec file |

---

*Version: 1.0 | Created: 2026-02-05*
