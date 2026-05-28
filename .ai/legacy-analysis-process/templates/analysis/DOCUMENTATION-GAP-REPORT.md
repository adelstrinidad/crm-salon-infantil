# Documentation Gap Report Template

**Purpose**: Final report on documentation gaps identified and resolved
**Output Location**: `artifacts/09-summaries/DOCUMENTATION-GAP-REPORT.md`
**Used In**: Step 09 (Accurate AS-IS Summary Documentation)
**Audience**: Documentation team, process improvement team, modernization team

---

## Executive Summary

This report documents all gaps identified between code reality and business
documentation during the legacy analysis process, along with their resolution
status and recommendations.

### Key Metrics

| Metric | Value |
|--------|-------|
| **Total Gaps Identified** | {n} |
| **Resolved (Updated Docs)** | {n} ({%}) |
| **Deferred (TO-BE Phase)** | {n} ({%}) |
| **Intentional (Documented Workaround)** | {n} ({%}) |
| **Open (Needs Action)** | {n} ({%}) |

---

## Gap Analysis Summary

### By Category

| Category | Count | High Priority | Resolved |
|----------|-------|---------------|----------|
| Documentation Ahead of Reality | {n} | {n} | {n} |
| Reality Ahead of Documentation | {n} | {n} | {n} |
| Divergence | {n} | {n} | {n} |
| Intentional Workarounds | {n} | {n} | {n} |
| Undocumented Technical Debt | {n} | {n} | {n} |

### By Priority

| Priority | Count | Resolved | Open |
|----------|-------|----------|------|
| Critical | {n} | {n} | {n} |
| High | {n} | {n} | {n} |
| Medium | {n} | {n} | {n} |
| Low | {n} | {n} | {n} |

---

## Detailed Gap Register

### Critical Gaps

| Gap ID | Description | Category | Status | Resolution |
|--------|-------------|----------|--------|------------|
| GAP-001 | {Description} | {Category} | Resolved | {Resolution details} |
| GAP-002 | {Description} | {Category} | Deferred | {Why deferred} |

### High Priority Gaps

| Gap ID | Description | Category | Status | Resolution |
|--------|-------------|----------|--------|------------|
| GAP-010 | {Description} | {Category} | {Status} | {Resolution} |

### Medium Priority Gaps

| Gap ID | Description | Category | Status | Resolution |
|--------|-------------|----------|--------|------------|
| GAP-020 | {Description} | {Category} | {Status} | {Resolution} |

### Low Priority Gaps

| Gap ID | Description | Category | Status | Resolution |
|--------|-------------|----------|--------|------------|
| GAP-030 | {Description} | {Category} | {Status} | {Resolution} |

---

## Resolution Details

### Documentation Updates Made

| Document | Section | Change | Gap ID |
|----------|---------|--------|--------|
| {Document name} | {Section} | {What changed} | {Gap ID} |
| BRD-2018 | Address Validation | Updated to Nordic scope | GAP-003 |

### Deferred to TO-BE Phase

| Gap ID | Reason for Deferral | TO-BE Action Item |
|--------|---------------------|-------------------|
| {ID} | {Reason} | {Action} |

### Marked as Intentional

| Gap ID | Why Intentional | Documentation Added |
|--------|-----------------|---------------------|
| {ID} | {Reason from stakeholder} | {Where documented} |

---

## Root Cause Analysis

### Why Gaps Occurred

| Root Cause | Count | Examples |
|------------|-------|----------|
| Requirements changed, docs not updated | {n} | {Examples} |
| Emergency fix, no time for docs | {n} | {Examples} |
| Tribal knowledge never written | {n} | {Examples} |
| Original docs lost/inaccessible | {n} | {Examples} |

### Process Improvement Recommendations

1. **{Recommendation}**
   - Problem: {What caused gaps}
   - Solution: {How to prevent}
   - Owner: {Who should implement}

2. **{Recommendation}**
   - Problem: {What caused gaps}
   - Solution: {How to prevent}
   - Owner: {Who should implement}

---

## Stakeholder Validation

### Sign-off Status

| Role | Name | Status | Date | Notes |
|------|------|--------|------|-------|
| Principal Engineer | {Name} | {Approved/Pending} | {Date} | {Notes} |
| Product Owner | {Name} | {Approved/Pending} | {Date} | {Notes} |
| DBA | {Name} | {Approved/Pending} | {Date} | {Notes} |
| Operations Engineer | {Name} | {Approved/Pending} | {Date} | {Notes} |

---

## Impact on AS-IS Documentation

### Arc42 Sections Updated

| Section | Updates Made | Gap IDs |
|---------|-------------|---------|
| 01 - Introduction & Goals | Added design intent | GAP-005, GAP-008 |
| 04 - Solution Strategy | Added rationale | GAP-012 |
| 08 - Crosscutting Concepts | Added tribal knowledge | GAP-015-020 |

### New Documents Created

| Document | Purpose | Gap IDs Addressed |
|----------|---------|-------------------|
| TRIBAL-KNOWLEDGE-CATALOG.md | Stakeholder knowledge | TK-* |
| {Document} | {Purpose} | {IDs} |

---

## Open Items

### Gaps Requiring Follow-up

| Gap ID | Issue | Owner | Due Date |
|--------|-------|-------|----------|
| {ID} | {Issue} | {Owner} | {Date} |

### Questions for Future Analysis

1. {Question that couldn't be answered}
2. {Question that couldn't be answered}

---

## Appendix

### Methodology

This gap analysis followed the BMAD (Brownfield Methodology for AI-Assisted
Development) process:

1. Step 01: Documentation inventory
2. Step 04: Code vs. docs comparison
3. Step 06: Stakeholder interviews for clarification
4. Step 07: Synthesis and resolution
5. Step 08: Quality validation
6. Step 09: Final reporting

### References

- Documentation Inventory: `artifacts/00-reconnaissance/DOCUMENTATION-INVENTORY.md`
- Gap Analysis: `artifacts/03-remediation/DOCUMENTATION-GAP-ANALYSIS.md`
- Interview Synthesis: `artifacts/05-analysis/INTERVIEW-SYNTHESIS.md`
- Tribal Knowledge: `artifacts/07-synthesis/TRIBAL-KNOWLEDGE.md`

---

*Report Version: 1.0*
*Analysis Date: {YYYY-MM-DD}*
*Generated by: {Agent/Human}*
