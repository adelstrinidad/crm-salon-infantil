---
name: ai1st-arch-setup-analysis-scope
description: "Setup analysis module folder structure and generate PROJECT-SCOPE.md for legacy analysis."
disable-model-invocation: true
---

# Setup Analysis Scope (ai1st-arch-setup-analysis-scope)

Create a new analysis module folder structure and generate a PROJECT-SCOPE.md with AI-assisted codebase scanning.

**Role**: PO / Business Analyst
**Command**: `/ai1st-arch-setup-analysis-scope setup <MODULE_NAME> at <DOCS_OUTPUT_PATH> scanning <SOURCE_CODE_ROOT>`

---

## Execution Rules (CRITICAL)

**Target execution time: < 2 minutes.** This is a lightweight setup command, not a deep analysis.

- **Do NOT use Task tool** — all scanning uses direct Glob, Grep, and Read tools only
- **Do NOT use Bash for directory listing** — use Glob tool, not `dir`, `ls`, or PowerShell commands. Bash is ONLY for `powershell -Command "New-Item..."` folder creation.
- **Do NOT read file contents** — count files and list paths only (ai1st-arch-legacy-analysis-lite does the deep analysis). Exception: Read previous PROJECT-SCOPE.md if found (to carry forward §6 Migration Strategy).
- **Do NOT ask unnecessary questions** — parse all 3 required params from the command string first
- **One AskUserQuestion maximum** — combine all missing params into a single question if needed
- **Run validations in parallel** — use parallel tool calls for independent checks
- **MODULE_NAME_PATTERN**: Extract the core domain keyword from MODULE_NAME for Glob patterns. E.g., `claims-portlet` → use `*claim*` (not `*claims-portlet*`, which won't match `tms-portal-taxpayer/.../claims/`). Strip suffixes like `-portlet`, `-service`, `-module`.

---

## Workflow Position

```
ai1st-arch-setup-analysis-scope (SETUP) → ai1st-arch-legacy-analysis-lite (AS-IS) → ai1st-arch-legacy-to-modern-design-lite (TO-BE) → ai1st-po-specify → plan
   PO/BA          PO/BA           PO/BA            Dev             Dev
     ↓
  Outputs:
  - Folder structure (arch-as-is-lite/, arch-to-be-lite/specs/, work/, docs/business-context/)
  - PROJECT-SCOPE.md (AI pre-filled from codebase scan)
  - Ready for ai1st-arch-legacy-analysis-lite analysis
```

**Prerequisite**: Source code repository accessible. Analysis docs repository accessible.

---

## When to Use

Use ai1st-arch-setup-analysis-scope when:
- Starting analysis of a **new module** for the first time
- Need to create the standard folder structure and PROJECT-SCOPE.md
- Want AI to pre-fill scope boundaries by scanning the codebase

Do NOT use ai1st-arch-setup-analysis-scope when:
- Module folder and PROJECT-SCOPE.md already exist (run ai1st-arch-legacy-analysis-lite directly)
- Creating a new version of existing analysis (manually copy/archive)

---

## Input Parameters

Parse from the command invocation string. All 3 required params should be in the command:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `MODULE_NAME` | Short name for the module being analyzed | `claims-portlet`, `income-portlets`, `ng-pit-withholding` |
| `DOCS_OUTPUT_PATH` | Absolute path where analysis docs will be written | `C:\GIT\Oman_TAMS\tams-docs\tms-claims-portlet` |
| `SOURCE_CODE_ROOT` | Absolute path to the source code repository root | `C:\GIT\OmanTAX` |

**Optional parameters** (use defaults, ask only if clearly needed):
| Parameter | Description | Default |
|-----------|-------------|---------|
| `SHARED_DOCS_PATH` | Path to shared business context (Glossary, BRDs) | `{DOCS_OUTPUT_PATH}/../shared/docs/business-context/` |
| `TEST_AUTOMATION_PATH` | Path to test automation repository | *(omit if not provided)* |

---

## Step 0: Validate Inputs

### 0.1 Parse command arguments

Extract `MODULE_NAME`, `DOCS_OUTPUT_PATH`, and `SOURCE_CODE_ROOT` from the user's command string.

**If ALL 3 are provided**: proceed immediately to Step 0.2. Do NOT ask any questions.

**If any are missing**: use ONE AskUserQuestion to collect ALL missing params at once. Do NOT ask separate questions for each parameter.

### 0.2 Validate paths and verify prerequisites

Run ALL of these checks in parallel using Glob/Grep tools (not PowerShell):

1. **Source code exists**: Glob for any file in `{SOURCE_CODE_ROOT}`
2. **Output path does NOT exist**: Glob for any file in `{DOCS_OUTPUT_PATH}` — if found, STOP
3. **CLAUDE.md exists**: Glob for `{SOURCE_CODE_ROOT}/.claude/CLAUDE.md`
4. **Constitution files exist**: Glob for `{SOURCE_CODE_ROOT}/.ai_project_memory/*constitution*.md`
5. **Constitution imports in CLAUDE.md**: Grep for `legacy-analysis-constitution` in CLAUDE.md

**If output path already exists**: STOP. Inform user:
```
⚠️ {DOCS_OUTPUT_PATH} already exists.
Options:
1. Use existing folder (skip ai1st-arch-setup-analysis-scope, run ai1st-arch-legacy-analysis-lite directly)
2. Archive existing folder first, then create new
3. Choose a different output path
```

**If CLAUDE.md is missing**: STOP. Inform user:
```
⚠️ {SOURCE_CODE_ROOT}/.claude/CLAUDE.md not found.

ai1st-arch-legacy-analysis-lite requires CLAUDE.md with constitution imports to apply analysis rules.
Copy the AI-kit to your project:
  Copy n-ai1st-kit/.claude/     → {SOURCE_CODE_ROOT}/.claude/
  Copy n-ai1st-kit/.ai/         → {SOURCE_CODE_ROOT}/.ai/
Then run /ai1st-kit-project-init to initialize .ai_project_memory/ from templates.

See LEGACY-ANALYSIS-CHECKLIST.md §2.0 for full setup instructions.
```

**If constitution files or imports are missing**: WARN (non-blocking) and continue:
```
⚠️ Constitution file(s) or @imports missing. ai1st-arch-legacy-analysis-lite may run without analysis rules.
Run /ai1st-kit-project-init to initialize .ai_project_memory/ from templates and verify .claude/CLAUDE.md has @ imports.
```

---

## Step 1: Create Folder Structure

Create the standard analysis folder structure using Bash:

```bash
# Use PowerShell on Windows
powershell -Command "New-Item -ItemType Directory -Force -Path @('{DOCS_OUTPUT_PATH}/arch-as-is-lite', '{DOCS_OUTPUT_PATH}/arch-to-be-lite/specs', '{DOCS_OUTPUT_PATH}/work', '{DOCS_OUTPUT_PATH}/docs/business-context')"
```

**Verify**: List created directories to confirm.

---

## Step 2: Read PROJECT-SCOPE Template

Read the template from:
```
{SOURCE_CODE_ROOT}/.ai/legacy-analysis-process/templates/PROJECT-SCOPE-template.md
```

This template has 7 sections:
1. Analysis Target Definition
2. Scope Boundaries
3. Technology Boundaries (incl. §3.3-3.6)
4. Analysis Objectives
5. Stakeholders and Contacts
6. Constraints and Assumptions
7. Scope Change Control

---

## Step 3: Quick Codebase Scan

**SPEED RULE**: Use only Glob and Grep tools. Do NOT read file contents. Count files and list paths only. Run all scans in parallel.

### 3.1 Scan for §1 — Analysis Target (Glob only)

Run these Glob calls in parallel:

```
# Find module-related directories
Glob: {SOURCE_CODE_ROOT}/**/*{MODULE_NAME_PATTERN}*

# Count source files
Glob: {SOURCE_CODE_ROOT}/**/*{MODULE_NAME_PATTERN}*/**/*.java
Glob: {SOURCE_CODE_ROOT}/**/*{MODULE_NAME_PATTERN}*/**/*.jsp
Glob: {SOURCE_CODE_ROOT}/**/*{MODULE_NAME_PATTERN}*/**/*.ts
```

Fill from results:
- **Module Name**: from `MODULE_NAME` parameter
- **Module Type**: infer from file extensions found (JSP → Portlet, .ts → Angular, .java only → Service)
- **Estimated Size**: file counts from Glob results

### 3.2 Scan for §2 — Scope Boundaries (Glob only)

Run these Glob calls in parallel:

```
# Controllers
Glob: {SOURCE_CODE_ROOT}/**/*{MODULE_NAME_PATTERN}*/**/*Controller*.java

# Services
Glob: {SOURCE_CODE_ROOT}/**/*{MODULE_NAME_PATTERN}*/**/*Service*.java

# Views (JSP/Angular)
Glob: {SOURCE_CODE_ROOT}/**/*{MODULE_NAME_PATTERN}*/**/*.jsp
Glob: {SOURCE_CODE_ROOT}/**/*{MODULE_NAME_PATTERN}*/**/*.component.ts

# Validators
Glob: {SOURCE_CODE_ROOT}/**/*{MODULE_NAME_PATTERN}*/**/*Validator*.java
```

**OUT OF SCOPE**: list sibling directories at the same level as the module.

### 3.3 Scan for §3 — Technology (Grep only)

Run these Grep calls in parallel:

```
# Java version
Grep: "java.version|maven.compiler.source" in {SOURCE_CODE_ROOT}/**/pom.xml (first 3 matches)

# Framework
Grep: "spring-framework|spring-boot|liferay" in {SOURCE_CODE_ROOT}/**/pom.xml (first 5 matches)

# Database
Grep: "oracle|postgresql|mysql" in {SOURCE_CODE_ROOT}/**/*.properties (first 3 matches)
```

### 3.4 Scan for §3.3-3.6 — Supporting artifacts

Run these in parallel:

```
# Database entities
Grep: "@Entity|@Table" in {SOURCE_CODE_ROOT}/**/*{MODULE_NAME_PATTERN}*/**/*.java (files_with_matches)

# Shared business context — list ALL files individually
Glob: {SHARED_DOCS_PATH}/*

# Test automation (if path provided)
Glob: {TEST_AUTOMATION_PATH}/**/*{MODULE_NAME_PATTERN}*

# Existing module docs — check sibling analysis folders for data model and test framework
Glob: {DOCS_OUTPUT_PATH}/../*{MODULE_NAME_PATTERN}*/docs/data-model/*
Glob: {DOCS_OUTPUT_PATH}/../*{MODULE_NAME_PATTERN}*/docs/test-framework/*

# Previous analysis of same module — check for existing analysis folders
Glob: {DOCS_OUTPUT_PATH}/../*{MODULE_NAME_PATTERN}*/PROJECT-SCOPE.md
```

---

## Step 4: Generate PROJECT-SCOPE.md

Using scan results from Step 3, generate a filled PROJECT-SCOPE.md.

### Generation Rules

1. **Use template structure** — keep all 7 sections from the template
2. **Fill with scan data** — replace `{placeholders}` with discovered values
3. **Mark uncertainties** — use `⚠️ VERIFY:` prefix for values that need human confirmation
4. **Include file counts** — show estimated scope size (files, LOC)
5. **Relative paths** — use paths relative to source code root where possible
6. **No personal info** — leave stakeholder names as `{Name}` placeholders

### Simplified Template for Generated Output

Use a streamlined version matching the completed examples (claims, payments):

```markdown
# Project Scope: {Module Display Name}

**Module**: {MODULE_FULL_NAME}
**Scope Type**: {Scope Type}
**Date**: {TODAY YYYY-MM-DD}
**Status**: DRAFT

---

## 1. What We're Analyzing

| Attribute | Value |
|-----------|-------|
| **Module** | {Module Description} |
| **Deployment** | {Deployment target} |
| **Users** | {User types} |

**Analysis Output**: `{DOCS_OUTPUT_PATH}`

---

## 2. Module Boundaries (CRITICAL)

### IN SCOPE: {Module Short Name}

| Feature | Path | Description |
|---------|------|-------------|
{Group by FEATURE, not individual files. Use business-readable names like "View Claims", "Filter Claims", "Dashboard Widget", "REST APIs (Claims)", "Core Logic (Claims)". Each row = one feature area with its directory path, not one Java file per row.}
{Include test artifacts as separate rows: page objects, API models, test enums from test automation scan}

### OUT OF SCOPE: {Neighboring Module}

| Feature | Path | Why Excluded |
|---------|------|--------------|
{Group by module/domain. List sibling portlets, backend modules not in scope, test artifacts for excluded features.}
{Use short descriptions. One row per excluded domain area, not per file.}

---

## 3.3 Database Schema Location

{If data-model docs found in sibling analysis folder, reference them:}
**Existing data model docs**: `{sibling_path}/docs/data-model/`
{List each file found}

{If entity classes found in scan:}
**Entity classes**: {list from Grep @Entity/@Table results}

---

## 3.4 Business Requirements Documents

**Shared business context** (`{SHARED_DOCS_PATH}/`):
{List EACH file found individually — name and brief description based on filename:}
| Document | Description |
|----------|-------------|
| `Glossary.md` | Term definitions |
| `{filename}.md` | {infer from name} |
| `{filename}.pdf` | {infer from name} |

---

## 3.5 Test Automation Location

**Repository**: `{TEST_AUTOMATION_PATH}`

{If test-framework docs found in sibling analysis folder, reference them:}
**Existing test framework docs**: `{sibling_path}/docs/test-framework/TEST-FRAMEWORK.md`

### Module-Related Test Artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
{From test automation scan — page objects, test classes, enums, API models}

### Test Coverage Gap

| Layer | Coverage | Notes |
|-------|----------|-------|
| Portal Controller | ⚠️ VERIFY | {Check if unit tests exist for controllers} |
| Portal Validator | ⚠️ VERIFY | {Check if unit tests exist for validators} |
| E2E (Selenium) | ⚠️ VERIFY | {Check if page objects exist} |

---

## 3.6 Shared Business Context

| Document Type | Shared Path |
|---------------|-------------|
| Glossary | `../shared/docs/business-context/Glossary.md` |
| Common BRDs | `../shared/docs/business-context/` |

**Resolution order**: module-local `docs/business-context/` > shared path above

---

## 4. Technology

| Layer | Current | Target |
|-------|---------|--------|
| Frontend | {detected} | {placeholder} |
| Backend | {detected} | {placeholder} |
| Database | {detected} | {placeholder} |
| Java | {detected} | {placeholder} |

> **Reference**: See stack-specific constitution (constitution-frontend.md or constitution-backend.md) for full stack details.

---

## 5. Test Automation Framework

> **Reference**: See stack-specific constitution for target technology decisions.

{If TEST-FRAMEWORK.md found in sibling analysis:}
**Detailed test framework documentation**: `{sibling_path}/docs/test-framework/TEST-FRAMEWORK.md`

{Read the first 50 lines of TEST-FRAMEWORK.md to extract the technology stack table (Current vs Target). Copy the tech stack table here. This is allowed as an exception to the "do not read file contents" rule — it's an existing analysis doc, not source code.}

---

## 6. TO-BE Migration Strategy

{If previous analysis PROJECT-SCOPE.md was found AND it has a §6 section:}
{Read §6 from previous PROJECT-SCOPE.md and carry it forward here. This is allowed as an exception to the "do not read file contents" rule — it's an existing analysis doc, not source code.}

{If no previous analysis exists:}
⚠️ *This section is populated by ai1st-arch-legacy-analysis-lite analysis and architect review. Left as placeholder.*

---

## 7. Scope Rationale

**Why {Module}-Only Scope?**

1. ⚠️ VERIFY: {Infer separation reasons from module boundaries}
2. ⚠️ VERIFY: {Risk isolation rationale}
3. **Incremental Analysis**: Smaller scope enables faster, more focused analysis

---

## 8. Change Log

| Date | Change | Approved By |
|------|--------|-------------|
| {TODAY} | Initial scope generated by ai1st-arch-setup-analysis-scope | - |

---

{If previous analysis folders found for same module:}
**Related Scope**: `{previous_analysis_path}` (previous analysis)
```

---

## Step 5: Write Draft & Confirm (GATE)

**CRITICAL: Write the draft file FIRST, then present the gate.** The file must exist on disk before asking for approval. This ensures the user always has a file to review/edit even if the gate interaction is interrupted.

### 5.1 Write Draft

Write the generated PROJECT-SCOPE.md to `{DOCS_OUTPUT_PATH}/PROJECT-SCOPE.md` immediately.

### 5.2 Present to User (MANDATORY human gate)

Display the generated content summary and ask for approval.

Use AskUserQuestion with these options:

```
PROJECT-SCOPE.md has been written to {DOCS_OUTPUT_PATH}/PROJECT-SCOPE.md.

Options:
1. APPROVE — Looks good, proceed to completion summary
2. EDIT MANUALLY — I'll edit in IDE before running ai1st-arch-legacy-analysis-lite
3. REGENERATE — Re-scan with different parameters
```

### Gate Actions

| Decision | Action |
|----------|--------|
| **APPROVE** | Proceed to Step 6 (completion summary) |
| **EDIT MANUALLY** | Print edit instructions, user edits in IDE |
| **REGENERATE** | Ask what to change, re-run Step 3 scans, overwrite file |

---

## Step 6: Completion Summary

After writing PROJECT-SCOPE.md, print:

### Created Structure

```
{DOCS_OUTPUT_PATH}/
├── PROJECT-SCOPE.md            ✅ Generated
├── arch-as-is-lite/            ✅ Created (empty — ai1st-arch-legacy-analysis-lite writes here)
├── arch-to-be-lite/
│   └── specs/                  ✅ Created (empty — ai1st-arch-legacy-to-modern-design-lite writes here)
├── work/                       ✅ Created (empty — ai1st-arch-legacy-analysis-lite writes here)
└── docs/
    └── business-context/       ✅ Created (add BRDs, Glossary here)
```

### Completion Checklist

- [ ] All IN SCOPE paths verified in codebase
- [ ] Test artifacts from test automation repo included in §2 and §5
- [ ] Stack-specific constitutions referenced in §4 and §5
- [ ] Glossary.md available (in shared or module-local `docs/business-context/`)
- [ ] §3.6 Shared Business Context path correct
- [ ] Change log present

### Next Steps

```
1. Review and refine PROJECT-SCOPE.md if needed
2. Add business context documents to docs/business-context/
3. Run AS-IS analysis:
   /ai1st-arch-legacy-analysis-lite perform analysis of {MODULE_NAME} according to {DOCS_OUTPUT_PATH}/PROJECT-SCOPE.md and output to {DOCS_OUTPUT_PATH}
```

---

*Version: 2.3 | Created: 2026-02-11*

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.3 | 2026-02-11 | Test feedback fixes: (1) MODULE_NAME_PATTERN rule — extract core keyword, strip `-portlet`/`-service` suffixes. (2) §2 IN SCOPE groups by FEATURE not individual files. (3) §5 reads TEST-FRAMEWORK.md header for tech stack table. (4) §6 carries forward Migration Strategy from previous analysis. (5) No Bash for directory listing — Glob only. (6) Write draft BEFORE gate — file always exists on disk. |
| 2.2 | 2026-02-11 | Removed §3 Key Definitions and Attributes sub-section — Glossary.md provides domain terms, ai1st-arch-legacy-analysis-lite discovers module-specific terms from deep code reading. ai1st-arch-setup-analysis-scope can't reliably populate these without reading file contents. |
| 2.1 | 2026-02-11 | Template quality upgrade from test feedback: Added scans for existing module docs (data-model, test-framework) and previous analysis folders. Template now includes: §3.3 references existing data model docs, §3.4 lists ALL shared docs individually, §3.5 references existing TEST-FRAMEWORK.md and includes Test Coverage Gap table, §6 Migration Strategy placeholder, §7 Scope Rationale section, §8 Related Scope links. Paths use relative format (../shared/). |
| 2.0 | 2026-02-11 | Performance rewrite: added Execution Rules (no Task agents, < 2 min target), replaced PowerShell scans with Glob/Grep, removed Step 0.3 module type detection, enforced single AskUserQuestion max, all scans use parallel tool calls. |
| 1.1 | 2026-02-11 | Added Step 0.4: Verify CLAUDE.md and constitution imports before proceeding. |
| 1.0 | 2026-02-11 | Initial version — folder creation, AI-assisted PROJECT-SCOPE generation, human gate |
