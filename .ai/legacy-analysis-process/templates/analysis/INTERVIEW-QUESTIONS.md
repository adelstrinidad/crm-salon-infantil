# Stakeholder Interview Questions Template

**Purpose**: Generate interview questions from gap analysis findings
**Output Location**: `artifacts/05-analysis/INTERVIEW-QUESTIONS.md`
**Used In**: Step 06 (Human Review & Stakeholder Interviews)

---

## For Principal Engineer: {Name}

### Architecture Decisions

1. **EAV Pattern Usage**: Documentation says it was chosen for "flexibility."
   Can you explain what specific flexibility was needed? Would you make the
   same choice today?

2. **Oracle vs. PostgreSQL**: Decision doc says "existing license." Were there
   technical reasons beyond cost?

### Undocumented Features

1. **Nordic Postal Code Validation**: Code validates all Nordic countries but
   docs say "Finnish only." When did this expand and why?

### Technical Debt

1. **Complex SQL Procedures**: Several 500+ line procedures. Are these
   performance optimizations or legacy from migration? Can they be simplified?

### Known Issues

1. **WSE 3.0 Dependency**: Is this still in use? What would it take to remove?

---

## For Product Owner: {Name}

### Requirements Evolution

1. **Address Validation Rules**: How have validation requirements changed
   over time? Are current rules in code aligned with business needs?

### Missing Features

1. **Batch Import Rollback**: Documented in Jira {PROJECT}-789 but not implemented.
   Still needed?

### Priority Clarification

1. **Performance vs. Flexibility**: EAV pattern gives flexibility but hurts
   performance. What's more important to users?

---

## For Database Administrator: {Name}

### Database Design

1. **EAV Performance**: Are the performance issues documented in monitoring
   actual production problems or just theoretical?

### Workarounds

1. **Materialized Views**: Code shows several complex queries. Could MVs help?

### Data Volume

1. **Scaling Concerns**: How much has data volume grown? What's the 5-year
   projection?

---

## For Operations Engineer: {Name}

### Operational Patterns

1. **Peak Load Times**: When does the system experience highest load?

### Deployment

1. **Deployment Windows**: What constraints affect when we can deploy changes?

### Monitoring

1. **Current Alerts**: What monitoring is in place? What's missing?

---

## Gap-Driven Questions

*Generate specific questions from `artifacts/03-remediation/DOCUMENTATION-GAP-ANALYSIS.md`*

| Gap ID | Gap Description | Question | Target Stakeholder |
|--------|-----------------|----------|-------------------|
| GAP-001 | {Description} | {Question} | {Role} |
| GAP-002 | {Description} | {Question} | {Role} |

---

*Template Version: 1.0*
