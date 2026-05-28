# Step 05: Use Case and Enabler Specifications

**Objective**: Define detailed use cases referencing UI components from design system

---

## Inputs

- `arch-to-be/brd/AR-BRD.md` (from Step 03)
- `arch-to-be/design/UI-STYLE-GUIDE.md` (from Step 04)
- `arch-to-be/design/COMPONENT-PATTERNS.md` (from Step 04)
- `arch-to-be/design/NAVIGATION-STRUCTURE.md` (from Step 04)
- `arch-to-be/design/mockups/screenshots/` (from Step 04)
- `artifacts/07-synthesis/requirements/AR-USER-STORIES.md`

---

## Template

`.ai/2_templates/UC-00-template.md`

---

## Activities

### 1. Identify Use Cases

Map BRD requirements to use cases:
- Define actors and scenarios
- Document preconditions and postconditions
- Create use case diagrams
- **Reference screens from UI Design mockups**

### 2. Define Technical Enablers

Cross-cutting technical capabilities:
- Authentication and authorization (UC-AUTH)
- API gateway (UC-GATEWAY)
- Data sync mechanisms (UC-SYNC)
- Audit logging (UC-AUDIT)
- Caching (UC-CACHE)
- Search and indexing (UC-SEARCH)

### 3. Document Use Case Flows with UI References

Each use case MUST reference specific UI components from the design system.

**Example Main Flow**:

```markdown
### Main Flow

1. User navigates to **Search Screen** (`mockups/03-search-desktop.png`)
2. User enters query in **SearchInput** component (see COMPONENT-PATTERNS.md)
3. User clicks **PrimaryButton** "Search"
4. System displays **LoadingSpinner** while fetching
5. System populates **DataTable** with results (columns: Address, City, Postal Code)
6. User clicks table row to navigate to **Details Screen**
```

### 4. Identify New Screens Needed

For each use case, identify screens that are NOT in the main mockups:

| Screen | Exists in Design? | Action |
|--------|-------------------|--------|
| Search | Yes (`03-search-desktop.png`) | Use existing |
| Search Results | Yes (part of Search) | Use existing |
| Address Detail | **NO** | Flag for Step 06 |
| Edit Address Modal | **NO** | Flag for Step 06 |
| Confirmation Dialog | **NO** | Flag for Step 06 |

**Important**: Do NOT create these screens here. Flag them for creation in Step 06 (Specifications).

### 5. Document Acceptance Criteria

Use Given-When-Then format referencing UI components:

```gherkin
Feature: Address Search
  Scenario: User searches for an address
    Given the user is on the Search Screen
    And the SearchInput is empty
    When the user enters "Mannerheimintie 1" in SearchInput
    And the user clicks the Search PrimaryButton
    Then the LoadingSpinner displays
    And the DataTable populates with matching addresses
    And each row shows Address, City, Postal Code columns
```

---

## Use Case Structure Template

```markdown
# UC-{ID}: {Use Case Name}

## Metadata

| Field | Value |
|-------|-------|
| **ID** | UC-{ID} |
| **Priority** | MUST / SHOULD / COULD |
| **Status** | Draft / Approved / Implemented |
| **Related Requirements** | FR-01, FR-02 |
| **Primary Screen** | `mockups/{screen}.png` |

## Actors

- **Primary**: {User role}
- **Secondary**: {System/service}

## Preconditions

- User is authenticated
- {Other preconditions}

## UI Components Used

| Component | Location | Usage |
|-----------|----------|-------|
| SearchInput | Search Screen | Query entry |
| PrimaryButton | Search Screen | Submit search |
| DataTable | Search Screen | Display results |
| {Component} | {Screen} | {Usage} |

## Main Flow

1. User navigates to **{Screen}** (`mockups/{file}.png`)
2. User interacts with **{Component}** - {action}
3. System responds with **{Component}** - {response}
4. ...

## Alternative Flows

### A1: No Results Found

1. At step 4, if no results found
2. System displays **EmptyState** component with message
3. User can modify search in **SearchInput**

### A2: Error Occurred

1. At step 4, if API error occurs
2. System displays **Toast** (variant: Error) with message
3. **DataTable** shows error state

## Postconditions

- {Expected outcome}
- {State changes}

## Screens Needed (Flag for Step 06)

| Screen | Description | Priority |
|--------|-------------|----------|
| {Screen name} | {What it shows} | {MUST/SHOULD} |

## Acceptance Criteria

```gherkin
Feature: {Use Case Name}
  Scenario: {Happy path}
    Given {initial state}
    When {user action on Component}
    Then {expected result with Component}
```

## Non-Functional Requirements

- **Performance**: Response time < {X}ms
- **Accessibility**: {Requirements}
- **Security**: {Requirements}
```

---

## Outputs

`arch-to-be/enablers/UC-*.md`

Examples:
- `UC-01-address-search.md`
- `UC-02-address-update.md`
- `UC-03-address-import.md`
- `UC-AUTH-authentication.md`
- `UC-SYNC-data-synchronization.md`

### Summary Document

Create `arch-to-be/enablers/UC-SUMMARY.md` with:
- List of all use cases
- **New screens needed** (consolidated list for Step 06)
- Component usage matrix

---

## Success Criteria

- [ ] All key use cases documented
- [ ] Technical enablers defined
- [ ] Acceptance criteria specified (Gherkin format)
- [ ] Use cases traceable to BRD requirements
- [ ] UI components referenced from design system
- [ ] New screens identified and flagged for Step 06
- [ ] Use case diagrams created

---

**Estimated Duration**: 90-120 minutes
**Next Step**: [Step 06: Technical Specifications](06-specifications.md)
