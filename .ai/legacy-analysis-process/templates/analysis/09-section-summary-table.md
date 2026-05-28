# Arc42 Section Summary Table Template

**Purpose**: Single-page executive overview of all Arc42 sections with status indicators for quick assessment.

**Usage**:
1. Copy this template to `work/09-summaries/SECTION-SUMMARY-TABLE.md`
2. Fill in project-specific findings from your analysis
3. The compile script will merge this into the combined architecture document

**Reference**: See Section 9.2a of `process-steps/as-is-brownfield/steps/09-summary-documentation.md` for detailed guidance.

---

## Key Findings

| # | Section | Key Finding | Status |
|---|---------|-------------|--------|
| 01 | Business Vision & Goals | **{One sentence on critical business/technical concern}** | 🟥 |
| 02 | Constraints | **{One sentence on blocking constraints}** | 🟥 |
| 03 | Context & Scope | {Integration points and external system dependencies} | |
| 04 | Solution Strategy | **{Architecture pattern issues or concerns}** | 🟥 |
| 05 | Building Block View | **{Component structure complexity or fragmentation}** | 🟥 |
| 06 | Runtime View | **{Performance, batch processing, or timing concerns}** | 🟨 |
| 07 | Deployment View | {Infrastructure and deployment architecture} | |
| 08 | Crosscutting Concepts | **{Data model, security, or cross-cutting concerns}** | 🟨 |
| 09 | Architecture Decisions | {ADR status and documentation maturity} | |
| 10 | Quality Requirements | {Key quality metrics and targets} | |
| 11 | Risks & Technical Debt | **{Critical risks affecting modernization}** | 🟥 |
| 12 | Glossary | {Domain terminology coverage} | |
| 13 | Documentation Gaps | **{Undocumented knowledge or code-doc divergence}** | 🟥 |

**Legend**: 🟥 = Critical issue requiring attention | 🟨 = Warning/Concern

---

## Status Criteria

### 🟥 Critical (Red)
Use for issues that:
- Block modernization or migration
- Pose security vulnerabilities or EOL dependencies
- Risk data integrity or system stability
- Indicate <20% test coverage on critical paths
- Embed business logic in hard-to-migrate locations (e.g., database)

### 🟨 Warning (Yellow)
Use for concerns that:
- Affect performance under load
- Increase maintenance complexity
- Represent moderate technical debt
- Require significant effort to modernize

### No Status (Blank)
Use for sections that:
- Have standard infrastructure without issues
- Contain minor technical debt with low business impact
- Are adequately documented

---

## Inclusion Guidelines

| Requirement | Value |
|-------------|-------|
| **Row Count** | Variable: 5-14 rows (quality over completeness) |
| **Inclusion Criteria** | Only sections with high-impact findings |
| **Focus Areas** | Issues affecting: UX, integration, operation, performance, security |
| **Exclusion** | Minor issues with no major business/technical impact |

**Tip**: Remove rows for sections with no significant findings. The table should highlight problems, not provide completeness.

---

## Placement

This table should appear in:
1. **Executive Summary** - After the "Key Findings" section header
2. **Arc42 Section 01** - As the first section after the header comment

The `compile_architecture_doc.py` script automatically injects this table into Section 01.

---

*Template Version: 1.0*
*Last Updated: 2026-01-21*
