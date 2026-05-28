# Step 06: Sub-Agent Templates

**Purpose**: Standardized templates for sub-agent outputs
**Usage**: Reference these templates when launching sub-agents

---

## Overview

This step provides the exact templates that sub-agents must follow when creating analysis documents. Consistency ensures the orchestrator can synthesize outputs effectively.

Templates are numbered by workflow order and located in `{ANALYSIS_ROOT}/templates/`.

---

## Template Index

| # | Template | Used By | Step |
|---|----------|---------|------|
| 01 | [C# Component Analysis](../templates/01-csharp-component.md) | SA-01 to SA-07 | Step 05 |
| 02 | [Database Object Analysis](../templates/02-database-object.md) | SA-11 to SA-16 | Step 05 |
| 03 | [Integration Analysis](../templates/03-integration-analysis.md) | SA-21 to SA-23 | Step 05 |
| 04 | [Requirements Analysis](requirements-analysis-template.md) | SA-31, SA-32 | Step 07 |
| 05 | [User Story](user-story-template.md) | Requirements synthesis | Step 07 |
| 06 | [Traceability Matrix](traceability-matrix-template.md) | Requirements tracing | Step 07 |
| 07 | [Architecture Decision Record](adr-template.md) | Modernization decisions | Step 07 |
| 08 | [Findings Summary](../templates/08-findings-summary.md) | All sub-agents | End of each SA |
| 09 | [Completion Marker](../templates/09-completion-marker.md) | All sub-agents | End of each SA |
| 10 | [Communication](../templates/10-communication.md) | Status, errors, limitations | Throughout |
| 11 | [DTO Catalog](../templates/11-dto-catalog.md) | Component analysis, API docs | Step 05, 07 |

---

## Step 05 Templates (Analysis)

### 01 - C# Component Analysis

**For**: SA-01 through SA-07

Comprehensive template for analyzing C# projects including:
- Executive summary with metrics
- Component inventory (projects, entry points, interfaces)
- Architecture overview with diagrams
- Integration points (database, services, files, messaging)
- Business logic and validation rules
- Data models and relationships
- Configuration requirements
- Quality assessment
- Extracted requirements
- Modernization observations

[View Template](../templates/01-csharp-component.md)

---

### 02 - Database Object Analysis

**For**: SA-11 through SA-16

Template for PL/SQL analysis with LLM-specific checklists:
- Object inventory and categorization
- Business logic extraction (with EXACT formulas)
- EAV pattern detection checklist
- Calculation rule extraction checklist
- Data model documentation
- Dependency mapping
- Integration points
- Performance analysis
- Quality assessment
- Migration candidates

[View Template](../templates/02-database-object.md)

---

### 03 - Integration Analysis

**For**: SA-21, SA-22, SA-23

Template for documenting system integrations:
- Integration inventory
- Communication patterns (sync/async)
- Data exchange formats
- Security (authentication/authorization)
- Error handling strategies
- Performance characteristics
- Modernization opportunities and risks

[View Template](../templates/03-integration-analysis.md)

---

## Step 07 Templates (Synthesis)

### 04 - Requirements Analysis

**For**: SA-31 (Functional), SA-32 (Non-Functional)

Template for documenting extracted requirements:
- Functional requirements with traceability
- Non-functional requirements (performance, security, etc.)
- Business rule documentation
- Acceptance criteria

[View Template](requirements-analysis-template.md)

---

### 05 - User Story

**For**: Requirements synthesis

Standard user story format:
- As a / I want / So that
- Acceptance criteria
- Technical notes
- Priority and effort estimates

[View Template](user-story-template.md)

---

### 06 - Traceability Matrix

**For**: Requirements tracing

Matrix linking:
- Legacy code locations â†’ Extracted requirements
- Requirements â†’ User stories
- Requirements â†’ Test cases

[View Template](traceability-matrix-template.md)

---

### 07 - Architecture Decision Record (ADR)

**For**: Modernization planning

Standard ADR format:
- Title and status
- Context and decision drivers
- Considered options
- Decision outcome
- Consequences

[View Template](adr-template.md)

---

## General Templates (All Steps)

### 08 - Findings Summary

**REQUIRED**: Every sub-agent MUST include this at the end of their analysis document.

Standardized summary format:
- Component overview table
- Key findings with severity
- Business logic identified
- Critical dependencies
- Technical debt items
- Modernization notes

[View Template](../templates/08-findings-summary.md)

---

### 09 - Completion Marker

**For**: Signaling sub-agent completion

JSON marker file created when sub-agent finishes:
- Agent ID
- Completion timestamp
- Output file path
- Status

[View Template](../templates/09-completion-marker.md)

---

### 10 - Communication Templates

**For**: Status updates, error reporting, limitations

Templates for:
- Progress updates
- Error/blocker reporting
- Known limitation documentation
- Human intervention requests

[View Template](../templates/10-communication.md)

---

### 11 - DTO Catalog

**For**: Component analysis, API documentation, data mapping

Comprehensive DTO documentation template with business rule traceability:
- DTO registry with source entities and business rules
- Field-level validation with BR-nnn references
- Entity-to-DTO mapping matrix
- Business Rule-to-DTO mapping matrix
- Cross-field validation documentation
- Usage tracking (controllers, services)

[View Template](../templates/11-dto-catalog.md)

---

## Usage Instructions

### For Orchestrator

1. Before launching sub-agent, specify which template(s) to use
2. Include template number in prompt: "Use template 01 for C# component analysis"
3. Verify sub-agent output includes required Findings Summary (template 08)
4. Check for completion marker (template 09) when sub-agent finishes

### For Sub-Agents

1. Use the specified template as your output structure
2. Fill in ALL sections - mark as "N/A" if not applicable
3. Include exact file:line references where possible
4. End with Findings Summary (template 08)
5. Create completion marker (template 09) when done

---

## Next Step

Proceed to: [07-synthesis-deliverables.md](07-synthesis-deliverables.md)

---

*Document Version: 1.4*
*Last Updated: 2026-01-25*
