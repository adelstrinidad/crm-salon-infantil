# Specification Template

**Purpose**: Template for creating detailed reverse-engineered specifications during Step 05 Component Analysis.

**When to Use**: For deep-dive documentation of complex areas that exceed standard SA-XX analysis scope.

---

## Template Types

### 1. Module/System Specification

Use for high-level system documentation combining multiple components.

```markdown
# {System Name} Module Specification

## 1. Overview
{Brief description of the module/system purpose}

## 2. Business Purpose & Scope
{What business problems does this solve? What's in/out of scope?}

## 3. High-Level Capabilities
| Area | Capability |
|------|------------|
| {Area} | {Description} |

## 4. Architectural Layers
{Describe the layered architecture - presentation, services, data, etc.}

## 5. Solution & Project Inventory
- Total solution files: {n}
- Projects: {n}
- Key components: {list}

## 6. Codebase Metrics
| Metric | Value |
|--------|-------|
| Total files | {n} |
| LOC | {n} |

## 7. Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| {Name} | {Internal/External} | {Protocol} |

## 8. References
- SA-XX documents: {list relevant SA analysis docs}
- Arc42 sections: {list relevant sections}
```

---

### 2. UI Specification (Reverse-Engineered)

Use for documenting legacy UI from screenshots and code.

```markdown
# {System Name} UI Specification

**Date**: {YYYY-MM-DD}
**Status**: Draft (reverse-engineered from {source})

## 0. Addendum – Implementation Mapping
{Map each UI zone to concrete implementation artifacts}

### 0.1 Technology Stack
- Framework: {e.g., ASP.NET WebForms}
- Controls: {e.g., User controls, third-party}
- Client scripting: {e.g., jQuery, vanilla JS}

### 0.2 Page Composition & Zone Mapping
| Spec Zone | Screenshot Area | Implementation | Notes |
|-----------|-----------------|----------------|-------|
| Z1 | {Area name} | {File:Control} | {Notes} |

### 0.3 Key Code Flows
{Number and describe key user flows}

### 0.4 Domain Object Interactions
| Object | Purpose | Where Used |
|--------|---------|-----------|
| {Object} | {Purpose} | {Locations} |

### 0.5 Visual Design Characteristics
- Layout: {Description}
- Color Palette: {Description}
- Typography: {Description}

### 0.6 UX / Technical Debt Summary
| Issue | Code Evidence | Impact | Modernization Direction |
|-------|--------------|--------|-------------------------|
| {Issue} | {Evidence} | {Impact} | {Direction} |

### 0.7 Modernization Traceability
| Modern Target | Legacy Anchor | Migration Step |
|---------------|---------------|----------------|
| {Target} | {Legacy} | {Step} |
```

---

### 3. Data Model Specification

Use for documenting database schemas, especially EAV patterns.

```markdown
# {System Name} Data Model Specification

**Date**: {YYYY-MM-DD}
**Status**: Draft (reverse-engineered from {source})
**Scope**: {What tables/schemas are covered}

## 1. Purpose & Audience
{Why this spec exists and who should read it}

## 2. High-Level Model Overview
{Describe the overall data model pattern - normalized, EAV, hybrid, etc.}

```
{ASCII diagram of key table relationships}
```

## 3. Core Tables & Roles
| Table | Role | Notes | Primary Key | Foreign Keys |
|-------|------|-------|-------------|--------------|
| {Table} | {Role} | {Notes} | {PK} | {FKs} |

## 4. Detailed Column Semantics
{Group columns logically: identity, hierarchy, attributes, audit, etc.}

## 5. Index Strategy
- Point lookups: {indexes}
- Search patterns: {indexes}
- Performance risks: {description}

## 6. Materialization & Lifecycle
| Phase | Mechanism | Scripts | Notes |
|-------|-----------|---------|-------|
| Full rebuild | {desc} | {scripts} | {notes} |
| Incremental | {desc} | {scripts} | {notes} |

## 7. Query Patterns & Performance
{Document common query patterns with example SQL}

## 8. Business Rules in Database
| Rule ID | Description | Enforced By | Location |
|---------|-------------|-------------|----------|
| BR-XXX | {Rule} | {Mechanism} | {file:line} |

## 9. Migration Considerations
{Notes for modernization - denormalization opportunities, performance improvements, etc.}
```

---

## Output Location

Save specifications to: `work/05-analysis/specs/{SYSTEM}-{TYPE}-Spec.md`

Examples:
- `work/05-analysis/specs/AR-Module.md`
- `work/05-analysis/specs/AR-Legacy-Main-UI-Spec.md`
- `work/05-analysis/specs/AR-Legacy-Address-Data-Model-Spec.md`

---

## Relationship to SA-XX Documents

| SA-XX Document | Specification Type | When to Create Spec |
|----------------|-------------------|---------------------|
| SA-07 (UI Layer) | UI Specification | Complex multi-zone UI requiring detailed zone mapping |
| SA-14 (Database Tables) | Data Model Specification | EAV patterns, complex schemas, 50+ tables |
| SA-01-SA-06 | Module Specification | Cross-cutting system overview needed |

**Rule**: Create a specification when the SA-XX document would exceed 500 lines of detailed analysis for a single area.

---

## Referenced By

Specifications should be referenced from:
- Relevant SA-XX analysis documents
- Arc42 sections (especially 05-Building Block View, 06-Runtime View)
- Requirements documents (for business rule traceability)

---

*Last Updated: 2026-01-09*
