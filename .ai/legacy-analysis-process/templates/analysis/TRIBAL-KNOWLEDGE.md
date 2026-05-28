# Tribal Knowledge Documentation Template

**Purpose**: Capture implicit business rules and operational knowledge from stakeholders
**Output Location**: `artifacts/07-synthesis/TRIBAL-KNOWLEDGE.md`
**Used In**: Step 07 (Requirements & Intent Synthesis)

---

## Overview

This document captures implicit business rules, operational knowledge, and
contextual information that exists only in stakeholder minds - not in code
or documentation.

**Source**: Step 06 stakeholder interviews

---

## Business Rules (Implicit)

### Rule: {Rule Name}

**Description**: {What the rule is}

**Source**: {Stakeholder} interview
**In Code?**: {Yes/No} - {If yes, location}
**In Docs?**: {Yes/No} - {If yes, location}
**Critical?**: {Yes/No} - {Why}

**Rationale**:
{Why this rule exists}

**Must Preserve in Modernization**: {Yes/No}

---

### Rule: Weekend Batch Processing (Example)

**Description**: {EXTERNAL_SYSTEM_1} imports are always scheduled for weekends to minimize
impact on search performance.

**Source**: Operations Engineer interview
**In Code?**: No (external scheduler)
**In Docs?**: No
**Critical?**: Yes - affects deployment windows

**Rationale**:
During import, database locks affect search performance. Weekend traffic is
10% of weekday, so users less impacted.

**Must Preserve in Modernization**: Yes

---

## Historical Context

### Context: {Topic}

**Current State**: {What exists now}

**History** (from {Stakeholder}):
- {Timeline point 1}
- {Timeline point 2}
- {Timeline point 3}

**Why Not Changed**:
"{Quote from stakeholder}"

**Implication for Modernization**:
{What this means for future changes}

---

### Context: WSE 3.0 Dependency (Example)

**Current State**: Legacy SOAP services still reference WSE 3.0

**History** (from Principal Engineer):
- Original system built 2015-2016 when WSE 3.0 was standard
- Migration to WCF planned for 2018 but deprioritized
- Now deprecated but removing it requires rewriting 3 SOAP clients
- Estimated effort: 2-3 weeks (last assessed 2022)

**Why Not Removed**:
"Works fine, no security holes in our use case, other priorities always
higher" - Principal Engineer

**Implication for Modernization**:
Can be removed in TO-BE but not urgent unless modernizing SOAP services anyway.

---

## Operational Knowledge

### {Topic}

**Insight** (from {Stakeholder}):
{Description of operational knowledge}

**Not Documented**: {What's missing from docs}

**Monitoring**: {Current monitoring state}

---

### Peak Load Periods (Example)

**Insight** (from Operations Engineer):
- Normal: 50-100 requests/minute
- Peak: 500-800 requests/minute
- Peak Times:
  - Mondays 9-11 AM (start of week queries)
  - Last week of month (report generation)
  - After {EXTERNAL_SYSTEM_1} address standard updates (2x/year)

**Not Documented**: Performance testing was done at 100 RPS, below actual
peak. System copes but response times degrade to 2-5 seconds.

**Monitoring**: Basic logging exists but no alerts on degradation.

---

## Edge Cases Handled (Undocumented)

### Edge Case: {Name}

**Handling** (from code + {stakeholder} interview):
```
{Code snippet or description}
```

**Not in Specs**: {What documentation says or doesn't say}

**Rationale**:
{Why this edge case handling exists}

---

## Stakeholder Contacts for Future Reference

| Name | Role | Expertise Areas | Best For |
|------|------|-----------------|----------|
| {Name} | {Role} | {Areas} | {What questions to ask them} |

---

*Template Version: 1.0*
