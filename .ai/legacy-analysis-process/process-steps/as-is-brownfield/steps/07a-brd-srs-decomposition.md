# Step 07a: BRD to SRS Decomposition Guide

**Purpose**: Transform BRD user stories into screen-level SRS (Software Requirements Specification) documents

**When to Use**: After BRD is approved, before implementation planning

**Output**: One or more SRS documents per BRD user story (ITX-[MODULE]-[NNN] format)

---

## Overview

BRD documents capture **business requirements** at the user story level. SRS documents specify **screen-level functionality** with database mappings, validation rules, and UI behavior.

```
BRD User Story (business-level)
        │
        ▼
┌───────────────────────────────────┐
│     Screen Decomposition          │
│  - Identify screens in journey    │
│  - Map data entities per screen   │
│  - Apply split/keep criteria      │
└───────────────────────────────────┘
        │
        ▼
   SRS-001    SRS-002    SRS-003
  (Screen A) (Screen B) (Screen C)
```

---

## Document Hierarchy and Numbering

### Three-Level Document Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: BRD (Business Requirements Document)                       │
│ ─────────────────────────────────────────────────────────────────── │
│ Focus: WHAT the business needs (user stories, business rules)       │
│ Audience: Business stakeholders, Product Owner                      │
│                                                                     │
│ Contains:                                                           │
│   • BR-N    (Business Requirements) - high-level needs              │
│   • NFR-N   (Non-Functional Requirements) - performance, security   │
│   • Process diagrams, entity statuses, acceptance criteria          │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ LEVEL 2: Feature Specification (spec-template.md)                   │
│ ─────────────────────────────────────────────────────────────────── │
│ Focus: WHAT users need to do (user stories with acceptance criteria)│
│ Audience: Business analysts, developers, testers                    │
│                                                                     │
│ Contains:                                                           │
│   • User Stories (As a... I want... So that...)                     │
│   • FR-NNN  (Functional Requirements) - traceable to BR-N           │
│   • TC-NNN  (Test Cases) - acceptance scenarios                     │
│   • NFR-NNN (Feature-specific NFRs)                                 │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ LEVEL 3: SRS (Software Requirements Specification)                  │
│ ─────────────────────────────────────────────────────────────────── │
│ Focus: HOW the screen works (UI fields, database, validation)       │
│ Audience: Developers, UI designers, database engineers              │
│                                                                     │
│ Contains:                                                           │
│   • ITX-[MODULE]-[NNN] document code                                │
│   • Attributes (Field → Database column mapping)                    │
│   • VR##    (Validation Rules) - field-level validation             │
│   • Actions (numbered user actions with system behavior)            │
│   • Views, Modals (screen components)                               │
└─────────────────────────────────────────────────────────────────────┘
```

### Numbering Schemes by Document Type

| Document | ID Format | Example | Description |
|----------|-----------|---------|-------------|
| **BRD** | BR-N | BR-1, BR-2, BR-15 | Business Requirement (high-level need) |
| **BRD** | NFR-N | NFR-1, NFR-5 | Non-Functional Requirement |
| **BRD** | A-N | A-1, A-2 | Assumption |
| **Spec** | FR-NNN | FR-001, FR-105 | Functional Requirement (derived from BR) |
| **Spec** | TC-NNN | TC-001, TC-020 | Test Case / Acceptance Scenario |
| **SRS** | ITX-XXX-NNN | ITX-TPR-001 | Screen document code |
| **SRS** | VR## | VR01, VR15 | Validation Rule |

### Traceability Chain: Full Example

```
BRD (Business Level)
├── BR-1: "System must allow payment submission"
├── BR-2: "System must validate payment amount"
└── NFR-1: "Payment screen must load in < 2 seconds"
        │
        ▼
Feature Spec (User Story Level)
├── FR-001: System MUST allow users to submit payments {Source: BRD, ID: BR-1}
├── FR-002: System MUST validate amount > 0 {Source: BRD, ID: BR-2}
├── FR-003: System MUST display confirmation before submit {Source: AI}
└── TC-001: Given valid payment, when submitted, then status = Submitted
        │
        ▼
SRS ITX-TPR-002 (Screen Level)
├── Attribute: Amount → ACC_PAYMENT.AMOUNT (Number, >= 0)
├── VR01: Amount must be greater than 0 → "Amount must be positive"
├── VR02: Amount <= Available Balance → "Insufficient balance"
├── Action 1: Click "Submit" → Validate all fields, save to database
└── Traceability: VR01 → FR-002 → BR-2
```

### When to Use Each Document

| Scenario | Document | Reason |
|----------|----------|--------|
| Define business need | BRD (BR-N) | Stakeholder language, no tech details |
| Describe user journey | Feature Spec | User stories with acceptance criteria |
| Specify screen behavior | SRS (ITX-XXX-NNN) | Database mappings, validation rules |
| Define performance target | BRD (NFR-N) | Cross-cutting concern |
| Map field to database | SRS Attributes | Developer needs exact column names |
| Define error message | SRS (VR##) | User-facing validation behavior |

---

## Document Strategy for TAMS

### Template Types

**BRD Template (brd-template.md):**
- Business-level requirements in stakeholder language
- Process flows, entity status diagrams
- High-level needs (BR-N), assumptions (A-N)
- Non-functional requirements (NFR-N)

**Feature Spec Template (spec-template.md):**
- User journey focus (multiple screens)
- User stories with acceptance criteria
- Functional requirements (FR-NNN), test cases (TC-NNN)
- Bridges BRD and SRS

**SRS Template (srs-template.md):**
- Screen-level implementation details
- Database mappings (Field → TABLE.COLUMN)
- Validation rules (VR##) with error messages
- Actions, views, modal windows

### Spec vs SRS: Key Differences

| Aspect | Feature Spec | SRS |
|--------|--------------|-----|
| **Focus** | User journey (multiple screens) | Single screen behavior |
| **Level** | Feature-centric | Screen-centric |
| **Audience** | BA, testers, developers | Developers, UI designers |
| **Contains** | FR-NNN, TC-NNN, user stories | VR##, DB columns, actions |
| **Granularity** | "User can submit payment" | "Amount field → ACC_PAYMENT.AMOUNT" |

### Why Spec → SRS (not reverse)?

```
Feature Spec: "User can manage payments"
        │
        ├── SRS-001: Payment List Screen
        ├── SRS-002: Payment Form Screen
        └── SRS-003: Payment History Screen
```

**Spec is higher abstraction** - one feature = multiple screens.
Define WHAT first (Spec), then decompose into HOW (SRS per screen).

### When to Use Each Template

| Scenario | Use Spec Only | Use SRS Only | Use Both |
|----------|---------------|--------------|----------|
| Simple feature, 1-2 screens | ✓ | | |
| Screen-heavy legacy system (TAMS) | | ✓ | |
| Complex feature, multiple screens | | | ✓ |
| Customer requires ITX-XXX format | | ✓ | |
| Agile team, rapid iteration | ✓ | | |
| New greenfield development | ✓ | | ✓ |

### TAMS Document Strategy

**Recommended approach for TAMS**: Use **BRD → SRS** (skip Spec level)

**Rationale:**
- Legacy system is screen-centric
- Customer expects ITX document format (ITX-XXX-NNN)
- Database mappings are critical for migration
- Existing documentation follows SRS pattern
- One SRS per screen enables parallel development

**Document flow for TAMS:**
```
BRD (BR-N, NFR-N)
        │
        ▼ (skip Spec)
   ┌────┴────┐
   │         │
SRS-001   SRS-002   (per screen)
```

### Requirement Composition Guidelines

**From BRD to SRS:**
1. Each BR-N may spawn multiple SRS documents
2. Each SRS must trace back to at least one BR-N
3. Validation rules (VR##) derive from BRD acceptance criteria
4. NFR-N requirements apply across all related SRS documents

**Traceability requirements:**
- Every VR## must link to source BR-N or FR-NNN
- Every SRS must document covered acceptance criteria
- Cross-reference related SRS documents in same flow

**Composition rules:**
- One SRS per distinct screen
- Group wizard steps in single SRS (multiple Views)
- Include modals in parent screen SRS
- Split when permissions or data entities differ

---

## BRD Template Content (brd-template.md)

The BRD (Business Requirements Document) captures **business-level requirements** in stakeholder language.

**Template**: [brd-template.md](../../2_templates/brd-template.md)

### Key Sections

| Section | Content | Numbering |
|---------|---------|-----------|
| 8.1 Executive Summary | Business context, scope | - |
| 8.2 Process Description | Process flows, acceptance criteria | - |
| 8.3 Business Requirements | High-level needs | BR-N |
| 8.4 Non-Functional Requirements | Performance, security | NFR-N |
| 8.5 Assumptions | Project assumptions | A-N |
| 8.6 Entity Status Diagrams | State transitions | - |

### Section 8.3 - Business Requirements (BR-N format)

```markdown
**BR-1: [Requirement Title]**
[Detailed description of the business requirement]

**BR-2: [Requirement Title]**
[Detailed description of the business requirement]
```

### Section 8.2 - Process with Acceptance Criteria

```markdown
##### 8.2.2.1 [Sub-process: Application Submission]

**Process Steps:**
1. [Step description]
2. [Step description]

**Form Fields:**
| Field | Description |
|-------|-------------|
| [Field 1] | [Description] |

**Validation Rules:**
1. [Validation rule 1]
2. [Validation rule 2]
```

### Section 8.4 - Non-Functional Requirements (NFR-N format)

```markdown
**NFR-1: Performance**
- [Performance criterion 1]
- [Performance criterion 2]

**NFR-2: Security**
- [Security criterion 1]
```

---

## Feature Specification Template (spec-template.md)

The Feature Specification bridges BRD (business-level) and SRS (screen-level) by capturing **user stories with testable acceptance criteria**.

**Template**: [spec-template.md](../../2_templates/spec-template.md)

### Key Sections

| Section | Content | Numbering |
|---------|---------|-----------|
| 1. Primary User Story | As a... I want... So that... | - |
| 2. Details | Problem statement, clarifications | - |
| 3. Workflow | Business flow, test cases, edge cases | TC-NNN |
| 4. Requirements | Functional requirements | FR-NNN |
| 5. Deferred Decisions | Items for later phases | - |
| 6. Definition of Done | Acceptance criteria | - |
| 7. Solution Overview | High-level description | - |
| 8. Key Entities | Data model references | - |

### Section 4 - Functional Requirements (FR-NNN format)

```markdown
**FR-001**: System MUST [capability] {Source: [BRD], ID: [BR-N]}
**FR-002**: System MUST [capability] {Source: [BRD], ID: [BR-N]}
**FR-003**: Users MUST be able to [interaction] {Source: [AI]}
```

**Source Attribution**:
- `{Source: BRD, ID: BR-1}` - Derived from BRD requirement
- `{Source: AI}` - AI-generated requirement (needs validation)
- `{Source: UX Spec, ID: UC001}` - From UX specification

### Section 3 - Test Cases (TC-NNN format)

```markdown
**TC-001:** [Test case name] - Given [context], when [action]
    - then [expected result]
    - and [additional result]
    {Source: UX Spec, ID: UC001}
```

### Traceability in Spec

Each FR must trace back to source:
- **BRD requirements** (BR-N) → Feature Spec (FR-NNN)
- **Jira tickets** → FR-NNN with Jira ID
- **Confluence pages** → FR-NNN with link
- **Figma designs** → FR-NNN with design reference

---

## SRS Template Content (srs-template.md)

The SRS (Software Requirements Specification) captures **screen-level implementation details** for developers.

**Template**: [srs-template.md](../../2_templates/srs-template.md)

### Key Sections

| Section | Content | Numbering |
|---------|---------|-----------|
| Summary | 1-2 sentence functional description | - |
| Prototype | Figma/design link | - |
| Permissions | User roles with access | - |
| Starting Event | Navigation path (Menu → Screen) | - |
| Initial State | Pre-conditions, default view | - |
| Attributes | Field → Database mapping | - |
| Validation Rules | Field-level validation | VR## |
| Actions | User actions with system behavior | Numbered |
| Views | Multi-view screen components | View.N |
| Modal Windows | Popup dialogs | - |
| Traceability | SRS → BRD mapping | - |

### Attributes Section (Field → Database Mapping)

```markdown
| # | Field Name | Database | Format and Validation |
|---|------------|----------|----------------------|
| 1 | Document Date | ACC_PAYMENT.DOCUMENT_DATE | Date, YYYY-MM-DD, Required |
| 2 | Amount | ACC_PAYMENT.AMOUNT | Number(15,2), >= 0, Required |
```

### Validation Rules (VR## format)

```markdown
| Rule ID | Field(s) | Condition | Error Message |
|---------|----------|-----------|---------------|
| VR01 | Amount | Must be greater than 0 | "Amount must be a positive number" |
| VR02 | Document Date | Cannot be future date | "Document date cannot be in the future" |
```

### Actions Section

```markdown
| # | Action | Trigger | Behavior | Result |
|---|--------|---------|----------|--------|
| 1 | Save | Click "Save" button | Validates form, saves to database | Success message |
| 2 | Submit | Click "Submit" button | Validates, changes status | Navigates to confirmation |
```

---

## Requirement Decomposition Guide

### Decision Criteria: When to Split

**CREATE SEPARATE SRS when:**

| Condition | Example | Rationale |
|-----------|---------|-----------|
| **Different user roles/permissions** | Admin screen vs User screen | Different access control, different validation |
| **Different primary data entity** | Payment List vs Payment Details | Different database tables, different CRUD operations |
| **Screen can be developed independently** | Search screen vs Results screen | Enables parallel development, separate testing |
| **Distinct validation rules** | Input form vs Confirmation | Different error handling, different user flows |
| **Different starting events** | Menu item A vs Menu item B | Different navigation paths, different context |
| **Different workflows** | Create flow vs Edit flow | Different state management, different actions |

**KEEP SINGLE SRS when:**

| Condition | Example | Rationale |
|-----------|---------|-----------|
| **Screens share same data flow** | Wizard steps 1→2→3 | Tightly coupled, shared state |
| **Modal dialogs within same context** | Edit popup on list screen | Modal is part of parent screen |
| **Simple parent-child relationship** | Master-detail in same view | Single page, synchronized data |
| **Same permissions and validation** | Tabs on same screen | Same user context |

---

## Decomposition Workflow

### Step 1: BRD User Story Analysis

**Input**: BRD user story (e.g., FR-1xxx)

**Actions**:
1. Identify all screens in the user journey
2. List user interactions per screen
3. Map data entities per screen
4. Identify user roles involved

**Example**:

```
BRD User Story: "As a finance officer, I want to submit payments
so that vendors are paid on time"

Screens Identified:
1. Payment List - View existing payments, filter, search
2. Payment Form - Create/edit payment details
3. Payment Confirmation - Review and submit
4. Payment History - View submitted payments (separate flow)
```

### Step 2: Screen Boundary Detection

For each identified screen, apply the decision criteria:

```
Screen: Payment List
├── Different permissions from Form? → Yes (View vs Edit) → SPLIT
├── Different primary entity? → Same (ACC_PAYMENT) but list vs single
├── Independent development? → Yes → SPLIT
└── Decision: SEPARATE SRS (ITX-TPR-001)

Screen: Payment Form
├── Different permissions from List? → Yes (Edit) → SPLIT
├── Different primary entity? → Same but different operations
├── Independent development? → Yes → SPLIT
└── Decision: SEPARATE SRS (ITX-TPR-002)

Screen: Payment Confirmation
├── Part of Form workflow? → Yes (wizard step)
├── Same data context? → Yes
├── Can be developed independently? → No (depends on Form)
└── Decision: INCLUDE IN ITX-TPR-002 as View.2
```

### Step 3: SRS Document Creation

**Naming Convention**: `ITX-[MODULE]-[NNN].[VERSION]`

| Component | Format | Example |
|-----------|--------|---------|
| Prefix | ITX | ITX (for IT eXchange) |
| Module | 3-letter code | TPR (Tax Payment Return) |
| Number | 3 digits | 001, 002, 003 |
| Version | N.N | 1.0, 1.1, 2.0 |

**Full example**: `ITX-TPR-002.1` = Tax Payment Return module, screen 2, version 1

### Step 4: Traceability Setup

Each SRS must link back to BRD:

```markdown
## Traceability

| SRS Requirement | BRD Source |
|-----------------|------------|
| VR01 (Amount > 0) | FR-1001 |
| Action: Submit | FR-1002 |
| Permission: Finance Officer | FR-1003 |
```

---

## Example: Complete Decomposition

### Input: BRD User Story

**FR-1050**: "As a finance officer, I want to submit payments to vendors so that invoices are settled on time."

**Acceptance Criteria** (from BRD):
- AC-1: User can view list of pending payments
- AC-2: User can filter by vendor, date, amount
- AC-3: User can create new payment record
- AC-4: User can edit draft payment
- AC-5: User can submit payment for approval
- AC-6: System validates payment before submission

### Analysis

| Screen | Primary Entity | Permissions | Actions | SRS Doc |
|--------|---------------|-------------|---------|---------|
| Payment List | ACC_PAYMENT (list) | View, Filter | Search, Filter, Select | ITX-TPR-001 |
| Payment Form | ACC_PAYMENT (single) | Create, Edit | Save, Validate | ITX-TPR-002 |
| Payment Confirmation | ACC_PAYMENT (review) | Submit | Review, Submit, Cancel | ITX-TPR-002 (View.2) |

### Output: SRS Documents

**ITX-TPR-001**: Payment List Screen
- Covers: AC-1, AC-2
- Attributes: List columns with database mappings
- Actions: Search, Filter, New, Edit, View

**ITX-TPR-002**: Payment Form Screen
- Covers: AC-3, AC-4, AC-5, AC-6
- View.1: Payment Form (Create/Edit)
- View.2: Payment Confirmation (Review/Submit)
- Validation Rules: VR01-VR10
- Actions: Save, Validate, Submit, Cancel

---

## Cross-Referencing SRS Documents

When multiple SRS documents are part of the same user flow, add cross-references:

```markdown
## Related SRS Documents

| Document Code | Screen Name | Relationship |
|---------------|-------------|--------------|
| ITX-TPR-001 | Payment List | Parent (navigates to this screen) |
| ITX-TPR-003 | Payment History | Related (shows submitted payments) |
```

---

## Template Reference

Use the SRS template: [srs-template.md](../../2_templates/srs-template.md)

The template includes:
- Version Control
- Summary
- Prototype link
- Permissions
- Starting Event
- Initial State
- Attributes (database mapping)
- Validation Rules (VR##)
- Actions
- Views (for multi-view screens)
- Modal Windows
- Traceability

---

## Quality Checklist

Before finalizing SRS decomposition:

- [ ] All BRD acceptance criteria mapped to at least one SRS
- [ ] Each SRS has clear screen boundaries
- [ ] Database columns mapped for all attributes
- [ ] Validation rules documented with error messages
- [ ] Permissions defined for each screen
- [ ] Navigation paths documented (Starting Event)
- [ ] Cross-references added between related SRS documents
- [ ] Traceability complete (SRS → BRD)

---

## See Also

- [07-requirements-synthesis.md](07-requirements-synthesis.md) - Requirements extraction from legacy code
- [srs-template.md](../../2_templates/srs-template.md) - SRS document template
- [brd-template.md](../../2_templates/brd-template.md) - BRD document template

---

*Document Version: 1.0*
*Last Updated: 2026-01-23*
