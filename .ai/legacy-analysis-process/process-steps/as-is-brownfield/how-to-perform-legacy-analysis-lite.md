# Legacy Analysis Process - LITE

**Purpose**: Simplified 2-step process for JSP→Angular migration.
**Output**: 8 formal documents
**Duration**: 2-3 hours (vs 11-16 hours for full process)
**Version**: 2.14 (2026-02-09)

---

## ⚠️ CRITICAL: FILE NAMING CONVENTION

**ALL output files MUST use `{DOCTYPE}-{module}.md` format.**

| ✅ CORRECT | ❌ FORBIDDEN |
|-----------|-------------|
| `UC-claims.md` | `01-OVERVIEW.md` |
| `BRS-claims.md` | `02-BUSINESS.md` |
| `SRS-claims.md` | `OVERVIEW-claims.md` |
| `TEST-claims.md` | `claims-test.md` |

**Rules:**
- NO numbered prefixes (01-, 02-, etc.)
- NO generic names (OVERVIEW, ARCHITECTURE, etc.)
- ALWAYS `{DOCTYPE}-{module}.md` where DOCTYPE is: UC, BRS, SRS, RTM, LBR, DTO, TEST, DEPENDENCIES, MODERNIZATION-STRATEGY

**Output folders:**
- AS-IS: `arch-as-is-lite/`
- TO-BE: `arch-to-be-lite/`

---

## INPUTS (Required)

| File | Purpose | Must Contain |
|------|---------|--------------|
| `PROJECT-SCOPE.md` | Module boundaries | IN SCOPE paths, OUT OF SCOPE paths, §3.6 shared context |
| `architecture.md` | System architecture (from `.ai_project_memory/`) | Architecture, integration points, security |
| `Glossary.md` | Terminology (module-local or shared per §3.6) | Domain abbreviations with correct meanings |

---

## OUTPUT FILES (Standardized Naming)

| # | File | Purpose |
|---|------|---------|
| 1 | `DEPENDENCIES-{module}.md` | Step 1 extraction (APIs, DTOs, rules, pages) |
| 2 | `BRS-{module}.md` | Business Requirements Specification |
| 3 | `SRS-{module}.md` | System Requirements Specification |
| 4 | `UC-{module}.md` | Use Cases (AS-IS user flows) |
| 5 | `RTM-{module}.md` | Requirements Traceability Matrix |
| 6 | `LBR-{module}.md` | Business Rules Catalog |
| 7 | `DTO-{module}.md` | Data Transfer Object Specification |
| 8 | `TEST-{module}.md` | Test Automation Specification |
| 9 | `MODERNIZATION-STRATEGY-{module}.md` | Migration plan (TO-BE recommendations) |

**Example for Claims module:**
```
DEPENDENCIES-claims.md
BRS-claims.md
SRS-claims.md
UC-claims.md
RTM-claims.md
LBR-claims.md
DTO-claims.md
TEST-claims.md
MODERNIZATION-STRATEGY-claims.md
```

---

## STEP 1: EXTRACT DEPENDENCIES (1 hour)

### 1.1 Read Inputs
```
1. Read PROJECT-SCOPE.md → Get IN SCOPE source paths
2. Read PROJECT-SCOPE.md §4 → Get technology constraints
3. Read Glossary.md → Get terminology for validation
```

### 1.2 Scan Source Code

| Extract | Find In | Pattern |
|---------|---------|---------|
| API Endpoints | `RestClient*Facade.java`, `*Controller.java` | `@RequestMapping`, `@GetMapping`, `@PostMapping` |
| DTOs | `*Request.java`, `*Response.java`, `*DTO.java` | Class fields, types |
| Business Rules | `*Validator.java`, service classes | `if/throw`, validation logic |
| JSP Pages | `*.jsp` files | Page purpose, form fields |
| Tech Stack | `pom.xml`, `package.json`, imports | Framework versions, dependencies |
| **DB Constraints** | Paths from PROJECT-SCOPE.md §3.3 | `CONSTRAINT`, `NOT NULL`, `FOREIGN KEY`, `UNIQUE` |
| **Grouping Rules** | Paths from PROJECT-SCOPE.md §3.3 | `GROUP BY`, `groupingBy`, aggregation logic |
| **UI Display Rules** | Paths from PROJECT-SCOPE.md §3.4 | `display as blank`, `do not show`, `hide`, `visible when` |
| **Existing E2E Tests** | Paths from PROJECT-SCOPE.md §3.5 | `@Test`, test class patterns |
| **Page Objects** | Paths from PROJECT-SCOPE.md §3.5 | `*Page.java`, `*Page.ts` |
| **API Tests** | Paths from PROJECT-SCOPE.md §3.5 | REST Assured, HttpClient mocks |
| **Type-Specific Rules** | All source files | `TaxTypes.*`, `ClaimTypes.*`, `is*Type`, type conditionals |

> **Note**: DB schema and grouping rule locations MUST be specified in PROJECT-SCOPE.md section 3.3.
> Business requirements document locations MUST be specified in PROJECT-SCOPE.md section 3.4.
> If not specified, prompt user to add them before proceeding with analysis.

### 1.2.1 Scan Business Requirements Documents

> **Critical**: UI display rules are often documented in business requirements, not code.
> **WARNING**: Business docs may be outdated. Every rule MUST be validated in code before inclusion.

| Extract | Find In | Pattern |
|---------|---------|---------|
| Conditional Display | `TMS-ACC-*.md`, `*_BRD.md`, `*_SRD.md` | `display as blank`, `not shown`, `hide when`, `visible if` |
| Field Visibility | Requirements tables | `if ... then display`, `do not want ... to be shown` |
| Tax-Type Specific | Column definitions | `if CLAIM_TYPE.CODE in (...)` |

**Validation Required**: For each UI rule found in docs:
1. Search source code for implementing pattern (JSP `<c:if>`, Java conditional, CSS class toggle)
2. **Include in AS-IS only if code reference found** — AS-IS documents current implementation
3. Document code location in `Source` column
4. Rules in docs but NOT in code → document in **separate DISCREPANCIES chapter**

**AS-IS Requirements** (code-validated):
```
| UIR-001 | AT claims (Income, Withholding) hide due date | ListTaxpayerClaims.jsp:501 | TMS-ACC-08:86 |
```

**DISCREPANCIES Chapter** (doc vs code):
```
## Documentation vs Implementation Discrepancies

| ID | Doc Requirement | Doc Source | Code Status | Notes |
|----|-----------------|------------|-------------|-------|
| DISC-001 | CLAIM_EXCISE_AT should hide due date | TMS-ACC-08:86 | No implementation, only in doc | Doc specifies 3 claim types, code only checks 2 |
```

Discrepancies are **findings for stakeholder review** — not missing requirements in AS-IS.

### 1.2.2 Scan Existing Test Automation

> **Required**: Document existing test coverage for migration planning.

| Extract | Find In | Pattern |
|---------|---------|---------|
| E2E Tests | `*Test.java`, `*Test.ts` | `@Test`, test methods |
| Page Objects | `*Page.java`, `*Page.ts` | Selenium/Playwright locators |
| API Tests | `*ApiTest.java`, `*.spec.ts` | REST endpoints tested |
| Test Data | `testData/*.json`, `*.csv` | Fixtures, test datasets |

**Output in TEST-{module}.md** (AS-IS only):
```markdown
## Existing Test Automation

| ID | Test Class | Type | Coverage | Page Objects Used |
|----|------------|------|----------|-------------------|
| EXT-001 | PaymentTests.java | E2E | BR-014, UC-011 | ClaimsAndPaymentsPage |
| EXT-002 | PaymentPortalTest.java | E2E | UC-012 | PaymentsPage |

## Page Objects Inventory
| Page Object | Location | Elements | Used By Tests |
|-------------|----------|----------|---------------|
| ClaimsAndPaymentsPage.java | pages/portal/common | 15 | EXT-001, EXT-003 |

## Test Coverage Gaps (for QA)
| Gap ID | Missing Coverage | Priority | Notes |
|--------|------------------|----------|-------|
| GAP-001 | No E2E for online payment | HIGH | QA to address |
| GAP-002 | View claim modal not tested | MEDIUM | Add test |
```

> **CRITICAL**: AS-IS TEST document contains ONLY current state:
> - ✅ Document existing tests, page objects, coverage
> - ✅ Document test gaps for QA
> - ❌ NO migration recommendations (belongs in ai1st-arch-legacy-to-modern-design-lite TO-BE)
> - ❌ NO TO-BE framework references
>
> Test migration content belongs in ai1st-arch-legacy-to-modern-design-lite TEST-PLAN, not ai1st-arch-legacy-analysis-lite AS-IS.

### 1.2.3 Systematic Type Scanning

> **Required**: Ensure ALL domain types (tax types, claim types) have their specific rules documented.

**Step 1: Identify All Types in System**
```powershell
# Find all type enums/constants
Select-String -Path "**/*.java" -Pattern "enum.*Type|TaxTypes|ClaimTypes" 
```

**Step 2: Scan for Type-Specific Conditionals**

| Pattern | Example | Captures |
|---------|---------|----------|
| `TaxTypes.*` | `TaxTypes.VAT`, `TaxTypes.WITHHOLDING` | Tax type checks |
| `ClaimTypes.*` | `ClaimTypes.CLAIM_INCOME_AT` | Claim type checks |
| `is*Type` | `isVatTaxType`, `isWithholding` | Boolean type flags |
| `taxType.*equals` | `taxType.code.equals("VAT")` | String comparisons |
| `switch.*taxType` | `switch(taxType)` | Type-based branching |

**Step 3: Document Type-Specific Rules**

Create section in LBR/BUSINESS-RULES document:

```markdown
## Type-Specific Business Rules

### VAT
| ID | Rule | Code Reference |
|----|------|----------------|
| BR-025 | VAT uses quarterly periods | ClaimService.java:245 |
| BR-026 | VAT has specific tax type dropdown | ListTaxpayerClaims.jsp:386 |

### Withholding (WHT)
| ID | Rule | Code Reference |
|----|------|----------------|
| BR-027 | WHT requires foreign person | PaymentOnlineDetailValidator.java:42 |
| BR-028 | WHT uses monthly periods | ClaimGroupingLogic.java:88 |

### PIT
| BR-029 | PIT specific claim types | ... |

### PAYE
| BR-030 | ... |

### Excise
| BR-031 | ... |

### Additional Tax (AT)
| BR-032 | AT claims hide due date | ListTaxpayerClaims.jsp:500 |
| BR-033 | AT claims with zero amount hidden | HibernateClaimDao.java |
```

**ID Convention**: Use regular `BR-###` (sequential). Group by type in document structure.

**Validation Check**: Every type in system enum must have at least one BR documented, or explicit note "No type-specific rules found".

### 1.3 Generate DEPENDENCIES-{module}.md

```markdown
# Dependencies Analysis: {Module Name}

## 1. API Endpoints
| ID | Endpoint | Method | Request DTO | Response DTO | Called By |
|----|----------|--------|-------------|--------------|-----------|
| INT-001 | /api/... | POST | RequestDTO | ResponseDTO | page.jsp |

## 2. DTOs
| ID | Java Class | Fields | Used By |
|----|------------|--------|---------|
| DTO-001 | ClaimDTO | id, amount, status | INT-001, INT-002 |

## 3. Business Rules
| ID | Rule | Source | Condition | Error Message |
|----|------|--------|-----------|---------------|
| BR-001 | Amount positive | Validator:42 | amount > 0 | "Amount must be positive" |

## 4. JSP Pages
| JSP | Purpose | APIs Called | Forms/Actions |
|-----|---------|-------------|---------------|
| list.jsp | List claims | INT-001 | Filter, paginate |

## 5. Tech Stack
| Layer | Technology | Version | Source |
|-------|------------|---------|--------|
| Portal | Liferay | 7.4 | pom.xml |
| Backend | Spring | 5.3 | @Controller |
| UI | JSP + jQuery | - | *.jsp imports |

## 6. Database Constraints
| ID | Table | Constraint Type | Columns | Source |
|----|-------|-----------------|---------|--------|
| DB-001 | ACC_CLAIM | PRIMARY KEY | CLAIM_ID | schema.sql |
| DB-002 | ACC_CLAIM | FOREIGN KEY | TAXPAYER_ID → TAXPAYER | schema.sql |
| DB-003 | PAYMENT | NOT NULL | AMOUNT, STATUS | @Column annotations |

## 7. Grouping Rules
| ID | Rule | Grouping Dimensions | Source |
|----|------|---------------------|--------|
| GR-001 | Claim Grouping | taxpayerId + taxType + taxYear + period | ClaimService.java |
| GR-002 | WHT Foreign Person | + foreignPersonId for WHT claims | ClaimGroupingLogic.java |
```

---

## GATE 1: HUMAN REVIEW (BLOCKING)

**Present to human:**
- API count: X endpoints
- DTO count: X data structures
- Rule count: X business rules
- Page count: X JSP files

**Ask**: "Review extraction. APPROVE to continue or REVISE with feedback."

**DO NOT PROCEED** until human approves.

---

## STEP 2: GENERATE OUTPUT DOCUMENTS (1-2 hours)

### 2.1 BRS-{module}.md - Business Requirements Specification

```markdown
# Business Requirements Specification: {Module}

## 1. Purpose
{What business need does this module serve - extracted from code behavior}

## 2. Users
{Who uses this - from PROJECT-SCOPE.md}

## 3. Business Capabilities
| ID | Capability | Description | Priority |
|----|------------|-------------|----------|
| BC-001 | View Claims | Taxpayer views outstanding claims | HIGH |

## 4. Business Rules Summary
{Reference LBR-nnn from LBR-{module}.md}
```

### 2.2 SRS-{module}.md - System Requirements Specification

```markdown
# System Requirements Specification: {Module}

## 1. Functional Requirements
| ID | Requirement | Source | Priority |
|----|-------------|--------|----------|
| FR-001 | System shall display claims list | INT-001 | HIGH |
| FR-002 | System shall validate amount > 0 | LBR-001 | HIGH |

## 2. Data Requirements
{Reference DTO-nnn from DTO-{module}.md}

## 3. Interface Requirements
{Reference INT-nnn from DEPENDENCIES-{module}.md}
```

### 2.3 UC-{module}.md - Use Cases

```markdown
# Use Cases: {Module}

## UC-001: {Use Case Name}

### Actors
- Primary: {Actor}

### Preconditions
- {Condition}

### Happy Path
1. {Step}
2. {Step}

### Business Rules Applied
- BR-001: {Rule applied at step X}

### Source References
- Controller: {File:line}
- JSP: {File:line}
```

### 2.4 RTM-{module}.md - Requirements Traceability Matrix

> **CRITICAL**: RTM must show COMPLETE traceability. Every BR→SR→UC→INT→DTO→Source.
> If links are missing, process is incomplete - return to extraction and complete the work.

```markdown
# Requirements Traceability Matrix: {Module}

| LBR | FR | UC | INT | DTO | Source File:Line |
|-----|-----|-----|-----|-----|------------------|
| BR-001 | SR-002 | UC-003 | INT-002 | DTO-003 | Validator.java:42 |
| BR-002 | SR-005 | UC-003 | INT-002 | DTO-003 | Validator.java:58 |
| - | FR-001 | UC-001 | INT-001 | DTO-001 | Controller.java:89 |

**Status**: [DRAFT] - Pending human verification
```

**RTM contains ONLY the traceability matrix.** No gap analysis, no coverage summary - just complete linkage.

### 2.5 LBR-{module}.md - Business Rules Catalog

> **NAMING CONVENTION**: Use simple sequential numbering. NO domain prefixes (e.g., BR-CL-*, FR-CL-*).
> - **BRS** (Business Requirements): `BR-001`, `BR-002`
> - **SRS** (System Requirements): `SR-001`, `SR-002` 
> - **LBR** (Business Rules): `BR-001`, `BR-002`
> - **UC** (Use Cases): `UC-001`, `UC-002`
> - **TEST** (Test Cases): `TC-001`, `TC-002`

```markdown
# Business Rules Catalog: {Module}

## Summary

| ID | Rule Name | Classification | Ext. (Ph2+) | Verified |
|----|-----------|----------------|-------------|----------|
| BR-001 | Amount Positive | CORE | ❌ Keep | [DRAFT] |
| BR-002 | Max Payment Limit | DYNAMIC | ✅ Rules Eng | [DRAFT] |

### Classification Legend
| Type | Definition |
|------|------------|
| CORE | Domain-inherent, never changes |
| DYNAMIC | Configurable, may change with policy |
| DB-CONSTRAINT | Enforced at database level |
| DERIVED | Calculated from other data |

### Externalization Legend (Phase 2+ Planning)
| Symbol | Meaning | Phase |
|--------|---------|-------|
| ✅ Rules Eng | Candidate for rules engine | Phase 2+ |
| ⚠️ Evaluate | Needs analysis | Phase 2+ |
| ❌ Keep | Stays in code | N/A |

## Detailed Rules

### BR-001: {Rule Name}
| Attribute | Value |
|-----------|-------|
| Rule | {Exact condition} |
| Source | {File:line} |
| Classification | CORE |
| Ext. (Ph2+) | ❌ Keep |
| Verified | [DRAFT] |
| Error Message (EN) | "{message}" |
| Error Message (AR) | "{message}" |
```

### 2.6 DTO-{module}.md - Data Transfer Object Specification

> **NOTE**: This is a SPECIFICATION document, not implementation code. Developers create actual TypeScript interfaces during implementation phase.

```markdown
# Data Transfer Object Specification: {Module}

## DTO-001: ClaimDto

**Java Source**: `com.nortal.tms.dto.ClaimDto`

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| id | Long | No | Claim identifier |
| taxpayerId | String | No | TIN of taxpayer |
| taxType | String | No | Tax type code |
| amount | BigDecimal | No | Claim amount |
| balanceAmount | BigDecimal | No | Outstanding balance |
| status | String | No | Claim status code |

**Used By**: INT-001, INT-002, UC-001

---

## DTO-002: PaymentOnlineDto
...
```

### 2.7 TEST-{module}.md - Test Automation Specification

```markdown
# Test Automation Specification: {Module}

## 1. Test Scope

| Category | Count | Coverage |
|----------|-------|----------|
| Use Cases | X | 100% |
| Business Rules | X | 100% |
| API Endpoints | X | 100% |

## 2. Test Cases

### TC-001: {Test Case Name}
| Attribute | Value |
|-----------|-------|
| UC | UC-001 |
| LBR | LBR-001 |
| Precondition | {Setup} |
| Input | {Test data} |
| Expected | {Expected result} |
| Priority | HIGH |
```

### 2.8 MODERNIZATION-STRATEGY-{module}.md

> **NOTE**: This is the ONLY document where TO-BE recommendations belong.

```markdown
# Modernization Strategy: {Module}

## 1. Migration Approach
Strangler Fig pattern - incremental replacement

## 2. Angular Module Structure
{Module}Module (lazy-loaded)
├── components/
├── services/
└── models/

## 3. Migration Phases
| Phase | Scope | Components | Effort |
|-------|-------|------------|--------|
| 1 | List view | ListComponent | S |
| 2 | Form/validation | FormComponent | M |

## 4. Technical Recommendations
- {Recommendation 1}
- {Recommendation 2}
```

---

## KEY PRINCIPLES

1. **CODE IS SOURCE OF TRUTH** - Only extract what exists in code
2. **NO ASSUMPTIONS** - If not in code, don't document it
3. **NO TO-BE IN AS-IS** - TO-BE recommendations go ONLY in MODERNIZATION-STRATEGY
4. **COMPLETE TRACEABILITY** - RTM must be 100% complete, no gaps
5. **FILE:LINE REFERENCES** - Every rule must cite source
6. **SPECIFICATIONS, NOT IMPLEMENTATION** - No .ts/.java files generated

---

## PROCESS COMPLETION CRITERIA

The process is COMPLETE when:
- [ ] All 9 output files generated with standardized naming
- [ ] RTM shows 100% traceability (all BR→SR→UC→INT→DTO linked)
- [ ] All business rules have file:line references
- [ ] All items marked [DRAFT] pending human verification
- [ ] No TO-BE content in AS-IS documents (only in MODERNIZATION-STRATEGY)

---

## POST-RUN VALIDATION (MANDATORY)

Run these deterministic checks after every ai1st-arch-legacy-analysis-lite execution. All must pass before accepting output.

### Check 1: Output File Existence

```powershell
$required = @("DEPENDENCIES", "BRS", "SRS", "UC", "RTM", "LBR", "DTO", "TEST", "MODERNIZATION-STRATEGY")
$output = "arch-as-is-lite"
$missing = $required | Where-Object { -not (Test-Path "$output/*$_*.md") }
if ($missing) { Write-Error "❌ Missing files: $missing" } else { Write-Host "✅ All 9 files present" }
```

### Check 2: Scope File Coverage

Every .java file in PROJECT-SCOPE.md IN SCOPE must have at least one reference in the output.

```powershell
# List in-scope Java files from PROJECT-SCOPE.md, verify each is referenced
$scopeFiles = @("ListTaxpayerClaimsController.java", "ClaimsValidator.java", "ViewClaimModalHelper.java")
$output = Get-Content "arch-as-is-lite/*.md" -Raw
$scopeFiles | ForEach-Object {
    $refs = ([regex]::Matches($output, [regex]::Escape($_))).Count
    if ($refs -eq 0) { Write-Warning "❌ $_  - NO COVERAGE" } 
    else { Write-Host "✅ $_ - $refs references" }
}
```

### Check 3: Rule-to-Source Tracing

Every BR-### must have a file:line or file#method reference.

```powershell
$lbr = Get-Content "arch-as-is-lite/LBR-*.md" -Raw
$rules = [regex]::Matches($lbr, "BR-\d{3}")
$sourceRefs = [regex]::Matches($lbr, "\.java[:#]\S+")
Write-Host "Rules: $($rules.Count), Source refs: $($sourceRefs.Count)"
if ($sourceRefs.Count -lt $rules.Count) { Write-Warning "⚠️ Some rules may lack source references" }
```

### Check 4: RTM Completeness

RTM must have BR→FR→UC linkage for every row (no empty cells in key columns).

```powershell
$rtm = Get-Content "arch-as-is-lite/RTM-*.md" -Raw
$gaps = [regex]::Matches($rtm, "\| -+ \||\| \|")
if ($gaps.Count -gt 5) { Write-Warning "⚠️ RTM has $($gaps.Count) potential gaps" }
else { Write-Host "✅ RTM linkage appears complete" }
```

### Check 5: Validation Pattern Audit

Compare validation patterns in source code vs extracted rules.

```powershell
# Count validation patterns in source (adjust path to your source)
$sourceDir = "{PROJECT_ROOT}\path\to\module\**\*.java"  # Replace with your IN SCOPE source paths from PROJECT-SCOPE.md
$patterns = Select-String -Path $sourceDir -Pattern "errors\.reject|throw new.*Exception|if.*null.*throw" -ErrorAction SilentlyContinue
$patternCount = $patterns.Count

# Count rules extracted
$rules = Select-String -Path "arch-as-is-lite/LBR-*.md" -Pattern "BR-\d{3}" -AllMatches
$ruleCount = $rules.Matches.Count

Write-Host "Source validation patterns: $patternCount"
Write-Host "Rules extracted: $ruleCount"
if ($patternCount -gt ($ruleCount * 2)) { 
    Write-Warning "⚠️ Significantly more patterns in code than rules - review for missed rules" 
}
```

### Check 6: Database Constraints

Verify DB constraints are documented in DEPENDENCIES.

```powershell
$deps = Get-Content "arch-as-is-lite/DEPENDENCIES-*.md" -Raw
$dbConstraints = [regex]::Matches($deps, "DB-\d{3}|PRIMARY KEY|FOREIGN KEY|NOT NULL|UNIQUE")
Write-Host "DB constraint references: $($dbConstraints.Count)"
if ($dbConstraints.Count -lt 3) { Write-Warning "⚠️ Few DB constraints documented - check schema scan" }
else { Write-Host "✅ DB constraints documented" }
```

### Check 7: Grouping Rules

Verify grouping/aggregation rules are captured.

```powershell
$deps = Get-Content "arch-as-is-lite/DEPENDENCIES-*.md" -Raw
$groupingRules = [regex]::Matches($deps, "GR-\d{3}|GROUP BY|groupingBy|aggregat")
Write-Host "Grouping rule references: $($groupingRules.Count)"
if ($groupingRules.Count -eq 0) { Write-Warning "⚠️ No grouping rules documented - check query patterns" }
else { Write-Host "✅ Grouping rules documented" }
```

### Check 8: UI Display Rules & Discrepancies

Verify UI rules have code references and discrepancies are documented separately.

```powershell
$allContent = Get-Content "arch-as-is-lite/*.md" -Raw
$uirRules = [regex]::Matches($allContent, "UIR-\d{3}")
$discrepancies = [regex]::Matches($allContent, "DISC-\d{3}")
Write-Host "UI Display Rules (code-validated): $($uirRules.Count)"
Write-Host "Discrepancies documented: $($discrepancies.Count)"
if ($discrepancies.Count -gt 0) { Write-Host "ℹ️ $($discrepancies.Count) doc vs code discrepancies for stakeholder review" }
Write-Host "✅ AS-IS reflects current implementation"
```

### Validation Summary

| Check | Pass Criteria |
|-------|---------------|
| File Existence | All 9 files present |
| Scope Coverage | Every in-scope .java has ≥1 reference |
| Rule Tracing | Every BR-### has source reference |
| RTM Completeness | No gap rows in traceability |
| Pattern Audit | Rule count within 2x of source patterns |
| DB Constraints | ≥3 constraint references in DEPENDENCIES |
| Grouping Rules | ≥1 grouping rule documented |
| UI Rules & Discrepancies | UIR-### have code refs; DISC-### documented separately |

**If any check fails**: Review output, identify gaps, re-run with explicit instructions to cover missing areas.

---

*Version: 2.13 | Updated: 2026-02-09*
*Changes: AS-IS TEST is pure current state only - no migration content (belongs in TO-BE)*

---

## CHANGELOG

| Version | Date | Changes |
|---------|------|---------|
| 2.13 | 2026-02-09 | **AS-IS Test Scope**: TEST document contains ONLY current state (existing tests, page objects, gaps). NO migration recommendations — those belong in ai1st-arch-legacy-to-modern-design-lite TO-BE. |
| 2.12 | 2026-02-09 | **Systematic Type Scanning**: Added §1.2.3 to scan ALL domain types (VAT, WHT, PIT, PAYE, Excise, AT). Uses regular BR-### IDs grouped by type. Every type must have documented rules. |
| 2.11 | 2026-02-09 | **Test Automation Scan**: Added §1.2.2 to scan existing E2E tests, page objects, API tests. Added §3.5 to PROJECT-SCOPE. Migration mapping in MODERNIZATION-STRATEGY. |
| 2.10 | 2026-02-09 | **Discrepancies Chapter**: Doc vs code differences go to separate DISCREPANCIES section (DISC-###), not excluded. AS-IS = current implementation only. |
| 2.9 | 2026-02-09 | **Code Validation Required**: UI rules from docs must have code reference. Mark `[DOC-ONLY]` if no code found. Added Check 8. |
| 2.8 | 2026-02-09 | **Business Docs Scan**: Added requirements document scan for UI display rules (§3.4). Captures conditional visibility rules not in code. |
| 2.7 | 2026-02-09 | **DB Schema Scan**: Added database constraints extraction. **Grouping Rules**: Added query/aggregation pattern scan. |
| 2.6 | 2026-02-09 | **ID Naming**: All IDs use simple format (BR-###, SR-###, UC-###, TC-###). No domain prefixes. |
| 2.5 | 2026-02-09 | **Post-Run Validation**: Added 5 mandatory deterministic checks for completeness |
| 2.4 | 2026-02-09 | **BR Naming Convention**: Simple sequential format `BR-###` (not LBR-###) |
| 2.3 | 2026-02-08 | Standardized naming, removed RTM Gap Analysis, DTO as specification only |
