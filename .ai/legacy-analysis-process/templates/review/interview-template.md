# Stakeholder Interview Template

> **Meeting Recommendation (2026-01-08)**: Human interviews are critical because AI commonly misses context-dependent patterns.
> Example: AI flagged EAV pattern as anti-pattern, but stakeholder context revealed it was a deliberate trade-off for flexibility.

**Usage**: Use this template during Step 06 (Stakeholder Interviews) to capture knowledge that code analysis alone cannot reveal.
**Key Principle**: Focus on WHY decisions were made, not just WHAT exists in the code.

---

## Template

```markdown
# Stakeholder Interview: {INTERVIEWEE_NAME}

**Date**: {DATE}
**Time**: {START_TIME} - {END_TIME}
**Interviewer**: {INTERVIEWER_NAME}
**Role**: {INTERVIEWEE_ROLE}
**Experience with System**: {YEARS} years

---

## 1. Pre-Interview Preparation

### 1.1 AI Analysis Findings to Validate

> List findings from AI analysis (Step 05) that need human validation.

| Finding ID | AI Assessment | Validation Needed |
|------------|---------------|-------------------|
| {SA-XX-XXX} | {AI's conclusion} | {Question to ask} |

### 1.2 Patterns AI May Have Misinterpreted

> Based on common AI blind spots, prepare questions for these areas.

| Pattern | AI Might See | Reality Might Be |
|---------|--------------|------------------|
| EAV tables | "Anti-pattern, poor design" | Deliberate flexibility trade-off |
| Large stored procedures | "Code smell, needs refactoring" | Oracle optimizer requirement |
| Duplicate validation | "DRY violation" | Integration boundary requirement |
| Complex SQL | "Technical debt" | Performance optimization |
| Legacy frameworks | "Outdated, replace" | Working fine, low risk |

### 1.3 Questions Prepared

> Customize these based on the interviewee's role.

**For Technical Leads / Architects**:
1. Why was {technology/pattern} chosen originally?
2. What constraints influenced the architecture decisions?
3. If you could redesign today, what would you change?
4. What patterns might look bad but are intentional?

**For Operations / DBAs**:
1. What are the actual performance characteristics?
2. What maintenance issues occur regularly?
3. What would break if we changed {component}?
4. What's not documented that you rely on?

**For Business Owners / Product Managers**:
1. What business rules are absolutely unchangeable?
2. What functionality is rarely used but critical?
3. What's the impact if this system is unavailable?
4. What features do users complain about most?

---

## 2. Interview Notes

### 2.1 Opening Context

**System history (from interviewee perspective)**:
{Notes on how they've worked with the system}

**Their primary responsibilities**:
{What they do with/for this system}

---

### 2.2 Architecture & Design Decisions

#### Question: Why was {pattern/technology} chosen?

**Response**:
{Verbatim or summarized response}

**Key Insight**:
{What this reveals about design intent}

**Validation of AI Finding**:
- [ ] AI assessment was correct
- [ ] AI assessment was partially correct
- [ ] AI assessment needs revision
- [ ] New context changes understanding

---

#### Question: What constraints influenced architecture?

**Response**:
{Verbatim or summarized response}

**Original Constraints**:
- {Constraint 1}
- {Constraint 2}

**Constraints Still Valid?**:
- {Yes/No and explanation}

---

### 2.3 Business Rules & "Unchangeables"

> **Critical**: Capture rules that MUST be preserved in any modernization.

#### Question: What business rules are absolutely unchangeable?

**Response**:
{Verbatim or summarized response}

**Identified Unchangeable Rules**:

| Rule | Source | Why Unchangeable |
|------|--------|------------------|
| {Rule description} | {Law/Contract/Business} | {Explanation} |

---

### 2.4 Tribal Knowledge

> Capture implicit knowledge that exists only in people's minds.

#### Question: What's not documented that you rely on?

**Response**:
{Verbatim or summarized response}

**Undocumented Knowledge Captured**:

| Knowledge | Type | Impact if Lost | Now Documented In |
|-----------|------|----------------|-------------------|
| {Description} | {Operational/Technical/Business} | {Impact} | {Document reference} |

---

### 2.5 Pain Points & Improvement Opportunities

#### Question: What are the biggest pain points?

**Response**:
{Verbatim or summarized response}

**Prioritized Pain Points**:

| Pain Point | Severity | Frequency | Root Cause |
|------------|----------|-----------|------------|
| {Description} | {High/Medium/Low} | {Daily/Weekly/etc} | {Cause} |

---

### 2.6 Integration & Dependency Insights

#### Question: What external systems is this dependent on?

**Response**:
{Verbatim or summarized response}

**Integration Insights**:

| System | Relationship | Known Issues | Contact |
|--------|--------------|--------------|---------|
| {System} | {We depend on / Depends on us} | {Issues} | {Who to ask} |

---

### 2.7 Modernization Concerns

#### Question: What concerns do you have about modernization?

**Response**:
{Verbatim or summarized response}

**Key Concerns**:

| Concern | Risk Level | Mitigation Idea |
|---------|------------|-----------------|
| {Description} | {High/Medium/Low} | {Possible mitigation} |

---

## 3. Post-Interview Actions

### 3.1 AI Analysis Corrections

| Original Finding | Correction | Source |
|------------------|------------|--------|
| {SA-XX finding} | {What to change} | {This interview} |

### 3.2 New Information to Document

| Information | Document to Update | Priority |
|-------------|--------------------|----------|
| {What was learned} | {Where to add it} | {High/Medium/Low} |

### 3.3 Follow-Up Questions

| Question | Who to Ask | Priority |
|----------|------------|----------|
| {Question} | {Person/Role} | {High/Medium/Low} |

---

## 4. Interview Summary

### Key Takeaways

1. {Most important insight}
2. {Second most important insight}
3. {Third most important insight}

### Business Rules Identified

| Rule ID | Description | Validation Status |
|---------|-------------|-------------------|
| BR-XXX | {Description} | {Confirmed/Needs Review} |

### Technical Debt Validated

| Debt Item | AI Assessment | Stakeholder View | Action |
|-----------|---------------|------------------|--------|
| {Item} | {AI view} | {Stakeholder view} | {Keep/Revise assessment} |

### Tribal Knowledge Captured

| Knowledge | Previously | Now |
|-----------|------------|-----|
| {Item} | Undocumented | Documented in {location} |

---

*Interview completed: {DATE}*
*Notes transcribed by: {NAME}*
*Validation status: {Draft | Reviewed | Approved}*
```

---

## Interview Best Practices

### Patterns AI Commonly Misses

Based on meeting discussion (2026-01-08), watch for these patterns:

| AI Flags As | May Actually Be | How to Detect |
|-------------|-----------------|---------------|
| **Anti-pattern** | Deliberate trade-off | Ask: "Why was this designed this way?" |
| **Technical debt** | Working solution | Ask: "What would break if we changed this?" |
| **Outdated code** | Stable, low-risk | Ask: "When did this last cause problems?" |
| **Over-engineering** | Regulatory requirement | Ask: "Is there a law/contract requiring this?" |
| **Dead code** | Rarely-used critical path | Ask: "When is this actually used?" |

### Questions to Always Ask

1. **Why?** - "Why was it designed this way?"
2. **What if?** - "What would happen if we changed this?"
3. **When?** - "When did this decision get made, and is the context still valid?"
4. **Who?** - "Who else should we talk to about this?"
5. **What's missing?** - "What's not in the documentation that I should know?"

### Red Flags That Require Human Validation

- AI finds "anti-pattern" in code that's been stable for years
- AI recommends removing "unused" code that handles edge cases
- AI flags performance optimizations as "complex code"
- AI suggests modernizing working integrations
- AI identifies "technical debt" that has no business impact

---

## Cross-References

- **Process Step**: `process/as-is-brownfield/steps/06-stakeholder-interviews.md`
- **Output Location**: `artifacts/06-review/stakeholder-interviews/`
- **Related Template**: `templates/analysis/business-rules-template.md`
- **Gate Definition**: `process/as-is-brownfield/steps/gates/GATE-STAKEHOLDER-REVIEW.md`

---

*Template Version: 1.0*
*Created: 2026-01-08 based on meeting recommendations*
