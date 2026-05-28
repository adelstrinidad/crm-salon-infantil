# Interview Synthesis Template

**Purpose**: Synthesize insights from all stakeholder interviews
**Output Location**: `artifacts/05-analysis/INTERVIEW-SYNTHESIS.md`
**Used In**: Step 06 (Human Review & Stakeholder Interviews)

---

## Interviews Conducted

| Role | Name | Date | Duration | Key Topics |
|------|------|------|----------|------------|
| Principal Engineer | {name} | {date} | {min} | Architecture, decisions |
| Product Owner | {name} | {date} | {min} | Requirements, priorities |
| DBA | {name} | {date} | {min} | Database, performance |
| Operations Engineer | {name} | {date} | {min} | Deployment, monitoring |

---

## Cross-Cutting Insights

### Confirmed Design Decisions

{Decisions that multiple stakeholders confirmed with consistent rationale}

1. **{Decision}**: Confirmed by {Stakeholder 1} and {Stakeholder 2}
   - Rationale: {Consistent explanation}
   - Still valid: {Yes/No/Partially}

### Conflicting Perspectives

{Where stakeholders had different views - note both perspectives}

| Topic | View 1 | Source | View 2 | Source | Resolution |
|-------|--------|--------|--------|--------|------------|
| {Topic} | {Perspective} | {Stakeholder} | {Perspective} | {Stakeholder} | {How to resolve} |

### Tribal Knowledge Documented

{Previously undocumented knowledge that needs to be written down}

| Knowledge Item | Description | Source | Impact |
|----------------|-------------|--------|--------|
| {Item} | {Description} | {Stakeholder} | {High/Med/Low} |

---

## Gap Resolutions

| Gap ID | Gap Type | Resolution | Source |
|--------|----------|------------|--------|
| GAP-001 | Documentation ahead | Feature cancelled in 2020 | Product Owner |
| GAP-002 | Reality ahead | Emergency fix, never documented | Principal Engineer |
| GAP-003 | Divergence | Requirements changed | Product Owner + Architect |

---

## Impact on AS-IS Documentation

### Must Update

1. {Section} in AS-IS docs needs correction based on {interview}
2. {Section} needs tribal knowledge added
3. {Section} has incorrect assumptions

### Must Clarify

1. {Ambiguous area} now understood as {clarification}
2. {Ambiguous area} now understood as {clarification}

---

## Modernization Implications

### Must Preserve (Non-Negotiable)

- {Feature/behavior} - Reason: {from stakeholder}
- {Feature/behavior} - Reason: {from stakeholder}

### Can Modernize (Opportunities)

- {Component} - Stakeholders agree it's problematic
- {Pattern} - Historical reason no longer applies

### Risks Identified

- {Risk} - Mentioned by {stakeholder}
- {Risk} - Mentioned by {stakeholder}

---

## Next Steps

- [ ] Update component analysis documents with interview insights
- [ ] Create tribal knowledge documentation
- [ ] Update gap analysis with resolutions
- [ ] Proceed to Step 07 synthesis

---

*Template Version: 1.0*
