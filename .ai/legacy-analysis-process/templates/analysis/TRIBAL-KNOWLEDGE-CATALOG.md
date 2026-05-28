# Tribal Knowledge Catalog Template

**Purpose**: Final catalog of all tribal knowledge captured during analysis
**Output Location**: `artifacts/09-summaries/TRIBAL-KNOWLEDGE-CATALOG.md`
**Used In**: Step 09 (Accurate AS-IS Summary Documentation)

---

## Executive Summary

This catalog documents previously undocumented knowledge captured through
stakeholder interviews during the legacy analysis process. This knowledge
is critical for accurate system understanding and successful modernization.

**Total Items Cataloged**: {n}
**Business Rules**: {n}
**Operational Knowledge**: {n}
**Historical Context**: {n}
**Edge Cases**: {n}

---

## Business Rules

### Critical Business Rules

| ID | Rule | Description | Source | Must Preserve |
|----|------|-------------|--------|---------------|
| TK-BR-001 | {Name} | {Description} | {Stakeholder} | Yes |
| TK-BR-002 | {Name} | {Description} | {Stakeholder} | Yes |

### Non-Critical Business Rules

| ID | Rule | Description | Source | Notes |
|----|------|-------------|--------|-------|
| TK-BR-010 | {Name} | {Description} | {Stakeholder} | {Notes} |

---

## Operational Knowledge

### Deployment & Scheduling

| ID | Knowledge | Impact | Source |
|----|-----------|--------|--------|
| TK-OP-001 | Weekend batch processing | Affects deployment windows | Ops Engineer |
| TK-OP-002 | {Knowledge} | {Impact} | {Source} |

### Performance Patterns

| ID | Pattern | When | Impact | Source |
|----|---------|------|--------|--------|
| TK-OP-010 | Peak load Mondays 9-11 AM | Weekly | Response time degradation | Ops Engineer |

### Monitoring & Alerting

| ID | Knowledge | Current State | Gap | Source |
|----|-----------|---------------|-----|--------|
| TK-OP-020 | {Knowledge} | {State} | {Gap} | {Source} |

---

## Historical Context

### Design Decisions

| ID | Decision | Original Rationale | Current Status | Source |
|----|----------|-------------------|----------------|--------|
| TK-HC-001 | EAV pattern | Flexibility for changing standards | Now tech debt | Principal Eng |
| TK-HC-002 | Oracle database | Existing license | Still valid | Principal Eng |

### Technical Debt Origins

| ID | Debt Item | How It Started | Why Not Fixed | Source |
|----|-----------|----------------|---------------|--------|
| TK-HC-010 | WSE 3.0 dependency | Original implementation 2015 | Lower priority | Principal Eng |

---

## Edge Cases

### Documented in Code Only

| ID | Edge Case | Location | Handling | Source |
|----|-----------|----------|----------|--------|
| TK-EC-001 | Duplicate {EXTERNAL_SYSTEM_1} records | DeduplicationService.cs:78 | Take newer timestamp | DBA |

### Known But Undocumented

| ID | Edge Case | Frequency | Handling | Source |
|----|-----------|-----------|----------|--------|
| TK-EC-010 | {Edge case} | {How often} | {What happens} | {Source} |

---

## Integration Knowledge

### External System Behavior

| ID | System | Knowledge | Impact | Source |
|----|--------|-----------|--------|--------|
| TK-INT-001 | {EXTERNAL_SYSTEM_1} | Sends duplicates ~0.1% of imports | Need deduplication | DBA |
| TK-INT-002 | {EXTERNAL_SYSTEM_2} | 60s sync tolerance | NFR definition | Principal Eng |

---

## Knowledge Sources

### Stakeholder Index

| Name | Role | Expertise Areas | Interview Date |
|------|------|-----------------|----------------|
| {Name} | Principal Engineer | Architecture, tech decisions | {Date} |
| {Name} | Product Owner | Business requirements | {Date} |
| {Name} | DBA | Database, performance | {Date} |
| {Name} | Operations Engineer | Deployment, monitoring | {Date} |

---

## Preservation Requirements

### Must Preserve in Modernization

| ID | Knowledge Item | Why Critical | Validation Method |
|----|----------------|--------------|-------------------|
| {ID} | {Item} | {Reason} | {How to verify preserved} |

### Can Be Changed

| ID | Knowledge Item | Change Opportunity | Stakeholder Approval |
|----|----------------|-------------------|---------------------|
| {ID} | {Item} | {Opportunity} | {Who approved} |

---

## Next Steps

- [ ] Include in Arc42 AS-IS documentation
- [ ] Share with modernization team
- [ ] Schedule follow-up reviews with stakeholders
- [ ] Create knowledge transfer sessions for new team members

---

*Template Version: 1.0*
*Analysis Date: {YYYY-MM-DD}*
