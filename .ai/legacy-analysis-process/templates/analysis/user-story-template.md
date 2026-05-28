# User Story Template

> **Meeting Recommendation (2026-01-08)**: User stories should be TECHNOLOGY-AGNOSTIC and describe WHAT users need, not HOW it's implemented. This enables direct handoff to implementation phase.
> "We are not copying the legacy system. We are creating a better system that fulfills the same user need." - Juha Parnanen

**Usage**: Use this template when generating user stories from requirements.
**Key Principle**: Focus on USER NEEDS, not technical implementation details.

---

## Template

```markdown
# User Story: {US-ID} - {Title}

**As a** {role - who is the user?},
**I want to** {capability - what do they need to do?},
**So that** {value - why is this important to them?}.

---

## Business Context

**Why This Exists**:
{Describe the business reason for this functionality. What problem does it solve?}

**User Impact**:
{What happens if this functionality is unavailable?}

**Related Business Rules**:
- BR-{XXX}: {Brief description}
- BR-{XXX}: {Brief description}

---

## Acceptance Criteria

> Focus on BEHAVIOR, not implementation. Avoid specifying UI elements, databases, or technical details.

### Scenario 1: {Happy Path Title}

- **Given** {initial context/state}
- **When** {user action or trigger}
- **Then** {expected outcome/behavior}

### Scenario 2: {Alternative/Edge Case Title}

- **Given** {context}
- **When** {action}
- **Then** {outcome}

### Scenario 3: {Error/Failure Case Title}

- **Given** {context}
- **When** {invalid action or failure condition}
- **Then** {appropriate error handling behavior}

---

## Constraints (Non-Negotiable)

> These are "unchangeable" business rules that MUST be preserved in any implementation.

| Constraint | Description | Source |
|------------|-------------|--------|
| {Rule} | {What must always be true} | {BR-XXX or regulation} |

---

## Out of Scope

> Explicitly state what is NOT part of this story to prevent scope creep.

- {Feature/behavior that might be assumed but is NOT included}
- {Related functionality that belongs in a different story}

---

## Traceability

| Attribute | Value |
|-----------|-------|
| **Source Requirement** | {FR-XXX} |
| **Business Rules** | {BR-XXX, BR-XXX} |
| **Legacy Implementation** | {File:line - for reference only, NOT a constraint} |
| **Priority** | {Must/Should/Could/Won't} |
| **Complexity Estimate** | {XS/S/M/L/XL} |

---

## Definition of Done

- [ ] Acceptance criteria met (all scenarios pass)
- [ ] Business rules validated (constraints preserved)
- [ ] Edge cases handled
- [ ] Performance acceptable
- [ ] Accessibility requirements met (if applicable)

---

## Notes for Implementation

> Optional section for implementation team. These are SUGGESTIONS, not requirements.

**Possible Approaches**:
- {Suggestion 1}
- {Suggestion 2}

**Known Legacy Issues to Avoid**:
- {Anti-pattern or problem from legacy system to NOT replicate}
```

---

## Anti-Patterns to Avoid

When writing user stories, DO NOT:

| Anti-Pattern | Example | Problem |
|--------------|---------|---------|
| Specify UI elements | "User clicks the blue button" | Constrains design unnecessarily |
| Specify database | "Data is stored in Oracle" | Technology choice, not user need |
| Copy legacy exactly | "Page must look identical to legacy" | Prevents improvement |
| Technical jargon | "System performs ACID transaction" | Not user language |
| Implementation details | "System calls {EXTERNAL_SYSTEM_1} API" | HOW, not WHAT |

## Good vs. Bad Examples

### Bad (Technology-Specific)

```
As an administrator,
I want to click the "Import" button on the Admin.aspx page,
So that I can trigger the {EXTERNAL_SYSTEM_1} SOAP import stored procedure.
```

### Good (Technology-Agnostic)

```
As an administrator,
I want to import address data from the national registry,
So that the address database stays current with official records.
```

---

## Relationship to Implementation Phase

This user story format is designed to feed directly into the implementation phase:

```
Legacy Analysis → User Stories → Implementation (Spec Kit / Claude)
                      ↓
              Technology-agnostic
              Business-focused
              Testable criteria
```

**Cross-Reference**:
- Related Template: `templates/analysis/business-rules-template.md` (unchangeable rules)
- Process Step: `process/as-is-brownfield/steps/07-requirements-synthesis.md`
- Output Location: `artifacts/07-synthesis/requirements/USER-STORIES.md`

---

*Template Version: 2.0*
*Updated: 2026-01-08 based on meeting recommendations*
