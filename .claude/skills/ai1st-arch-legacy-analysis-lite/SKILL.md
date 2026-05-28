---
name: ai1st-arch-legacy-analysis-lite
description: "Lightweight AS-IS legacy system analysis producing Arc42 documentation and requirements traceability matrix."
disable-model-invocation: true
---

# Legacy Analysis - LITE (ai1st-arch-legacy-analysis-lite)

Execute AS-IS legacy analysis to document current system and extract business requirements.

**Role**: PO / Business Analyst
**Command**: `/ai1st-arch-legacy-analysis-lite perform analysis of <MODULE> according to <PROJECT-SCOPE.md PATH> and output to <MODULE DOCS PATH>`

<!-- KG Protocol Import -->
@.ai/legacy-analysis-process/kg-protocol.md

---

## Knowledge Graph Integration (OPTIONAL — enhances quality)

**Import**: `@.ai/legacy-analysis-process/kg-protocol.md` — defines the full KG Protocol.

**ai1st-arch-legacy-analysis-lite uses these KG capabilities:**
- **Bootstrap** (Step 0): Load Glossary and PROJECT-SCOPE terms into KG as ground truth
- **KG-First lookup** (Step 1): Check KG before creating any entity, term, or relation
- **Progressive enrichment** (Steps 1-2): Add `discovered:` and `verified:` observations to entities
- **Process tracking**: `STEP-601-{N}` and `GATE-601-{N}` entities track 2-step, 2-gate progress
- **Session continuity**: KG persists across `/clear` at Gate 1, enabling seamless resume

**Namespace restrictions for ai1st-arch-legacy-analysis-lite (AS-IS):**
- ✅ `context:`, `discovered:`, `verified:`, `gate:`, `process:`
- ❌ `classified:`, `mapped:` (these are TO-BE only — added by ai1st-arch-legacy-to-modern-design-lite)

**KG-First in each step:**
- Step 0 Bootstrap: Load TERM-*, SCOPE-*, STATUS-* from authoritative docs
- Gate 0.5: `open_nodes(["TERM-{abbrev}"])` to verify terms against code evidence
- Step 1: `search_nodes("{keywords}")` before creating BR-*, FR-*, INT-*, DTO-* entities
- Step 2: `read_graph()` to pull entity inventory for document generation

**Fallback**: If KG MCP unavailable, all steps work via file-based approach.

---

## Workflow Position

```
ai1st-arch-legacy-analysis-lite (AS-IS) → ai1st-arch-legacy-to-modern-design-lite (TO-BE) → ai1st-po-capture-ui → ai1st-po-specify → plan
   PO/BA          PO/BA          PO/BA or Dev       Dev         Dev
     ↓
  Outputs:
  - UC document (09.04 template) - AS-IS use case with flows and business rules
  - Technical AS-IS documentation (BRS, SRS, LBR, RTM)
  - test.md - AS-IS test automation documentation
  - RTM (source of truth for TO-BE)

  Document creation order:
  1. UC-{module}.md (use case first - establishes actors, flows, rules)
  2. BRS, SRS, LBR, RTM (detailed specs referencing UC)
  3. test.md, DTO-specification, MODERNIZATION-STRATEGY
```

---

## File Naming Convention (MANDATORY)

**CRITICAL**: All output files MUST use the named format `{DOCTYPE}-{module}.md`.

| ✅ CORRECT | ❌ WRONG |
|-----------|----------|
| `UC-claims.md` | `01-OVERVIEW.md` |
| `BRS-claims.md` | `02-BUSINESS.md` |
| `SRS-claims.md` | `03-SYSTEM.md` |
| `RTM-claims.md` | `claims-requirements.md` |
| `LBR-claims.md` | `business-rules.md` |
| `TEST-claims.md` | `09-TEST.md` |

**NO numbered prefixes. NO generic names. ALWAYS `{DOCTYPE}-{module}.md` format.**

Output folder: `arch-as-is-lite/` (for ai1st-arch-legacy-analysis-lite AS-IS analysis)

---

## Sub-Agent Spawning Instructions

When running ai1st-arch-legacy-analysis-lite via sub-agent (e.g., `sessions_spawn`), the spawning agent MUST include these instructions in the task:

```
⚠️ CRITICAL FILE NAMING REQUIREMENTS:
1. Output folder: arch-as-is-lite/
2. File format: {DOCTYPE}-{module}.md
3. Examples: UC-claims.md, BRS-claims.md, TEST-claims.md
4. FORBIDDEN: numbered prefixes (01-*, 02-*), generic names (OVERVIEW, ARCHITECTURE)

Read the full process: .ai/legacy-analysis-process/process-steps/as-is-brownfield/how-to-perform-legacy-analysis-lite.md
```

**Why**: Sub-agents lose context and may invent their own naming conventions. Explicit instructions prevent drift.

**Validation**: After sub-agent completes, verify output files match `{DOCTYPE}-{module}.md` pattern. Reject and re-run if numbered files are generated.

---

## Project Variables

**CRITICAL**: Two distinct locations are used:

| Variable | Definition | Usage |
|----------|-----------|-------|
| **`{PROJECT_ROOT}`** | Project repository root (where Claude is launched) | READ source code from here |
| **`{ANALYSIS_ROOT}`** | Analysis output location | WRITE all outputs here |

**Variable Definition**: Check `{PROJECT_ROOT}/.claude/CLAUDE.md` for `{ANALYSIS_ROOT}` definition.

---

## When to Use

Use this LITE process when:
- Modernizing legacy system (JSP → Angular, monolith → microservices)
- PO/BA needs to document AS-IS state before TO-BE specification
- Team needs: Business rules, requirements traceability, API documentation
- RTM will be used as source of truth for ai1st-arch-legacy-to-modern-design-lite TO-BE specification

Use the FULL process (`/ai1st-arch-legacy-sys-analysis`) when:
- Comprehensive Arc42 documentation required
- Multiple stakeholder audiences
- Regulatory/compliance documentation needed

## Key Outputs

| Output | Audience | Purpose |
|--------|----------|---------|
| **UC** | PO/BA, Dev | **CREATE FIRST** - AS-IS use case (09.04 template): actors, flows, business rules, exceptions |
| **RTM** | PO/BA, Dev | Source of truth - links requirements to code |
| **LBR** | PO/BA | Business rules catalog (DROOLS candidates marked) |
| **BRS** | PO/BA | Business requirements for stakeholder review |
| **SRS** | Dev | Technical system requirements |
| **MODERNIZATION-STRATEGY** | All | Migration approach and phases |
| **DTO-specification** | Dev | API contracts for Angular |
| **test** | QA, Dev | AS-IS test automation documentation (UC format) |

## AS-IS vs TO-BE Content Rules (CRITICAL)

### Documents that MUST be pure AS-IS

| Document | Content | ❌ NOT Allowed |
|----------|---------|----------------|
| **UC** | Current actors, flows, triggers, exceptions from legacy code | Angular components, future flows, TO-BE |
| **SRS** | Current JSP system, current APIs, current behavior | Angular, "Target", migration, TO-BE |
| **BRS** | Current business requirements | Future requirements, migration |
| **LBR** | Current business rules | Future rules, migration |
| **RTM** | Current code references | Future code references |
| **test** | Current test automation (Selenium/TestNG) | Future test frameworks |

**SRS Example - WRONG:**
```markdown
| Layer | Current | Target |          ← NO "Target" column
| Frontend | JSP | Angular 21 LTS |   ← NO Angular reference
```

**SRS Example - CORRECT:**
```markdown
| Layer | Technology |
| Frontend | JSP + jQuery + AlloyUI |
| Backend | Spring 5.3 + Liferay |
```

### Document for TO-BE content

| Document | Content |
|----------|---------|
| **MODERNIZATION-STRATEGY.md** | Migration recommendations, target architecture, Angular mapping, phased approach |

All TO-BE recommendations, target technologies, and migration strategies belong **ONLY** in MODERNIZATION-STRATEGY.md.

---

## Step 0: Determine Output Location (MANDATORY)

**FIRST ACTION**: Before starting analysis, determine `{ANALYSIS_ROOT}`.

1. **Check CLAUDE.md**: If `{PROJECT_ROOT}/.claude/CLAUDE.md` defines `{ANALYSIS_ROOT}`, use that value
2. **If not defined**: Ask user using AskUserQuestion tool:

```
Where should the LITE analysis output be stored?

Options:
1. Default: `{PROJECT_ROOT}/lite-analysis/`
2. Custom location (specify path)
3. Already defined in CLAUDE.md
```

---

## Step 0.5: Create Folder Structure (AUTOMATED)

After determining `{ANALYSIS_ROOT}`, run the setup script to create required folders:

**Windows (PowerShell)**:
```powershell
.ai/scripts/legacy-analysis-setup.ps1 -AnalysisRoot "{ANALYSIS_ROOT}" -ProcessType "lite"
```

**Linux/macOS (Bash)**:
```bash
.ai/scripts/bash/legacy-analysis-setup.sh -r "{ANALYSIS_ROOT}" -t lite
```

This creates:
```
{ANALYSIS_ROOT}/
├── work/
│   └── 01-reconnaissance/
├── docs/business-context/
└── arch-as-is-lite/
    └── dto/
```

---

## Step 0.55: Resolve & Report Business Context (AUTOMATED)

After folder creation, resolve where business context files are located.

### 1. Resolve shared path
Check PROJECT-SCOPE.md Section 3.6 for a shared business context path.
- If §3.6 exists: resolve paths relative to `{ANALYSIS_ROOT}` (e.g., `../shared/docs/business-context/`)
- If §3.6 missing: all files from `{ANALYSIS_ROOT}/docs/business-context/` only (default behavior)

### 2. Scan both locations
Scan module-local `docs/business-context/` AND shared path (if configured).
Module-local files take precedence over shared files with the same name.

### 3. Print Context Inventory (MANDATORY)

Print a table showing **every** discovered file, its source location, and how it will be used:

```markdown
## Business Context Inventory

| # | File | Source | Usage |
|---|------|--------|-------|
| 1 | Glossary.md | ../shared/docs/business-context/ | KG Bootstrap → TERM entities; Sub-agent mandatory context |
| 2 | BRD - Digital Assistant.pdf | ../shared/docs/business-context/ | Note title only (PDF) |
| 3 | TMS-ACC-06_Claims_List.md | docs/business-context/ (module-local) | READ before Step 1 → extract business requirements |
| 4 | VAT-CRM-REG-02.1.1.md | docs/business-context/ (module-local) | READ before Step 1 → extract functional specs |
```

**Usage categories:**

| Usage | Description |
|-------|-------------|
| **KG Bootstrap** | Loaded into Knowledge Graph as TERM/STATUS entities (Step 0.1) |
| **Sub-agent context** | Passed to every sub-agent as mandatory reading |
| **READ before Step 1** | Read into context for requirements extraction in Steps 1-2 |
| **Reference during analysis** | Consulted as needed during component analysis |
| **Note title only** | PDF — cannot be read directly, title recorded for reference |

### 4. Confirm and proceed

Log: `"Business context: {N} files from module-local, {M} files from shared, {P} PDFs (title only)"`

---

## Prerequisites

Before running, ensure these files exist (search `{PROJECT_ROOT}/` or ask user):

| File | Purpose |
|------|---------|
| `PROJECT-SCOPE.md` | Module boundaries (IN SCOPE / OUT OF SCOPE paths) |
| `Glossary.md` | Domain terminology (module-local or shared per PROJECT-SCOPE.md §3.6) |

---

## Step 0.1: KG Bootstrap (OPTIONAL — if KG MCP available)

**After Step 0.5** (folder creation), bootstrap Knowledge Graph with business context:

```
KG Bootstrap Sequence:
1. read_graph() — if entities exist from prior session, log and skip
   → "KG has {N} entities from prior session. Skipping bootstrap."

2. READ Glossary.md (resolved path from Step 0.55) → create_entities TERM-{abbrev}
   Each: "context: meaning = {definition}", "context: source = Glossary.md",
         "context: source-path = {resolved path}"

3. READ PROJECT-SCOPE.md
   → create_entities MOD-{name} for in-scope module
   → create_entities SCOPE-{item} for IN/OUT scope boundaries
   Each: "context: status = IN_SCOPE / OUT_OF_SCOPE", "context: paths = ..."

6. create_entities SESSION-{module}
   With: "context: project-root = {path}", "context: analysis-root = {path}",
         "context: command = ai1st-arch-legacy-analysis-lite", "context: started = {ISO timestamp}"

7. read_graph() → verify bootstrap
   → Log: "KG bootstrap: {N} terms, {N} scopes, {N} statuses loaded"
```

**If KG MCP unavailable**: Log `"KG unavailable — falling back to file-based approach"` and proceed normally.

---

## Business Context Discovery (MANDATORY)

### Step 0.6: Scan Available Context

**Before Step 1**, scan and catalog all available business context using the resolved paths from Step 0.55.

```powershell
# Scan module-local docs
Get-ChildItem "{ANALYSIS_ROOT}/docs" -Recurse -File | Select Name, @{N='Size';E={"$([math]::Round($_.Length/1024,1))KB"}}, Directory

# Scan shared docs (if configured in PROJECT-SCOPE.md §3.6)
$sharedPath = "{resolved shared path from Step 0.55}"
if (Test-Path $sharedPath) {
    Get-ChildItem $sharedPath -Recurse -File | Select Name, @{N='Size';E={"$([math]::Round($_.Length/1024,1))KB"}}, Directory
}
```

### Business Context Categories

| Folder | Source | Priority | Action |
|--------|--------|----------|--------|
| `docs/business-context/` | Module-local OR shared (§3.6) | **HIGH** | READ all .md files before Step 1 |
| `docs/as-is-ui-info/` | Module-local | **MEDIUM** | Reference for UI rules extraction |
| `docs/data-model/` | Module-local | **MEDIUM** | Reference for DTO generation |
| `docs/test-framework/` | Module-local | **LOW** | Reference for test specs |

### Required Actions (Step 0.6)

1. **CATALOG**: List all files from both module-local and shared locations (Step 0.55 output)
2. **READ**: All .md files in `docs/business-context/` (from resolved paths) - extract requirements/rules
3. **NOTE**: Available PDFs (may not be directly readable - note their titles)
4. **READ**: `docs/as-is-ui-info/*.md` for UI-specific context
5. **READ**: `docs/data-model/*.md` for entity/table definitions
6. **REPORT**: Print the Context Inventory table from Step 0.55 showing file → source → usage

### Context Inventory (from Step 0.55)

The inventory table printed in Step 0.55 serves as the authoritative list. Verify before proceeding:

```markdown
## Available Business Context

### HIGH Priority — Read Before Analysis
- [ ] Glossary.md — Domain terms (source: {module-local or shared})
- [ ] BRD-*.md — Business requirements (source: {location})
- [ ] TMS-*.md — Functional specs (source: {location})

### MEDIUM Priority — Reference During Analysis
- [ ] docs/as-is-ui-info/UI-ANALYSIS.md — Current UI patterns
- [ ] docs/as-is-ui-info/*.png — Screenshots (X files)
- [ ] docs/data-model/*.md — Data tables

### LOW Priority — Reference for Deliverables
- [ ] docs/test-framework/*.md — Test patterns

### Not Readable — PDF Title Only
- [ ] *.pdf files (list titles for reference)
```

### Missing Context Warning

If `docs/business-context/` folder is empty or missing key files:
1. **WARN** user about limited context
2. **ASK** if they can provide business requirements documents
3. **PROCEED** with code-only analysis if user confirms
4. **DOCUMENT** in output that analysis was code-based only

---

## Execution Flow

```
Step 0: Determine {ANALYSIS_ROOT}
    ↓
Step 0.5: Create folder structure
    ↓
Step 0.55: Resolve & Report Business Context (shared + module-local)
    ↓
Read: PROJECT-SCOPE.md, Glossary.md (resolved)
    ↓
GATE 0.5: Terminology Validation (BLOCKING)
    ↓
STEP 1: Extract Dependencies (2-3 hours)
- Scan JSP source code paths from PROJECT-SCOPE.md
- Extract: API endpoints, DTOs, business rules, JSP pages
- Per-file function extraction (Section 1.3)
- Dependency mapping (Section 1.4)
- **Rule Extraction Checklist** (Section 1.5) - MANDATORY
- Output: {ANALYSIS_ROOT}/arch-as-is-lite/work/01-reconnaissance/DEPENDENCIES.md
    ↓
VALIDATION: Launch QC-01 to QC-05 (Parallel)
- QC-01: Completeness validation
- QC-02: Accuracy validation (10% sample)
- QC-03: Terminology validation
- QC-04: Traceability validation
    ↓
GATE 1: Human Review (BLOCKING)
- Present QC validation summary + counts
- Present QC-07 endpoint reconciliation results (DEPENDENCIES vs UC coverage)
- Wait for APPROVE / REVISE / STOP
    ↓
STEP 2: Map to Angular + Generate Documents (1-2 hours)
- Map dependencies to Angular components/services
- Generate 6 output documents to {ANALYSIS_ROOT}/
```

---

## Gate 0.5: Terminology Validation (BLOCKING)

**Trigger**: After reading PROJECT-SCOPE.md and Glossary.md - BEFORE Step 1

### Validation Requirements
1. All abbreviations verified against code (search for class/enum names)
2. Glossary populated with stakeholder-confirmed definitions
3. Status codes verified against actual enum definitions in source

### Present to Stakeholder
```markdown
| Term | AI Interpretation | Code Evidence | Status |
|------|-------------------|---------------|--------|
| AT | Additional Tax | AdditionalTax.java exists | ✅ VERIFIED |
| CIT | Corporate Income Tax | NOT FOUND in code | ❌ NEEDS CORRECTION |
```

### Gate 0.5 KG Integration (if KG available)

For each term verified at Gate 0.5:
```
open_nodes(["TERM-{abbrev}"])           ← Already loaded from bootstrap
# grep source code for evidence
add_observations([{
  entityName: "TERM-{abbrev}",
  contents: [
    "verified: code-evidence = {class/enum name}",
    "verified: enum-values = {list}",
    "gate: stakeholder-confirmed = {ISO date}"
  ]
}])
```

### Gate 0.5 Exit Criteria
- [ ] All terms in Glossary.md verified against source code
- [ ] Any mismatches corrected in Glossary.md
- [ ] Stakeholder confirms terminology before proceeding
- [ ] (KG) TERM entities enriched with `verified:` observations

**If unverified terms remain**: STOP and resolve with stakeholder before Step 1.

---

## Sub-Agent Context Propagation (MANDATORY)

When spawning sub-agents for analysis steps, MUST include:

### Required Context Files
Every sub-agent MUST be instructed to read:
1. `Glossary.md` (resolved path from Step 0.55 — module-local or shared) - Term definitions
3. Previous test reports (if exist) - Known issues to avoid

### Required Instructions Template
```
BEFORE generating any content:
1. Read Glossary.md (resolved path) - use ONLY defined terms
3. Verify status codes against actual Java enums (grep source)
4. Use method signatures not just line numbers (lines drift)
```

### Context Loss Prevention
Sub-agents lose context. Pass explicit constraints, not implicit assumptions.

---

## Code Reference Accuracy (MANDATORY)

Code does not change during analysis round. Line numbers are valid.

### Reference Format

```
File#method():line → `pattern` ✓YYYY-MM-DD
```

| Component | Required | Purpose |
|-----------|----------|---------|
| File | ✅ | Source file (wildcards OK: `*Validator.java`) |
| #method() | ✅ | Stable anchor for re-finding |
| :line | ✅ | Current line number |
| → `pattern` | ✅ | Greppable identifier |
| ✓date | ✅ | Verification date |

### Examples

**Single reference:**
```markdown
**Source**: `ClaimsValidator#validate():15` → `rejectValue("taxYear"` ✓2026-02-06
```

**Table format:**
```markdown
| Rule | Source | Verified |
|------|--------|----------|
| Tax year ≥0 | `*Validator#validate():15` → `rejectValue` | ✓2026-02-06 |
```

### Verification Process

Before documenting any reference:
```powershell
# 1. Find pattern in files
Select-String -Recurse -Pattern "{pattern}" -Include "{file}"

# 2. Confirm line number
Select-String -Path "{file}" -Pattern "{pattern}" | Select LineNumber
```

### DO NOT include code snippets

Keep documentation concise. Pattern is greppable for verification.

---

## KG-First Extraction Protocol (Step 1 — if KG available)

During Step 1 extraction, apply the KG-First rule for every discovery:

### For each business rule discovered in code:

```
1. KG-FIRST CHECK:
   search_nodes("{pattern or rule keywords}")
   → If similar entity exists: add_observations to existing entity
   → If not found: create_entities BR-{id} with discovered: observations

2. TERM CHECK:
   For each domain term (AT, WHT, VAT, etc.):
   open_nodes(["TERM-{term}"])
   → Use KG-verified meaning, NOT whatever the AI thinks it means

3. SCOPE CHECK:
   For each file being analyzed:
   search_nodes("SCOPE-{component}")
   → If OUT_OF_SCOPE: skip, log "Skipped: out of scope per KG"

4. STATUS CHECK:
   When encountering status values/enums:
   search_nodes("STATUS-{value}")
   → If exists: use documented meaning
   → If not: create STATUS entity with "discovered:" observation
```

### Entity creation during Step 1:

```
create_entities([{
  name: "BR-001",
  entityType: "BusinessRule",
  observations: [
    "discovered: rule = Hide due date column for AT claim types",
    "discovered: source = ListTaxpayerClaims.jsp#L500",
    "discovered: pattern = balanceAmount"
  ]
}])

# After grep verification:
add_observations([{
  entityName: "BR-001",
  contents: ["verified: grep-confirmed = {ISO date}"]
}])
```

### Process step tracking:

```
# Step starts:
create_entities([{
  name: "STEP-601-1", entityType: "ProcessStep",
  observations: ["process: status = in_progress", "process: started = {ISO}"]
}])

# Step completes:
add_observations([{
  entityName: "STEP-601-1",
  contents: [
    "process: status = complete",
    "process: completed = {ISO}",
    "process: entities-created = BR:{N}, FR:{N}, INT:{N}"
  ]
}])
```

---

## KG-Assisted Document Generation (Step 2 — if KG available)

When generating documents in Step 2, use KG as primary source:

```
1. read_graph() → get complete entity inventory
2. For each document section:
   - Pull entity observations by namespace (discovered:, verified:)
   - Use KG relation graph for RTM traceability columns
   - Check every BR-ID, FR-ID exists in KG before writing
3. After writing each document:
   add_observations([{
     entityName: "BR-001",
     contents: ["verified: documented-in = LBR-claims.md"]
   }])
```

---

## Rule Extraction Checklist (MANDATORY)

**Section 1.5**: Systematic scan to ensure no business rules are missed.

### Scan Patterns (Technology-Agnostic)

Run ALL pattern categories on IN SCOPE paths from PROJECT-SCOPE.md:

```powershell
# CATEGORY 1: BACKEND VALIDATION (any language)
# 1.1 Validator classes
Get-ChildItem -Recurse -Filter "*Validator*.*" | Select FullName

# 1.2 Validation/reject methods
Select-String -Recurse -Pattern "validate\(|reject\(|rejectValue\(|addError\(|throw.*ValidationException"

# 1.3 Business rule constants
Select-String -Recurse -Pattern "ERROR_|INVALID_|MAX_|MIN_|LIMIT_|THRESHOLD_|ALLOWED_"

# CATEGORY 2: UI-LAYER VALIDATION (any frontend)
# 2.1 Eligibility/permission checks
Select-String -Recurse -Pattern "can[A-Z]\w+|is[A-Z]\w+able|isEligible|isAllowed|isValid|isEnabled"

# 2.2 Balance/amount boundary checks
Select-String -Recurse -Pattern "balance.*[><=]|amount.*[><=]|\.compareTo\(|> 0|< 0|== 0|!= 0"

# 2.3 Type exclusion/inclusion patterns
Select-String -Recurse -Pattern "exclude|forbidden|notAllowed|permitted|\.equals.*\.getCode|\.contains\("

# CATEGORY 3: CONDITIONAL LOGIC (any technology)
# 3.1 Conditional display/enable (JSP, Angular, React, Vue)
Select-String -Recurse -Pattern "<c:if|<c:when|\*ngIf|v-if|{.*&&.*}|isVisible|isDisabled"

# 3.2 Status-based branching
Select-String -Recurse -Pattern "isInStatus|\.status\s*==|getStatus\(\)\.equals|switch.*status"

# CATEGORY 4: CONFIGURATION RULES
# 4.1 System configuration methods
Select-String -Recurse -Pattern "getConfig|isEnabled|getMax|getMin|getThreshold|SystemConfiguration"

# CATEGORY 5: CONTROLLER ORCHESTRATION (implicit data flow dependencies)
# 5.1 Sequential REST facade/client calls within a single controller method
Select-String -Recurse -Pattern "restClient\w+\.\w+\(" -Include "*Controller*.java"

# 5.2 Method results stored then passed to another call
Select-String -Recurse -Pattern "form\.set\w+\(.*get\w+\(" -Include "*Controller*.java"

# 5.3 Helper methods that chain API calls (e.g., getTaxTypeCodes, setSearchFormDefaults)
Select-String -Recurse -Pattern "private.*void\s+set\w+Defaults|private.*List.*get\w+Codes" -Include "*Controller*.java"
```

### Rule Source Coverage Requirements

| Source | Minimum Scan | Required Coverage |
|--------|--------------|-------------------|
| Backend Validators | All *Validator* files | 100% of reject() calls |
| Controller Logic | All *Controller* files | 90% of business if() |
| UI Layer | All view files (.jsp/.html/.tsx) | 80% of eligibility checks |
| System Config | Configuration adapters | All configurable params |
| Controller Orchestration | All *Controller* files | 100% of multi-endpoint sequences |

### MANDATORY: UI Layer Scan Checklist

**CRITICAL**: UI rules are often missed. MUST explicitly scan:

```powershell
# 1. MANDATORY: Find all view files in scope
Get-ChildItem -Recurse -Include "*.jsp","*.html","*.tsx","*.vue" | Select FullName

# 2. MANDATORY: Extract eligibility conditionals
Select-String -Path "*.jsp" -Pattern "balanceAmount|canAdd|isEligible|isAllowed"
Select-String -Path "*.jsp" -Pattern "CERTIFICATE|exclude|forbidden"

# 3. MANDATORY: Extract display suppression rules
Select-String -Path "*.jsp" -Pattern "empty|null|hide|suppress|not.*display"

# 4. MANDATORY: Check for derived status rules
Select-String -Path "*.jsp","*.java" -Pattern "deriv|calculat|status.*from|based.*on"
```

**UI Rule Categories to Document**:
1. **Add-to-cart eligibility** (balance > 0, not certificate, etc.)
2. **Display suppression** (AT has no due date, etc.)
3. **Status derivation** (claim status from balance)
4. **Feature toggles** (online payment available indicator)

### Rule Extraction Minimum Counts

| Module Size | Min Rules | Min Validators Scanned |
|-------------|-----------|------------------------|
| Small (<50 files) | 5 | 2 |
| Medium (50-200) | 10 | 5 |
| Large (>200) | 15 | 10 |

If fewer rules found, rescan with additional patterns.

### Rule Documentation Template

For EACH rule found:
```markdown
### BR-XXX: [Rule Name]

**Classification**: CORE | DYNAMIC | DERIVED
**DROOLS Candidate**: YES | NO

**Rule**: [One-sentence description]

**Source**: `File.java#methodName():line` (grep-verified)

**Code** (verified YYYY-MM-DD):
```java
[actual code snippet]
```
```

---

## Quality Checks (Before Gate 1)

**QC** = Quality Check — automated validation agents that verify analysis output quality before human Gate review.

**CRITICAL**: Launch 5 quality check agents IN PARALLEL after Step 1:

| Agent | Purpose | Output |
|-------|---------|--------|
| QC-01 | Completeness check | Coverage % |
| QC-02 | Accuracy (10% sample) | Hallucinations found |
| QC-03 | Terminology match | Glossary mismatches |
| QC-04 | Traceability chains | Broken chains |
| QC-05 | ID Consistency | BR/SR-ID mismatches across documents |

**Retry Protocol**: Max 2 retries per agent. After 2nd failure, escalate to human.

---

## ID Consistency Validation (QC-05)

Cross-document validation to ensure BR-IDs and SR-IDs are consistent.

### Validation Rules

1. **Every BR-ID in BRS must appear in RTM**
2. **Every SR-ID in SRS must trace to a BR-ID**
3. **Every BR-ID in LBR must have matching BR in BRS or be marked "IMPLEMENTATION-ONLY"**
4. **No duplicate IDs** (same ID with different meanings)

### Validation Script

```powershell
# Extract all BR-IDs from each document
$brsIds = Select-String -Path "BRS-*.md" -Pattern "BR-\d{3}" -AllMatches | 
    ForEach-Object { $_.Matches.Value } | Sort-Object -Unique

$srsIds = Select-String -Path "SRS-*.md" -Pattern "SR-\d{3}" -AllMatches | 
    ForEach-Object { $_.Matches.Value } | Sort-Object -Unique

$rtmBrs = Select-String -Path "RTM-*.md" -Pattern "BR-\d{3}" -AllMatches | 
    ForEach-Object { $_.Matches.Value } | Sort-Object -Unique

$lbrIds = Select-String -Path "LBR-*.md" -Pattern "BR-\d{3}" -AllMatches | 
    ForEach-Object { $_.Matches.Value } | Sort-Object -Unique

# Check for mismatches
$brsNotInRtm = $brsIds | Where-Object { $_ -notin $rtmBrs }
$lbrNotInBrs = $lbrIds | Where-Object { $_ -notin $brsIds }

Write-Output "BRS IDs not in RTM: $($brsNotInRtm -join ', ')"
Write-Output "LBR IDs not in BRS: $($lbrNotInBrs -join ', ')"
```

### Exit Criteria

- [ ] All BR-IDs traced across BRS → RTM
- [ ] All SR-IDs traced to BR-IDs
- [ ] No orphan IDs in LBR (or marked as IMPLEMENTATION-ONLY)
- [ ] No duplicate IDs with different meanings

---

## AI Railguards (MANDATORY)

### Railguard 1: Source Coverage Validation

Before generating any document, verify source coverage:

```powershell
# Count sources scanned vs sources in scope
$inScope = Get-Content PROJECT-SCOPE.md | Select-String "taxPortal|taxTms" | Measure-Object
$scanned = # (track during extraction)

# FAIL if coverage < 90%
if ($scanned.Count / $inScope.Count -lt 0.9) {
    Write-Error "RAILGUARD FAIL: Only scanned $($scanned.Count)/$($inScope.Count) in-scope paths"
}
```

### Railguard 2: Rule Count Sanity Check

| Module Type | Min Rules | Max Rules | Outside Range Action |
|-------------|-----------|-----------|---------------------|
| Small (<50 files) | 5 | 30 | WARN if outside |
| Medium (50-200) | 10 | 60 | WARN if outside |
| Large (>200) | 15 | 100 | WARN if outside |

If rule count is **below minimum**: Rescan with additional patterns before proceeding.
If rule count is **above maximum**: Review for duplicates/over-splitting.

### Railguard 3: Hallucination Prevention

**BEFORE writing any code reference**:
1. Run grep to verify file exists
2. Run grep to verify line number ±5 lines
3. If method name provided, verify method exists

```powershell
# Verification template
$file = "PaymentOnlineValidator.java"
$line = 60
$pattern = "reject\(ERROR_PAYMENT_CART_EMPTY"

$result = Select-String -Path $file -Pattern $pattern
if (-not $result -or [Math]::Abs($result.LineNumber - $line) -gt 5) {
    Write-Error "RAILGUARD FAIL: Line reference not verified"
}
```

### Railguard 4: UI Layer Coverage Check

**MANDATORY for frontend migrations**:
```powershell
# Count UI eligibility patterns found
$uiPatterns = Select-String -Recurse -Pattern "can[A-Z]|isEligible|isAllowed" -Include "*.jsp","*.html","*.tsx"
$uiRulesDocumented = # (count in LBR)

# WARN if UI coverage < 70%
if ($uiRulesDocumented / $uiPatterns.Count -lt 0.7) {
    Write-Warning "RAILGUARD WARN: UI layer rule coverage is $([math]::Round($uiRulesDocumented / $uiPatterns.Count * 100))%"
}
```

---

## Post-Generation Validation (QC-06)

After all documents generated, run comprehensive validation:

### QC-06: Coverage Completeness Audit

```powershell
# 1. Count actual reject() calls in source
$actualRejects = Select-String -Recurse -Pattern "reject\(|rejectValue\(" -Include "*Validator*.java" | Measure-Object

# 2. Count rules documented in LBR
$documentedRules = Select-String -Path "LBR-*.md" -Pattern "^### BR-" | Measure-Object

# 3. Calculate coverage
$coverage = $documentedRules.Count / $actualRejects.Count
Write-Output "Rule Coverage: $([math]::Round($coverage * 100))% ($($documentedRules.Count)/$($actualRejects.Count))"

# 4. FAIL if coverage < 80%
if ($coverage -lt 0.8) {
    Write-Error "QC-06 FAIL: Rule coverage $([math]::Round($coverage * 100))% is below 80% threshold"
    exit 1
}
```

### QC-06 Exit Criteria

| Metric | Threshold | Action if Below |
|--------|-----------|-----------------|
| Backend rule coverage | ≥80% | FAIL - rescan validators |
| UI rule coverage | ≥70% | WARN - review UI patterns |
| Line ref accuracy | 100% | FAIL - re-verify all refs |
| ID consistency | 100% | FAIL - fix ID mismatches |
| **test.md exists** | ✅ Required | **FAIL - create test.md** |

---

## Endpoint Reconciliation (QC-07)

Cross-reference DEPENDENCIES.md endpoint inventory against UC flow steps to detect implicit data flow dependencies.

**Trigger**: After Step 2 document generation (post-generation check, alongside QC-06).

### Why This Check Exists

Controller orchestration code often chains multiple REST calls in sequence — endpoint B requires output from endpoint A. If the UC flow summarizes this as a single step ("System queries data"), the prerequisite endpoint is invisible and will be missed in TO-BE specs.

**Real example**: `findTaxTypesForPayments` was documented in DEPENDENCIES but absent from UC flow and all TO-BE specs, causing HTTP 500 at runtime (DEV-001).

### Validation Script

```powershell
# 1. Extract all endpoint paths from DEPENDENCIES.md
$depsEndpoints = Select-String -Path "work/01-reconnaissance/DEPENDENCIES*.md" -Pattern '/(claims|payment|taxpayer)\S+' -AllMatches |
    ForEach-Object { $_.Matches.Value } | Sort-Object -Unique

# 2. Extract all endpoint paths referenced in UC document
$ucEndpoints = Select-String -Path "UC-*.md" -Pattern '/(claims|payment|taxpayer)\S+' -AllMatches |
    ForEach-Object { $_.Matches.Value } | Sort-Object -Unique

# 3. Find endpoints in DEPENDENCIES but NOT in UC
$missing = $depsEndpoints | Where-Object { $_ -notin $ucEndpoints }

# 4. Report
if ($missing.Count -gt 0) {
    Write-Warning "QC-07 WARN: $($missing.Count) endpoint(s) in DEPENDENCIES not referenced in UC:"
    $missing | ForEach-Object { Write-Warning "  MISSING: $_" }
} else {
    Write-Output "QC-07 PASS: All DEPENDENCIES endpoints appear in UC flow"
}
```

### Exit Criteria

- [ ] Every endpoint in DEPENDENCIES.md appears in at least one UC flow step
- [ ] Missing endpoints investigated — either added to UC as explicit step or documented as OUT-OF-SCOPE with justification
- [ ] Implicit data flow dependencies (endpoint A feeds endpoint B) documented in UC as separate steps

### Severity

| Result | Action |
|--------|--------|
| 0 missing | PASS |
| 1-3 missing | WARN — investigate before Gate 1, add to UC if prerequisite |
| >3 missing | FAIL — rescan controller orchestration (Category 5) |

---

## Output Documents

All written to `{ANALYSIS_ROOT}/arch-as-is-lite/`:

**Creation Order**: UC document FIRST, then remaining documents. The UC establishes actors, flows, and business rules that BRS/SRS/LBR reference.

| # | Document | Template | Content |
|---|----------|----------|---------|
| 0 | `work/01-reconnaissance/DEPENDENCIES.md` | - | Working artifact (Step 1 output, archived) |
| 1 | `UC-{module}.md` | `09.04_Use_Case_UC_Template.md` | **CREATE FIRST** - AS-IS use case: actors, preconditions, flows, exceptions, input data, calculations, access control |
| 2 | `BRS-{module}.md` | - | Business Requirements Specification |
| 3 | `SRS-{module}.md` | - | System Requirements Specification |
| 4 | `RTM-{module}.md` | - | Requirements Traceability Matrix |
| 5 | `LBR-business-rules.md` | - | Business Rules Catalog |
| 6 | `test.md` | `09.04_Use_Case_UC_Template.md` | AS-IS test automation documentation (UC format) |
| 7 | `DTO-specification-OAPI3.0.md` | `12-dto-specification-oapi3.0.md` | TypeScript interfaces for Angular (OpenAPI 3.0 aligned) |
| 8 | `MODERNIZATION-STRATEGY.md` | - | Migration phases |

### UC Document Instructions

**Template**: `09.04_Use_Case_UC_Template.md` (18 sections)

The UC document is the **first deliverable** because it establishes:
- **Actors** (Section 4) - who interacts with the system
- **Flows** (Sections 7-8) - step-by-step current behavior with JSP/Java references
- **Business Rules** (Section 7 column) - rules applied at each step
- **Input Data** (Section 11) - exact fields, types, validation rules
- **Calculations** (Section 12) - derived values, formatting rules

Other documents then reference the UC:
- BRS extracts requirements from UC flows
- SRS maps UC steps to technical implementation
- LBR catalogs rules identified in UC happy/alternate paths
- RTM traces UC steps → BRS → SRS → LBR → test

**UC Content Rules (AS-IS)**:
- Reference current JSP line numbers and Java controller methods
- Document current Liferay portlet behavior, not future Angular
- Include exact JSP tag usage (`<ntl:formatNumber>`, `<c:if>`, `<fmt:message>`)
- Map each happy path step to a specific source file:line
- **One UC step per REST call**: If a single controller method calls multiple REST endpoints in sequence, each call MUST be a separate UC step. This preserves implicit data flow dependencies (e.g., "resolve tax types" before "search payments") that would otherwise be lost in TO-BE specification.

**ai1st-arch-legacy-to-modern-design-lite creates TO-BE spec.md**: After ai1st-arch-legacy-analysis-lite produces the AS-IS UC, ai1st-arch-legacy-to-modern-design-lite uses it + RTM to create `spec.md` with FE/BE/BW/DM categorization for the target architecture.

### test.md Document Instructions (MANDATORY)

**Template**: `09.04_Use_Case_UC_Template.md` (UC format)

Document the AS-IS test automation state. This is required for ai1st-arch-legacy-to-modern-design-lite prerequisites.

**Sources to scan** (using PROJECT-SCOPE.md paths):
```powershell
Get-ChildItem -Recurse -Include "*Test.java","*Spec.ts","*Page.java"
Get-ChildItem -Recurse -Include "testng.xml","karma.conf.js","pom.xml"
```

**Minimum content:**

| UC Section | test.md Content |
|------------|-----------------|
| 3. Summary | Test framework overview |
| 4. Actors | Test runners, CI/CD systems |
| 5. Preconditions | Test environment requirements |
| 7. Happy Path | Existing test execution flow |
| 8. Alternate Flows | Test types (unit, E2E, integration) |
| 11. Input Data | Test data sources, fixtures |
| 14. Design | Test artifact inventory (page objects, models) |
| 18. Notes | Coverage gaps, known issues |

**test.md is NOT optional**: QC-06 Coverage Audit verifies it exists.

### Template Location

Templates are in `{PROJECT_ROOT}/.ai/legacy-analysis-process/templates/`

### RTM as Source of Truth

**RTM-{module}.md is the living document** that connects AS-IS to TO-BE:

1. **Created by ai1st-arch-legacy-analysis-lite**: Links legacy code references to business requirements
2. **Updated by ai1st-arch-legacy-to-modern-design-lite**: Adds TO-BE categorization (FE/BE/BW/DM)
3. **Referenced by ai1st-po-specify**: Ensures traceability in feature specs

**RTM stays in `arch-as-is-lite/`** - it is NOT copied to `arch-to-be/`.
TO-BE documents reference it via relative links in CONTEXT.md.

---

## Duration

| Phase | Time |
|-------|------|
| Step 0 + Inputs | 15 min |
| Step 1: Extraction | 2-3 hours |
| QC Validation | 15-30 min |
| Gate 1: Human Review | Variable |
| Step 2: Documents | 1-2 hours |
| **Total** | **3-4 hours** |

---

## Session Management

### Context Clearing for LITE Process

The LITE process (3-4 hours) can usually complete in 1-2 sessions:

| Codebase Size | Files | Sessions | Clear Context? |
|---------------|-------|----------|----------------|
| Small | <50 Java files | 1 | No |
| Medium | 50-200 files | 1-2 | After Gate 1 |
| Large | >200 files | 2 | After Gate 1 |

### KG Session Save (at Gate 1 — before /clear)

If KG is available, save session state before clearing context:

```
add_observations([{
  entityName: "SESSION-{module}",
  contents: [
    "gate: gate-1-status = APPROVED",
    "gate: gate-1-timestamp = {ISO}",
    "gate: entity-counts = BR:{N}, FR:{N}, INT:{N}, DTO:{N}, TERM:{N}",
    "gate: artifacts-complete = DEPENDENCIES.md",
    "gate: artifacts-pending = BRS, SRS, UC, RTM, LBR, DTO, TEST, MODERNIZATION-STRATEGY"
  ]
}])
```

### If Continuing After Gate 1

1. User runs `/clear`
2. User invokes `/ai1st-arch-legacy-analysis-lite resume`
3. **KG Resume** (if available):
   - `open_nodes(["SESSION-{module}"])` → restore variables and state
   - `search_nodes("STEP-601")` → find last completed step
   - `search_nodes("GATE-601")` → confirm gate decisions
   - `search_nodes("TERM-")` → terminology still available (no re-read needed)
   - `search_nodes("BR-")` → all business rules available
   - → AI immediately knows: "Resume from Step 2"
4. **File-based resume** (fallback):
   - `{PROJECT_ROOT}/.ai_project_memory/legacy-analysis-constitution.md`
   - `{ANALYSIS_ROOT}/arch-as-is-lite/work/01-reconnaissance/DEPENDENCIES.md` (Step 1 output)
   - `{ANALYSIS_ROOT}/work/gate-tracking.md` (if exists)
5. Confirm with user before proceeding to Step 2

---

## Hooks Integration

Copy `.claude/hooks.json` from n-ai1st-kit to enable automated validation:
- **PreToolUse**: Block writes to source code (READ-ONLY)
- **PostToolUse**: Validate output document structure
- **Stop**: Verify file:line references

---

## Process Guide

See: `{PROJECT_ROOT}/.ai/legacy-analysis-process/process-steps/as-is-brownfield/how-to-perform-legacy-analysis-lite.md`

---

*Version: 2.4 | Updated: 2026-02-17*

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.4 | 2026-02-17 | Renamed VV → QC (Quality Check) with explicit definition. Added: Category 5 Controller Orchestration scan patterns (§1.5), QC-07 Endpoint Reconciliation (DEPENDENCIES vs UC cross-reference), UC granularity guidance (one step per REST call), Gate 1 endpoint cross-reference. Motivated by DEV-001 spec deviation (missing findTaxTypesForPayments). |
| 2.3 | 2026-02-10 | Added: Knowledge Graph integration — KG Protocol import, Step 0.1 Bootstrap, Gate 0.5 KG enrichment, Step 1 KG-First extraction, Step 2 KG-assisted generation, Session continuity via KG |
| 2.2 | 2026-02-07 | Changed: Code Reference Format (File#method():line → pattern ✓date), Added: test.md mandatory instructions, Extended: QC-06 to require test.md |
| 2.1 | 2026-02-06 | Added: UC document as first deliverable (09.04 template), creation order, UC content rules, ai1st-arch-legacy-to-modern-design-lite handoff |
| 2.0 | 2026-02-06 | Added: AS-IS vs TO-BE Content Rules - SRS must be pure AS-IS, TO-BE only in MODERNIZATION-STRATEGY |
| 1.9 | 2026-02-06 | Added: PO/BA role designation, workflow position diagram, Key Outputs table, RTM as source of truth |
| 1.8 | 2026-02-06 | Added: Business Context Discovery (Step 0.6), context categories, inventory template, missing context warning |
| 1.7 | 2026-02-05 | Added: MANDATORY UI Layer Scan Checklist, explicit JSP/view scan instructions (fixes V7 gap) |
| 1.6 | 2026-02-05 | Added: Technology-agnostic scan patterns, AI Railguards (4), QC-06 Coverage Audit, UI layer coverage requirements |
| 1.5 | 2026-02-05 | Added: Rule Extraction Checklist (1.5), ID Consistency Validation (QC-05), minimum rule counts |
| 1.4 | 2026-02-05 | Added: DTO-specification-OAPI3.0.md output with template reference, archive DEPENDENCIES.md to work/ |
| 1.3 | 2026-02-05 | Added: Gate 0.5 Terminology Validation, Sub-Agent Context Propagation, Code Reference Accuracy requirements |
| 1.2 | 2026-02-03 | Initial LITE process |
