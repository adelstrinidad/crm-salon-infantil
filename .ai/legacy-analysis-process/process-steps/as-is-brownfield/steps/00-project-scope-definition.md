# Step 00: Project Scope Definition

**Duration**: 15-30 minutes
**Prerequisites**: None (this is the first step)
**Output**: `PROJECT-SCOPE.md` at analysis output root

---

## Overview

Before starting any reconnaissance or analysis, explicitly define the analysis scope. This is critical for monorepos and complex systems with multiple modules.

**Why This Step Exists**:
- Large monorepos contain multiple modules/subsystems
- Without explicit scope, analysis becomes unfocused, incomplete, or wastefully broad
- The PROJECT-SCOPE.md document is the CONTRACT for what will be analyzed
- All subsequent steps reference this document to stay within boundaries

**Key Decisions**:
1. **Target Module**: Which module(s) are we analyzing?
2. **In-Scope Paths**: Directories that WILL be analyzed
3. **Out-of-Scope Paths**: Directories explicitly EXCLUDED
4. **Partial Scope**: Dependencies analyzed at interface level only
5. **Analysis Objectives**: What questions must be answered?

---

## Required Output

### File: `PROJECT-SCOPE.md`

**Location**: Root of analysis output folder (NOT in a subdirectory)

```
{analysis-docs-folder}/
├── PROJECT-SCOPE.md          ← This file (Step 00 output)
├── arch-as-is/               ← Arc42 documentation (Steps 01-09)
├── arch-to-be/               ← Modernization documentation
└── work/                     ← Analysis artifacts (Steps 01-09)
```

**Template**: Use `templates/PROJECT-SCOPE-template.md`

---

## Process

### 1. Identify Analysis Target (5 min)

Ask or determine:
- What module/subsystem is the focus?
- Why is this module being analyzed? (Migration? Performance? Compliance?)
- Is this a full application or a specific vertical slice?

### 1.5 Module Boundary Definition Protocol (MANDATORY)

**CRITICAL**: Before analysis begins, explicitly define module boundaries to prevent scope creep and overlapping analysis.

**Why This Matters**: Large systems have interconnected modules. Without explicit boundaries:
- Analysis may include out-of-scope functionality
- Documents may contain incorrect information about adjacent modules
- Stakeholder confusion about what's included

**Required Boundary Checklist**:

| Module | IN SCOPE? | Reason |
|--------|-----------|--------|
| {Primary Module} | ✅ YES | Primary analysis target |
| {Adjacent Module 1} | ❌ NO | Separate bounded context |
| {Adjacent Module 2} | ❌ NO | Back Office only |
| {Shared Services} | ⚠️ PARTIAL | Interface contracts only |

**Boundary Validation**: Stakeholder MUST approve module boundaries BEFORE detailed analysis begins.

### 2. Define Scope Boundaries (10 min)

Document:
- **IN SCOPE**: List all directories/files to be analyzed
- **OUT OF SCOPE**: List directories explicitly excluded with reasons
- **PARTIAL SCOPE**: Dependencies analyzed at interface level only

### 3. Set Analysis Objectives (5 min)

Define:
- Primary questions to answer
- Expected deliverables
- What is explicitly NOT in scope for this analysis

### 4. Document Constraints (5 min)

Note:
- Time constraints
- Access limitations
- Resource constraints
- Key assumptions

---

## Validation Checklist

Before proceeding to Step 01, verify:

- [ ] `PROJECT-SCOPE.md` exists at analysis output root
- [ ] Analysis Target is clearly defined
- [ ] In-Scope paths are listed with estimated size
- [ ] Out-of-Scope paths are listed with reasons
- [ ] Analysis objectives are documented
- [ ] Status is set to "Draft" (approval comes later)

---

## Common Mistakes to Avoid

| Mistake | Correct Approach |
|---------|------------------|
| Putting PROJECT-SCOPE.md in `work/00-scope/` | Place at analysis root, NOT in subdirectory |
| Skipping scope definition for "simple" projects | Always create scope document, even for single-module analysis |
| Vague scope like "analyze the backend" | Specific paths: `taxTms/tms-core/`, `taxTms/tms-rest/` |
| No exclusions documented | Explicitly list what's OUT of scope with reasons |

---

## Next Step

After completing `PROJECT-SCOPE.md`, proceed to **Step 01: Codebase and Documentation Reconnaissance**.

---

*Template Version: 1.0*
*Last Updated: 2026-01-24*
