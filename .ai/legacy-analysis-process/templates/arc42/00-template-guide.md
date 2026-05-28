# Arc42 Template Guide

## Overview

This directory contains Arc42 architecture documentation templates. Each section has a standardized format optimized for:

1. **Human readability** - Clear structure, consistent formatting
2. **AI assistance** - Structured data, metadata headers
3. **Version control** - Markdown-based, diffable

## Diagram Conventions

### When to Use Each Tool

| Diagram Type | Tool | Reason |
|--------------|------|--------|
| C4 Context/Container/Component | PlantUML | Rich C4 library support |
| Sequence diagrams (complex) | PlantUML | Better control, styling |
| Deployment diagrams | PlantUML | Infrastructure icons |
| Simple flowcharts | Mermaid | GitHub native rendering |
| State diagrams | Mermaid | Simple syntax |
| Entity relationships | Mermaid | Quick ERDs |
| Decision trees | Mermaid | Simple visualization |

### PlantUML Template

```plantuml
@startuml diagram-name
!include <C4/C4_Context>

title Diagram Title

' Define elements
Person(alias, "Name", "Description")
System(alias, "Name", "Description")
System_Ext(alias, "Name", "Description")

' Define relationships
Rel(from, to, "label")

@enduml
```

### Mermaid Template

```mermaid
flowchart LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

## Section Checklist

| # | Section | Template | Status | Last Updated |
|---|---------|----------|--------|--------------|
| 01 | Business Vision, Goals, and Technology-Agnostic Requirements | [01-introduction-goals.md](01-introduction-goals.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| 02 | Technical, Organizational, and Regulatory Constraints | [02-constraints.md](02-constraints.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| 03 | Enterprise Landscape, System Boundaries, and Integration Interfaces | [03-context-scope.md](03-context-scope.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| 04 | Architecture Design Principles, Vision, and Key Strategies | [04-solution-strategy.md](04-solution-strategy.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| 05 | High-Level Software Architecture and Module Decomposition | [05-building-block-view.md](05-building-block-view.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| 06 | Key User Workflows and System Data Flows | [06-runtime-view.md](06-runtime-view.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| 07 | Infrastructure, Hosting Environment, and Deployment Topology | [07-deployment-view.md](07-deployment-view.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| 08 | Domain Rules, Data Standards, and Cross-Functional Guidelines | [08-domain-rules-and-guidelines.md](08-domain-rules-and-guidelines.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| 09 | Significant Architectural Design Decisions (ADR) | [09-architecture-decisions/](09-architecture-decisions/) | [ ] Draft / [ ] Review / [ ] Complete | |
| 10 | Quality Attributes, Performance Metrics, and SLAs | [10-quality-requirements.md](10-quality-requirements.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| 11 | Known Technical Risks, Limitations, and Current Debt | [11-risks-technical-debt.md](11-risks-technical-debt.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| 12 | Domain Terminology and Business Language Dictionary | [12-glossary.md](12-glossary.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| **13** | **Documentation Reality vs. Code Reality (Custom Extension)** | [13-documentation-gaps.md](13-documentation-gaps.md) | [ ] Draft / [ ] Review / [ ] Complete | |
| **99** | **Requirements Summary (Appendix)** | [99-requirements-summary.md](99-requirements-summary.md) | [ ] Draft / [ ] Review / [ ] Complete | |

### BMAD Extensions (Three-Source Synthesis)

These sections were added to support the BMAD (Brownfield Methodology for AI-Assisted Development) process:

| Section | Extension | Purpose |
|---------|-----------|---------|
| **01** | 1.4 Design Intent and Evolution | Capture original design goals and system evolution |
| **01** | 1.5 Documentation Gaps Identified | Summary of gaps between docs and reality |
| **04** | 4.1 Enhanced Decision Templates | Decisions with intent, rationale, and current assessment |
| **13** | Documentation Gaps (New) | Full gap analysis including tribal knowledge |
| **99** | Requirements Summary (Appendix) | Consolidates all traceable requirements for TO-BE |

### Section 99: Requirements Summary Appendix

This **custom appendix** consolidates all requirements extracted during Step 07:

| Content | Source Artifact | Purpose |
|---------|-----------------|---------|
| Business Rules (BR-XXX) | `BUSINESS-RULES-CATALOG.md` | Preserve business logic in TO-BE |
| Functional Requirements (FR-XXX) | `FUNCTIONAL-REQUIREMENTS.md` | Feature parity verification |
| Non-Functional Requirements (NFR-XXX) | `NON-FUNCTIONAL-REQUIREMENTS.md` | Performance/security targets |
| User Stories (US-XXX) | `USER-STORIES.md` | Acceptance criteria for TO-BE |
| Test Cases (TC-XXX) | `TEST-PLAN.md` | Migration verification scenarios |
| Traceability Matrix | `REQUIREMENTS-TRACEABILITY-MATRIX.md` | Code → Rule → Req → Story → Test |

**Key Principle**: Requirements document WHAT in business terms, NOT HOW technically. This enables technology-agnostic migration.

See also: `templates/analysis/test-plan-template.md` for migration verification scenarios

### Spec-Kit Integration

The AS-IS analysis captures requirements using structures compatible with spec-kit templates:

| Spec-Kit Template | AS-IS Equivalent | Arc42 Integration |
|-------------------|------------------|-------------------|
| BRD (brd-template.md) | BUSINESS-RULES-CATALOG.md + FUNCTIONAL-REQUIREMENTS.md | Section 99 Appendix |
| Use Cases (UC-XX-template.md) | USER-STORIES.md | Section 99 Appendix |
| Specifications (spec-template.md) | Component analysis (SA-XX) + requirements | Sections 05-08 |
| Design System (design-system-template.md) | N/A (TO-BE concern) | Not used in AS-IS |

**Key Principle**: AS-IS documents WHAT exists; TO-BE documents WHAT should be built.

### Requirements Traceability

All requirements must maintain traceability:

```
Source Code → Business Rule (BR-XXX) → Functional Requirement (FR-XXX) → User Story (US-XXX) → Test Case (TC-XXX)
```

Example:
```
AddressValidator.cs:178 → BR-001 (Swedish postal format) → FR-12-003 (Validate Swedish postal) → US-012 (Validate Nordic address) → TC-012-001 (Valid SE postal)
```

## Quick Start

1. Copy the template for the section you need
2. Replace `{placeholders}` with actual content
3. Add diagrams using PlantUML or Mermaid
4. Update the checklist above
5. Commit changes

## File Naming

- Sections: `01-introduction-goals.md`, `02-constraints.md`, etc.
- Diagrams: `c4-context.puml`, `seq-vrk-import.puml`, etc.
- ADRs: `ADR-001-title.md`, `ADR-002-title.md`, etc.

## Diagram Usage by Section

| Section | PlantUML | Mermaid | Diagram Types |
|---------|----------|---------|---------------|
| 01 Introduction | - | Yes | mindmap (stakeholders) |
| 02 Constraints | - | Yes | flowchart (constraint visualization) |
| 03 Context & Scope | Yes | Yes | C4 Context, network zones |
| 04 Solution Strategy | Yes | Yes | C4 Component, flowcharts |
| 05 Building Block | Yes | Yes | C4 Container/Component, class diagrams |
| 06 Runtime View | Yes | Yes | Sequence, flowchart, state diagrams |
| 07 Deployment | Yes | Yes | Deployment, network, HA |
| 08 Crosscutting | - | Yes | ERD, flowchart, pie charts |
| 09 ADRs | - | Yes | State diagram (workflow) |
| 10 Quality | - | Yes | mindmap, flowchart |
| 11 Risks | - | Yes | quadrant chart, pie, gantt |
| 12 Glossary | - | Yes | mindmap (term relationships) |

## Related Resources

- [Arc42 Official](https://arc42.org/)
- [C4 Model](https://c4model.com/)
- [C4-PlantUML](https://github.com/plantuml-stdlib/C4-PlantUML)
- [Mermaid Documentation](https://mermaid.js.org/)
- [MADR Templates](https://adr.github.io/madr/)
