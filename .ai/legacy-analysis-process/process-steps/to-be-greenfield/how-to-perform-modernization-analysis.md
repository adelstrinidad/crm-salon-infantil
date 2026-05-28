# How to Perform Modernization Analysis (TO-BE Design)

**Purpose**: Transform AS-IS legacy analysis into TO-BE modernized system design
**Prerequisite**: AS-IS analysis complete (process-steps-as-is completed)
**Input**: `artifacts/` folder and `arch-as-is/` documentation
**Output**: `arch-to-be/` complete Arc42 documentation + implementation artifacts
**Duration**: ~10-14 hours (machine time)

---

## 0. Instruction for AI

Read how-to-perform-modernization-analysis.md. Plan execution and execute all steps autonomously until reaching a mandatory human review gate.

---

# ⛔ CRITICAL: AI Agent Execution Rules

## Autonomous Execution Between Gates

When executing the TO-BE modernization workflow, you MUST operate autonomously between gates:

✅ **Execute multiple steps continuously** until reaching a mandatory gate
✅ **Make reasonable assumptions** when encountering design choices (document in ADRs)
✅ **Do NOT ask questions** during step execution - proceed with best judgment
✅ **Do NOT use AskUserQuestion tool** except at mandatory gates (Gate 1 and Gate 2)
✅ **Generate all required outputs** for each step without waiting for approval
✅ **Only STOP at 2 mandatory human review gates** (after Step 01 and Step 10)

**Example Autonomous Flow**:
```
Step 01 → GATE 1 (STOP, ask) → Steps 02-09 (autonomous) → Step 10 → GATE 2 (STOP, ask)
```

**NOT this**:
```
Step 01 → GATE 1 (ask) → (ask?) → Step 02 → (ask?) → Step 03 → (ask?) → ...
```

## Mandatory Human Review Gates (BLOCKING)

**There are 2 mandatory human review gates in this workflow - these are the ONLY points where you may ask questions:**

| Gate # | After Step | Purpose | Decision Type |
|--------|------------|---------|---------------|
| Gate 1 | Step 01 | Modernization options and technology stack approval | APPROVE / REQUEST CHANGES / STOP |
| Gate 2 | Step 10 | Final TO-BE architecture documentation approval | APPROVE / REVISE SECTIONS / MAJOR REVISIONS |

**When you reach a gate (MANDATORY PROCEDURE):**

1. ⛔ **STOP execution immediately** - Do not continue to next step
2. 📊 **Present gate-specific information** in chat (recommended option, rationale, trade-offs)
3. 🙋 **Use AskUserQuestion tool** with exact options specified in the gate file
4. ⏳ **WAIT for human response** - Do NOT proceed, do NOT make assumptions, do NOT self-approve
5. ✅ **ONLY proceed** if human approves
6. ⛔ **Handle revisions** if human requests changes (update documents, then re-request approval)

**Between gates (autonomous execution - Steps 02-09):**
- ✅ Make architectural decisions and document in ADRs
- ✅ Choose design patterns based on best practices
- ✅ Select technologies consistent with Gate 1 approval
- ✅ Create UI mockups and specifications
- ✅ Define API contracts and data models
- ✅ Document all decisions and rationale
- ❌ Do NOT use AskUserQuestion tool
- ❌ Do NOT stop to "confirm" design choices
- ❌ Do NOT ask for clarification on implementation details

**Note**: Steps 02-09 execute autonomously after Gate 1 approval. The workflow includes 5 optional quality checkpoints (not mandatory gates) - you should generate documentation for these checkpoints but do NOT stop execution to ask for approval.

---

## Overview

This guide describes the **TO-BE Design Workflow** - a structured 9-step process to design a modernized target system based on legacy analysis findings.

**Key Principle**: This is a **separate workflow** from AS-IS legacy analysis. You must complete the AS-IS analysis (Steps 01-09 from `process-steps-as-is/`) before starting TO-BE design.

---

## Table of Contents

1. [Workflow Overview](#workflow-overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Guide](#step-by-step-guide)
4. [Deliverables](#deliverables)
5. [Quality Gates](#quality-gates)
6. [Common Patterns](#common-patterns)

---

## Workflow Overview

| Step | Name | Description | Duration |
|------|------|-------------|----------|
| **01** | **Modernization Options Analysis** | Evaluate rewrite/refactor/replace strategies | ~60-90 min |
| **02** | **Architecture Planning** | Design target architecture + ADRs | ~90-120 min |
| **03** | **Business Requirements Document** | Transform AS-IS to TO-BE requirements + UI context | ~60-90 min |
| **04** | **UI Design Guidelines** | Style guide + high-fidelity main screen mockups | ~90-120 min |
| **05** | **Use Case Specifications** | Define use cases with UI component references | ~90-120 min |
| **06** | **Technical Specifications** | Backend/frontend specs + additional mockups | ~120-180 min |
| **07** | **Data Model Planning** | Design target database schema | ~60-90 min |
| **08** | **Test Planning** | E2E, unit, and visual test specifications | ~60-90 min |
| **09** | **Implementation Roadmap** | Phased delivery and migration plan | ~60-90 min |

**Total Duration**: ~10-14 hours

**Key Workflow Principle**: UI Design Guidelines (Step 04) come BEFORE Use Cases (Step 05) so that Use Cases can reference specific UI components from the design system.

---

## Prerequisites

### AS-IS Analysis Artifacts Required

From `artifacts/` folder:
- `artifacts/07-synthesis/requirements/FUNCTIONAL-REQUIREMENTS.md`
- `artifacts/07-synthesis/requirements/NON-FUNCTIONAL-REQUIREMENTS.md`
- `artifacts/07-synthesis/requirements/AR-USER-STORIES.md`
- `artifacts/09-summaries/AR-IMPROVEMENT-OPPORTUNITIES.md`

From `arch-as-is/` folder:
- All Arc42 sections (01-12) completed
- Component analysis (SA-01 to SA-23) referenced

### Tools and Templates

Templates in `.ai/2_templates/`:
- `brd-template.md` - Business Requirements Document
- `UC-00-template.md` - Use Case and Enabler specifications
- `spec-template.md` - Technical specifications

MCP Tools:
- `context7` - For Arc42 guidance
- `knowledge-graph` - For requirement traceability

---

## Step-by-Step Guide

### Step 01: Modernization Options Analysis

**Objective**: Evaluate different modernization strategies and select the best approach

**Input**:
- `artifacts/07-synthesis/requirements/FUNCTIONAL-REQUIREMENTS.md`
- `artifacts/09-summaries/AR-IMPROVEMENT-OPPORTUNITIES.md`
- `arch-as-is/11-risks-technical-debt.md`

**Activities**:

1. **Analyze Modernization Strategies**
   ```
   - Option A: Rewrite (greenfield rebuild)
   - Option B: Refactor (incremental modernization)
   - Option C: Replace (COTS/SaaS solutions)
   - Option D: Hybrid (combination approach)
   ```

2. **Technology Stack Evaluation**
   - Programming languages and frameworks
   - Database platforms (Oracle → PostgreSQL/SQL Server)
   - Cloud platforms (AWS, Azure, GCP, on-premise)
   - Integration patterns (REST, GraphQL, message queues)
   - Authentication and authorization (OAuth2, JWT)

3. **Risk Assessment**
   - Technical complexity
   - Business continuity
   - Data migration challenges
   - Team skill gaps
   - Timeline and budget constraints

4. **Provide Recommendation**
   - Justification based on requirements
   - Cost-benefit analysis
   - Implementation complexity assessment
   - Risk mitigation strategies

**Output**: `arch-to-be/implementation/MODERNIZATION-OPTIONS.md`

**Template Structure**:
```markdown
# Modernization Options Analysis

## Executive Summary
[1-2 paragraph summary of recommendation]

## Options Evaluated

### Option 1: [Strategy Name]
**Approach**: [Description]
**Pros**: [Benefits]
**Cons**: [Drawbacks]
**Estimated Effort**: [High/Medium/Low]
**Risk Level**: [High/Medium/Low]

## Technology Stack Recommendations

| Component | AS-IS | TO-BE | Rationale |
|-----------|-------|-------|-----------|
| Backend | .NET Framework | .NET 8 | Modern, cross-platform |
| Database | Oracle PL/SQL | PostgreSQL | Open-source, cloud-ready |

## Recommendation

**Selected Strategy**: [Strategy Name]
**Rationale**: [Why this option]
**Implementation Approach**: [High-level plan]
```

**Success Criteria**:
- [ ] All modernization options documented
- [ ] Technology stack evaluated for each component
- [ ] Risks identified with mitigation strategies
- [ ] Clear recommendation with rationale
- [ ] Stakeholder buy-in obtained

**Reference Documents** (examples from this project):
- `AR-Modernization-Options.md` - Comprehensive options analysis
- `AR-Modernization-Options-V2.md` - Condensed version
- `Architecture-Modernization-Options.md` - Alternative format

---

### Step 02: Architecture Planning

**Objective**: Design target system architecture and document key architectural decisions

**Input**:
- `arch-to-be/implementation/MODERNIZATION-OPTIONS.md` (from Step 01)
- `arch-as-is/04-solution-strategy.md`
- `arch-as-is/05-building-block-view.md`

**Activities**:

1. **Define Architecture Patterns**
   - Layered architecture (presentation, business, data)
   - Microservices vs. monolith vs. modular monolith
   - API gateway pattern
   - Event-driven architecture components
   - Strangler Fig pattern for incremental migration

2. **Create Architecture Decision Records (ADRs)**

   Template for each ADR:
   ```markdown
   # ADR-XXX: [Decision Title]

   **Status**: Proposed | Accepted | Deprecated
   **Date**: YYYY-MM-DD
   **Deciders**: [List of people involved]

   ## Context
   [What is the issue motivating this decision]

   ## Decision
   [The change being proposed or approved]

   ## Consequences
   **Positive**:
   - [Benefit 1]

   **Negative**:
   - [Trade-off 1]

   **Risks**:
   - [Risk 1]
   ```

   Common ADRs to create:
   - Database choice and migration strategy
   - Authentication and authorization approach
   - Deployment model (cloud, on-premise, hybrid)
   - API design standards (REST, GraphQL, gRPC)
   - Event/messaging architecture
   - Observability and monitoring stack

3. **Design System Components**
   - Identify bounded contexts (DDD)
   - Define service boundaries
   - Plan inter-service communication
   - Document component responsibilities
   - Create context map

4. **Integration Patterns**
   - External system integrations ({EXTERNAL_SYSTEM_1}, {EXTERNAL_SYSTEM_2}, {EXTERNAL_SYSTEM_3})
   - API design (REST, GraphQL)
   - Message queue patterns
   - Synchronous vs. asynchronous communication
   - Change Data Capture (CDC) for legacy integration

**Output**:
- `arch-to-be/04-solution-strategy.md` (Arc42 section 4)
- `arch-to-be/09-architecture-decisions.md` (Arc42 section 9 with ADRs)
- `arch-to-be/05-building-block-view.md` (Arc42 section 5)
- `arch-to-be/adr/ADR-XXX-*.md` (individual ADR files)

**Success Criteria**:
- [ ] Target architecture pattern defined
- [ ] At least 5-10 ADRs documented
- [ ] Component boundaries clearly defined
- [ ] Integration patterns documented
- [ ] Arc42 sections 4, 5, and 9 completed

**Reference Documents** (examples from this project):
- `Architecture-Modernization-Roadmap.md` - Strategic roadmap
- `strangler-fig-implementation-plan.md` - Migration pattern
- `ADR-001-adopt-aspnet-core-modular-monolith.md`
- `ADR-003-vrk-ingestion-dataflow-bulkcopy.md`

---

### Step 03: Business Requirements Document (BRD)

**Objective**: Transform AS-IS functional requirements into TO-BE business requirements + provide UI context for downstream design

**Input**:
- `artifacts/07-synthesis/requirements/FUNCTIONAL-REQUIREMENTS.md`
- `artifacts/07-synthesis/requirements/NON-FUNCTIONAL-REQUIREMENTS.md`
- `artifacts/07-synthesis/requirements/AR-USER-STORIES.md`
- `arch-to-be/04-solution-strategy.md` (from Step 02)

**Template**: `.ai/2_templates/brd-template.md`

**Activities**:

1. **Business Context**
   - Document business objectives
   - Define project scope
   - Identify stakeholders
   - Document business drivers

2. **Functional Requirements**
   - Transform AS-IS capabilities to TO-BE requirements
   - Add new business capabilities
   - Prioritize requirements (MoSCoW: Must, Should, Could, Won't)
   - Map requirements to business value

3. **Non-Functional Requirements**
   - Performance targets (response times, throughput)
   - Security requirements (authentication, authorization, encryption)
   - Scalability needs (concurrent users, data volume)
   - Compliance requirements (GDPR, industry regulations)
   - Availability and reliability (SLA targets)

4. **Business Processes**
   - Document key workflows
   - Define process improvements over AS-IS
   - Identify automation opportunities
   - Create process flow diagrams

5. **User Experience Context** (for downstream UI Design)
   - User personas (primary and secondary users)
   - Brand guidelines (if available)
   - UI/UX requirements (accessibility, responsive)
   - Key screens identification (main screens for Step 04)

**Output**: `arch-to-be/brd/AR-BRD.md`

**BRD Structure**:
```markdown
# Business Requirements Document

## 1. Executive Summary

## 2. Business Context
### 2.1 Business Objectives
### 2.2 Project Scope
### 2.3 Stakeholders

## 3. Functional Requirements
### FR-01: [Requirement Name]
**Priority**: MUST | SHOULD | COULD
**Description**: [What the system must do]
**Acceptance Criteria**: [How to verify]
**Business Value**: [Why this matters]

## 4. Non-Functional Requirements
### NFR-01: Performance
### NFR-02: Security
### NFR-03: Scalability
### NFR-04: Compliance

## 5. User Experience Context
### 5.1 User Personas
### 5.2 Brand Guidelines
### 5.3 UI/UX Requirements
### 5.4 Key Screens Identification

## 6. Business Processes
### 6.1 [Process Name]
[Process flow diagram]

## 7. Constraints and Assumptions

## 8. Success Metrics
```

**Success Criteria**:
- [ ] All AS-IS requirements transformed to TO-BE
- [ ] New capabilities identified and documented
- [ ] Requirements prioritized (MoSCoW)
- [ ] Non-functional requirements quantified
- [ ] User personas and key screens identified for UI Design step
- [ ] BRD reviewed and approved by stakeholders

**Reference Documents** (examples from this project):
- `AR-Executive-Summary.md` - Executive overview
- `Modernization-Summary-EN-FI.md` - Bilingual summary

---

### Step 04: UI Design Guidelines

**Objective**: Create style guide and high-fidelity mockups for main screens ONLY (not every dialogue)

**Input**:
- `arch-to-be/brd/AR-BRD.md` - Section 5: User Experience Context (from Step 03)
- Existing brand assets (if available)
- Legacy system screenshots (for reference)

**Activities**:

1. **Create UI Style Guide**
   - Color palette (primary, secondary, accent, semantic)
   - Typography (headings, body, monospace)
   - Spacing and grid system
   - Component patterns (buttons, forms, tables, cards)

2. **Design Main Screen Mockups**
   - Create high-fidelity HTML mockups using DaisyUI + Tailwind CSS
   - Only main/key screens identified in BRD Section 5.4
   - NOT every possible dialogue or modal
   - Screenshot with Playwright MCP

3. **Document Component Patterns**
   - Reusable UI component specifications
   - Form field patterns
   - Data table patterns
   - Navigation patterns

**Mockup Creation Process**:
```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@4.12.14/dist/full.min.css" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-base-200 min-h-screen">
  <!-- Screen content -->
</body>
</html>
```

**Output**:
- `arch-to-be/design/UI-STYLE-GUIDE.md` - Color, typography, spacing
- `arch-to-be/design/COMPONENT-PATTERNS.md` - Reusable component specs
- `arch-to-be/design/mockups/html/` - Source HTML files
- `arch-to-be/design/mockups/screenshots/` - PNG images for reference

**Success Criteria**:
- [ ] Style guide documents colors, typography, spacing
- [ ] Main screens have high-fidelity mockups (3-5 key screens)
- [ ] Component patterns documented for reuse
- [ ] Screenshots captured from HTML mockups
- [ ] Design consistent across all mockups

**Important**: UI Design should NOT include every possible screen. Additional screens are created in Step 06 (Technical Specifications) as needed.

---

### Step 05: Use Case Specifications

**Objective**: Define system use cases and technical enablers with UI component references

**Input**:
- `arch-to-be/brd/AR-BRD.md` (from Step 03)
- `arch-to-be/design/UI-STYLE-GUIDE.md` (from Step 04)
- `arch-to-be/design/COMPONENT-PATTERNS.md` (from Step 04)
- `arch-to-be/design/mockups/screenshots/` (from Step 04)
- `artifacts/07-synthesis/requirements/AR-USER-STORIES.md`

**Template**: `.ai/2_templates/UC-00-template.md`

**Activities**:

1. **Identify Use Cases**
   - Map BRD requirements to use cases
   - Define actors (users, systems, external services)
   - Document scenarios (main flow, alternative flows)
   - Define preconditions and postconditions
   - Create use case diagrams

2. **Define Technical Enablers**

   Common enablers:
   - **UC-AUTH**: Authentication and authorization
   - **UC-GATEWAY**: API gateway and routing
   - **UC-SYNC**: Data synchronization mechanisms
   - **UC-AUDIT**: Audit logging and compliance
   - **UC-CACHE**: Caching strategy
   - **UC-SEARCH**: Search and indexing
   - **UC-NOTIF**: Notifications and alerts

3. **Document Acceptance Criteria**
   - Given-When-Then scenarios (Gherkin format)
   - Test conditions
   - Success metrics
   - Performance criteria

4. **Reference UI Components** (from Step 04)
   - Link to specific mockups from design
   - Reference component patterns used
   - Flag screens that need to be created in Step 06

**Output**: `arch-to-be/enablers/UC-*.md`

**Use Case Structure**:
```markdown
# UC-01: [Use Case Name]

## Metadata
**ID**: UC-01
**Priority**: MUST | SHOULD | COULD
**Status**: Draft | Approved | Implemented
**Related Requirements**: FR-01, FR-02

## Actors
- **Primary**: [User role]
- **Secondary**: [System/service]

## Preconditions
- [Condition 1]

## Main Flow
1. [Step 1]
2. [Step 2]

## Alternative Flows
### A1: [Alternative scenario]

## Postconditions
- [Expected outcome]

## Acceptance Criteria
```gherkin
Feature: [Use case name]
  Scenario: [Test scenario]
    Given [initial state]
    When [action]
    Then [expected result]
```

## UI Components Used
- **Mockup Reference**: `design/mockups/screenshots/XX-screen-name.png`
- **Components**: DataTable, SearchInput, FilterPanel
- **Patterns**: See `COMPONENT-PATTERNS.md` section X

## Screens Needed (Flag for Step 06)
- [ ] Detail view screen (NOT in main design)
- [ ] Edit form modal (NOT in main design)

## Non-Functional Requirements
- Performance: [target]
- Security: [requirements]
```

**Success Criteria**:
- [ ] All key use cases documented
- [ ] Technical enablers defined
- [ ] Acceptance criteria specified (Gherkin format)
- [ ] Use cases traceable to BRD requirements
- [ ] Use case diagrams created
- [ ] UI component references included
- [ ] Screens needing creation flagged for Step 06

---

### Step 06: Technical Specifications

**Objective**: Create detailed technical specifications for backend and frontend + additional mockups as needed

**Input**:
- `arch-to-be/enablers/UC-*.md` (from Step 05) - includes "Screens Needed" flags
- `arch-to-be/enablers/UC-SUMMARY.md` - screens needed list
- `arch-to-be/design/UI-STYLE-GUIDE.md` (from Step 04)
- `arch-to-be/design/COMPONENT-PATTERNS.md` (from Step 04)
- `arch-to-be/05-building-block-view.md`

**Template**: `.ai/2_templates/spec-template.md`

**Activities**:

#### Backend Specifications

For each use case, create backend spec:

1. **API Endpoints**
   ```
   POST /api/v1/addresses/search
   GET /api/v1/addresses/{id}
   PUT /api/v1/addresses/{id}/coordinates
   ```

   Document for each endpoint:
   - HTTP method and path
   - Request schema (JSON)
   - Response schema (JSON)
   - Authentication requirements (JWT, OAuth2)
   - Rate limiting (requests/minute)
   - Error responses (400, 401, 404, 500)

2. **Business Logic**
   - Validation rules
   - Processing steps (workflow)
   - Error handling strategy
   - Transaction boundaries
   - Retry and idempotency

3. **Data Access**
   - Database operations (CRUD)
   - Entity relationships
   - Caching strategy (Redis, in-memory)
   - Query optimization

#### Frontend Specifications

For each use case, create frontend spec:

1. **UI Components**
   - Component hierarchy (React/Vue/Angular)
   - Props and state management
   - Event handlers
   - Validation (client-side)

2. **Pages and Flows**
   - Page layouts (wireframes)
   - Navigation flows
   - Form designs
   - Error states and loading states

3. **Integration**
   - API calls (axios, fetch)
   - State management (Redux, Zustand, Context)
   - Loading and error handling
   - Optimistic UI updates

#### Additional Mockups (from Use Case Flags)

Create mockups for screens flagged in Step 05 Use Cases:

1. **Review UC-SUMMARY.md** for "Screens Needed" list
2. **Create HTML mockups** using same approach as Step 04
3. **Follow design system** (UI-STYLE-GUIDE.md, COMPONENT-PATTERNS.md)
4. **Screenshot with Playwright MCP**
5. **Reference in specification document**

**Output**:

Backend: `arch-to-be/specifications/backend/AR-BE-*.md`
- `AR-BE-FR01-address-search.md`
- `AR-BE-FR11-vrk-import.md`
- `AR-BE-FR12-finnish-validation.md`

Frontend: `arch-to-be/specifications/frontend/AR-FE-*.md`
- `AR-FE-US01-search-ui.md`
- `AR-FE-US02-detail-view.md`
- `AR-FE-US03-validation-results.md`

Additional Mockups: `arch-to-be/specifications/mockups/`
- `html/` - Source HTML files
- `screenshots/` - PNG images

**Specification Structure**:
```markdown
# [AR-BE-FR01]: Address Search API

## Overview
**Feature**: Address Search
**Type**: Backend API
**Priority**: MUST
**Related Use Cases**: UC-01

## API Specification

### Endpoint: POST /api/v1/addresses/search
**Authentication**: JWT Bearer token
**Rate Limit**: 100 requests/minute

**Request Schema**:
```json
{
  "query": "string",
  "filters": {
    "municipality": "string",
    "postalCode": "string"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  }
}
```

**Response Schema**:
```json
{
  "data": [...],
  "pagination": {...}
}
```

## Business Logic
1. Validate input (query min length: 3)
2. Apply filters
3. Execute search (Elasticsearch/PostgreSQL)
4. Sort by relevance
5. Paginate results

## Data Access
- **Repository**: `AddressSearchRepository`
- **Caching**: Redis, TTL 5 minutes
- **Database**: Read replica for queries

## Error Handling
- 400: Invalid input
- 401: Unauthorized
- 429: Rate limit exceeded
- 500: Internal server error

## Performance Targets
- Response time: < 200ms (p95)
- Concurrent requests: 1000+
```

**Success Criteria**:
- [ ] All use cases have backend specifications
- [ ] All use cases have frontend specifications
- [ ] API contracts defined (OpenAPI/Swagger)
- [ ] Validation rules documented
- [ ] Specifications reviewable by developers
- [ ] Data models and DTOs defined
- [ ] Additional mockups created for screens flagged in Use Cases
- [ ] Sequence diagrams for key flows
- [ ] Class diagrams for domain model

**Reference Documents** (examples from this project):
- `AR-BE-FR11-vrk-import.md` - Backend spec example
- `AR-FE-US01-search-ui.md` - Frontend spec example
- `AR-Ingestion-Modernization-Spec.md` - Comprehensive feature spec

---

### Step 07: Data Model Planning

**Objective**: Design target database schema and migration strategy

**Input**:
- `artifacts/05-analysis/database/SA-14-prod-tables.md` (AS-IS schema)
- `arch-to-be/specifications/backend/AR-BE-*.md` (from Step 06)
- `arch-to-be/05-building-block-view.md`

**Activities**:

1. **Schema Design**
   - Transform Oracle PL/SQL to target database (PostgreSQL/SQL Server)
   - Normalize tables (1NF, 2NF, 3NF)
   - Define entity relationships (ERD)
   - Add new tables for new features
   - Design indexes and constraints

2. **Data Dictionary**
   - Document all tables and columns
   - Define data types
   - Document constraints (PK, FK, UNIQUE, NOT NULL)
   - Define indexes (B-tree, GIN, GIST)
   - Document triggers and stored procedures

3. **Migration Strategy**

   Common approaches:
   - **Big Bang**: Complete cutover (high risk)
   - **Parallel Run**: Old and new systems run simultaneously
   - **Incremental**: Migrate data in phases
   - **CDC (Change Data Capture)**: Real-time sync during transition

   Document:
   - Data transformation rules
   - Data cleansing requirements
   - Mapping AS-IS to TO-BE tables
   - Data validation strategy
   - Rollback plan

4. **Data Access Patterns**
   - Repository patterns
   - ORM configuration (Entity Framework, Dapper)
   - Caching strategy (Redis, in-memory)
   - Read/write splitting (CQRS)
   - Connection pooling

**Output**: `arch-to-be/implementation/DATA-MODEL.md`

**Data Model Structure**:
```markdown
# Data Model Design

## 1. Overview
**Database**: PostgreSQL 15
**Migration Source**: Oracle 19c (PL/SQL)

## 2. Entity Relationship Diagram
[ERD diagram]

## 3. Tables

### Address Table
```sql
CREATE TABLE addresses (
  id BIGSERIAL PRIMARY KEY,
  street_name VARCHAR(200) NOT NULL,
  street_number VARCHAR(20),
  postal_code VARCHAR(10),
  municipality VARCHAR(100),
  coordinates GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  version INTEGER DEFAULT 1
);

CREATE INDEX idx_addresses_postal ON addresses(postal_code);
CREATE INDEX idx_addresses_coordinates ON addresses USING GIST(coordinates);
```

## 4. Data Dictionary
| Table | Column | Type | Nullable | Default | Description |
|-------|--------|------|----------|---------|-------------|
| addresses | id | BIGSERIAL | NO | | Primary key |

## 5. Migration Strategy

### Phase 1: Schema Migration (Week 1-2)
- Create new PostgreSQL schemas
- Migrate reference data
- Validate schema

### Phase 2: Historical Data (Week 3-4)
- Bulk load historical data
- Verify data integrity

### Phase 3: CDC Setup (Week 5)
- Set up Change Data Capture
- Enable real-time sync

### Phase 4: Cutover (Week 6)
- Stop writes to Oracle
- Final sync
- Switch applications to PostgreSQL

## 6. Data Access Layer

**ORM**: Entity Framework Core 8
**Repositories**:
- `IAddressRepository`
- `IVrkImportRepository`

**Caching**:
- Redis for frequent queries
- TTL: 5-10 minutes
```

**Success Criteria**:
- [ ] All entities defined
- [ ] Relationships documented (ERD)
- [ ] Migration strategy defined with phases
- [ ] Data dictionary complete
- [ ] Data access patterns documented
- [ ] Performance optimization considered (indexes)

---

### Step 08: Test Planning

**Objective**: Define comprehensive test strategy and test plans, including visual testing

**Input**:
- `arch-to-be/specifications/backend/AR-BE-*.md` (from Step 06)
- `arch-to-be/specifications/frontend/AR-FE-*.md` (from Step 06)
- `arch-to-be/enablers/UC-*.md` (from Step 05)
- `arch-to-be/design/mockups/screenshots/` (from Step 04 - visual test baselines)

**Activities**:

1. **End-to-End Test Plans**

   Test user journeys:
   - User registration → search → view details → update
   - {EXTERNAL_SYSTEM_1} import → validation → sync → notification
   - Error scenarios and edge cases

   E2E test tools: Playwright, Cypress, Selenium

2. **Unit Test Specifications**

   Test coverage targets:
   - Service layer: 80%+
   - Repository layer: 70%+
   - Validation logic: 90%+
   - Frontend components: 70%+

   Unit test frameworks: xUnit, NUnit (C#), Jest (JS), pytest (Python)

3. **Integration Test Scenarios**
   - API integration tests (contract testing)
   - Database integration tests
   - External service mocks
   - Message queue integration

4. **Non-Functional Testing**

   Performance tests:
   - Load testing (JMeter, k6, Gatling)
   - Stress testing
   - Endurance testing

   Security tests:
   - Penetration testing (OWASP Top 10)
   - Vulnerability scanning
   - Authentication/authorization testing

   Compliance tests:
   - GDPR compliance checks
   - Accessibility testing (WCAG 2.1)

5. **Test Data Strategy**
   - Test data requirements
   - Data generation strategy (mock data, synthetic data)
   - Test data privacy (anonymization)
   - Mock services (WireMock, MockServer)

6. **Visual and UI Testing**
   - Visual regression testing (baseline screenshots from Step 04)
   - Accessibility testing (WCAG 2.1 AA)
   - Responsive testing (desktop, tablet, mobile)
   - Tools: Percy, Chromatic, Playwright, axe-core

**Output**:

E2E Tests: `arch-to-be/test-plans/e2e/AR-E2E-*.md`
- `AR-E2E-US01-search-flow.md`
- `AR-E2E-US02-update-flow.md`
- `AR-E2E-US03-sync-flow.md`

Unit Tests: `arch-to-be/test-plans/unit/AR-TEST-*.md`
- `AR-TEST-FR11-vrk-import.md`
- `AR-TEST-FR12-address-search.md`
- `AR-TEST-FR13-address-validation.md`

Visual Tests: `arch-to-be/test-plans/visual/AR-VISUAL-*.md`
- `AR-VISUAL-baseline.md` (baseline from mockups)
- `AR-VISUAL-responsive.md` (viewport tests)
- `AR-VISUAL-accessibility.md` (a11y tests)

**Test Plan Structure**:
```markdown
# [AR-E2E-US01]: Address Search Flow

## Test Metadata
**Type**: End-to-End
**Priority**: MUST
**Related Use Cases**: UC-01
**Test Tool**: Playwright

## Test Scenarios

### Scenario 1: Successful Address Search
```gherkin
Feature: Address Search
  Scenario: User searches for an address
    Given the user is on the search page
    When the user enters "Mannerheimintie 1" in the search box
    And the user clicks the "Search" button
    Then the system displays search results
    And the results contain "Mannerheimintie 1, Helsinki"
```

### Scenario 2: No Results Found
[Test steps]

### Scenario 3: Invalid Input
[Test steps]

## Test Data
- Valid addresses: [test dataset]
- Invalid inputs: [edge cases]

## Expected Results
- Response time < 2 seconds
- All results relevant to query

## Test Environment
- URL: https://test.dar.example.com
- Test user: test@example.com
```

**Success Criteria**:
- [ ] E2E test plans for all user journeys
- [ ] Unit test specs for all components
- [ ] Performance test scenarios defined
- [ ] Security test cases documented
- [ ] Test coverage targets set (e.g., 80% code coverage)
- [ ] Test data strategy defined

**Reference Documents** (examples from this project):
- `AR-E2E-US01-search-flow.md` - E2E test example
- `AR-TEST-FR11-vrk-import.md` - Unit test example

---

### Step 09: Implementation Roadmap

**Objective**: Define implementation strategy, phased delivery, and migration plan

**Input**:
- All TO-BE design artifacts from Steps 01-08
- `arch-to-be/brd/AR-BRD.md` (from Step 03)
- `arch-to-be/implementation/MODERNIZATION-OPTIONS.md` (from Step 01)
- `arch-to-be/design/UI-STYLE-GUIDE.md` (from Step 04)
- `arch-to-be/test-plans/` (from Step 08)

**Activities**:

1. **Feature Prioritization**

   **MoSCoW Method**:
   - **MUST**: Critical features (MVP)
   - **SHOULD**: Important features (Phase 2)
   - **COULD**: Nice-to-have features (Phase 3)
   - **WON'T**: Out of scope

   Prioritization criteria:
   - Business value (revenue, cost savings)
   - Technical dependencies
   - Risk level
   - User impact

2. **Implementation Phases**

   **Phase 1: Foundation (MVP)**
   - Duration: 2-3 months
   - Goal: Core functionality with essential features
   - Deliverables:
     - Authentication and authorization
     - Core APIs (search, retrieve)
     - Basic UI
     - Database migration (Phase 1)
   - Success criteria: Production-ready MVP

   **Phase 2: Extended Features**
   - Duration: 3-4 months
   - Goal: Feature parity with legacy system
   - Deliverables:
     - Advanced search
     - Update operations
     - Integration with external systems ({EXTERNAL_SYSTEM_1}, {EXTERNAL_SYSTEM_2})
     - Reporting
   - Success criteria: Legacy system can be decommissioned

   **Phase 3: Advanced Features**
   - Duration: 2-3 months
   - Goal: New capabilities beyond legacy
   - Deliverables:
     - AI-powered search
     - Analytics dashboard
     - Mobile app
     - Performance optimizations
   - Success criteria: Full feature set deployed

3. **Incremental Delivery**

   **MVP (Minimum Viable Product)**:
   - Define minimum feature set for production
   - Focus on highest business value
   - Target: 3-month delivery

   **Feature Slicing**:
   - Vertical slices (end-to-end features)
   - Horizontal slices (layers/components)

   **Release Planning**:
   - Sprint duration: 2 weeks
   - Release frequency: Every 2-4 sprints
   - Release strategy: Blue-green deployment

4. **Migration Strategy**

   **Approaches**:

   a) **Parallel Run**:
   - Run old and new systems simultaneously
   - Gradual traffic shift: 10% → 25% → 50% → 100%
   - Comparison testing (shadow mode)
   - Duration: 1-2 months

   b) **Strangler Fig Pattern**:
   - Incrementally replace legacy components
   - API facade in front of legacy
   - Route traffic to new services progressively
   - Duration: 6-12 months

   c) **Big Bang** (not recommended):
   - Complete cutover in one event
   - High risk
   - Only for small systems

   **Data Migration**:
   - Phase 1: Reference data (lookups, catalogs)
   - Phase 2: Transactional data (current records)
   - Phase 3: Historical data (archives)
   - CDC for real-time sync during transition

5. **Deployment Strategy**

   **CI/CD Pipeline**:
   - Source control: Git (GitHub, GitLab, Azure DevOps)
   - Build: GitHub Actions, Azure Pipelines, Jenkins
   - Automated tests: Unit, integration, E2E
   - Deployment: Kubernetes, Docker, Azure App Service

   **Environments**:
   - **Development**: Developer workstations
   - **Testing**: Automated test execution
   - **Staging**: Production-like environment
   - **Production**: Live environment

   **Deployment Patterns**:
   - Blue-green deployment (zero downtime)
   - Canary releases (gradual rollout)
   - Feature flags (A/B testing, gradual enablement)

6. **Risk Management**

   **Technical Risks**:
   - Data migration failures → Mitigation: Dry runs, validation
   - Performance degradation → Mitigation: Load testing, monitoring
   - Integration failures → Mitigation: Contract testing, mocks

   **Business Risks**:
   - User adoption → Mitigation: Training, change management
   - Schedule delays → Mitigation: Buffer time, prioritization
   - Budget overrun → Mitigation: Cost tracking, scope management

**Output**: `arch-to-be/implementation/IMPLEMENTATION-ROADMAP.md`

**Roadmap Structure**:
```markdown
# Implementation Roadmap

## Executive Summary
[1-2 paragraph overview of the implementation approach]

## Implementation Phases

### Phase 1: Foundation (MVP) - Months 1-3
**Goal**: Deploy production-ready MVP with core functionality

**Features**:
- FR-01: Address Search - Priority: MUST
- FR-02: Address Retrieval - Priority: MUST
- NFR-01: Authentication - Priority: MUST

**Deliverables**:
- Address Search API
- Basic UI
- Database migration (reference data)
- CI/CD pipeline

**Risks**:
- Data migration complexity - **Mitigation**: Dry runs, validation scripts

**Success Criteria**:
- MVP deployed to production
- 100 concurrent users supported
- 99% uptime

### Phase 2: Extended Features - Months 4-6
[Similar structure]

### Phase 3: Advanced Features - Months 7-9
[Similar structure]

## Feature Prioritization Matrix

| Feature | Priority | Business Value | Technical Complexity | Dependencies | Phase |
|---------|----------|----------------|---------------------|--------------|-------|
| Address Search | MUST | High | Medium | Database | Phase 1 |
| {EXTERNAL_SYSTEM_1} Import | MUST | High | High | Address Search | Phase 2 |
| Analytics | COULD | Medium | Low | Reporting | Phase 3 |

## Migration Strategy

### Parallel Run Approach (Recommended)

**Timeline**: 2 months

**Week 1-2: Preparation**
- Set up monitoring for both systems
- Configure traffic routing (API Gateway)

**Week 3-4: 10% Traffic**
- Route 10% of traffic to new system
- Compare results with legacy
- Monitor errors and performance

**Week 5-6: 50% Traffic**
- Increase to 50%
- Validate at scale

**Week 7-8: 100% Traffic**
- Full cutover
- Keep legacy as fallback for 2 weeks

### Data Migration

**Phase 1: Reference Data (Week 1)**
- Municipalities, postal codes, street names
- Validation: 100% accuracy

**Phase 2: Transactional Data (Week 2-3)**
- Current addresses (active records)
- Validation: Spot checks, data integrity tests

**Phase 3: Historical Data (Week 4-6)**
- Archived addresses
- Validation: Sampling

**Change Data Capture (Ongoing)**
- Real-time sync during parallel run
- Tools: Debezium, AWS DMS

## Deployment Strategy

### CI/CD Pipeline

```
Code Push → Build → Unit Tests → Integration Tests → Deploy to Test
         → Deploy to Staging → E2E Tests → Manual Approval
         → Deploy to Production (Blue-Green)
```

### Environments

| Environment | Purpose | Deployment | Data |
|-------------|---------|------------|------|
| Development | Developer testing | On commit | Mock data |
| Testing | Automated tests | On merge to main | Synthetic data |
| Staging | Production-like | Nightly | Anonymized prod data |
| Production | Live | Manual approval | Real data |

### Rollback Strategy

- Blue-green deployment allows instant rollback
- Database migrations are backward-compatible
- Feature flags allow disabling features without deployment

## Resource Plan

**Team Structure**:
- 2 Backend Developers (.NET, PostgreSQL)
- 1 Frontend Developer (React, TypeScript)
- 1 DevOps Engineer (Kubernetes, Azure)
- 1 QA Engineer (Playwright, E2E)
- 0.5 Architect (part-time oversight)

**Timeline**: 9 months total
**Budget**: [Estimate based on team + infrastructure]

## Success Metrics

**Technical Metrics**:
- Code coverage: >80%
- API response time: <200ms (p95)
- Uptime: >99.9%
- Deployment frequency: Weekly

**Business Metrics**:
- User adoption: 90% within 3 months
- Data accuracy: 99.9%
- Cost savings: 30% reduction in infrastructure costs
```

**Success Criteria**:
- [ ] Features prioritized by business value
- [ ] Implementation phases defined (3 phases recommended)
- [ ] Dependencies identified and planned
- [ ] Migration strategy documented
- [ ] Timeline estimates provided
- [ ] Deployment strategy defined (CI/CD)
- [ ] Risk mitigation strategies documented
- [ ] Resource plan created
- [ ] Stakeholder approval obtained

**Reference Documents** (examples from this project):
- `Architecture-Modernization-Roadmap.md` - Comprehensive roadmap
- `Internal-Refactoring-Roadmap.md` - Refactoring plan
- `strangler-fig-implementation-plan.md` - Migration pattern

---

## Deliverables

### Primary Deliverables

**Arc42 Documentation** (`arch-to-be/`):
- 01-introduction-goals.md
- 02-architecture-constraints.md
- 03-context-scope.md
- 04-solution-strategy.md ✓ (Step 02)
- 05-building-block-view.md ✓ (Step 02)
- 06-runtime-view.md ✓ (Step 06)
- 07-deployment-view.md ✓ (Step 06)
- 08-domain-rules-and-guidelines.md
- 09-architecture-decisions.md ✓ (Step 02)
- 10-quality-requirements.md
- 11-risks-technical-debt.md
- 12-glossary.md

**Implementation Artifacts** (`arch-to-be/implementation/`):
- MODERNIZATION-OPTIONS.md ✓ (Step 01)
- IMPLEMENTATION-ROADMAP.md ✓ (Step 09)
- DATA-MODEL.md ✓ (Step 07)

**Design System** (`arch-to-be/design/`):
- UI-STYLE-GUIDE.md ✓ (Step 04)
- COMPONENT-PATTERNS.md ✓ (Step 04)
- mockups/html/ ✓ (Step 04)
- mockups/screenshots/ ✓ (Step 04)

**Specifications** (`arch-to-be/specifications/`):
- backend/AR-BE-*.md ✓ (Step 06)
- frontend/AR-FE-*.md ✓ (Step 06)
- mockups/ ✓ (Step 06 - additional screens)

**Use Cases** (`arch-to-be/enablers/`):
- UC-*.md ✓ (Step 05)
- UC-SUMMARY.md ✓ (Step 05)

**Architecture Decisions** (`arch-to-be/adr/`):
- ADR-XXX-*.md ✓ (Step 02)

**Business Requirements** (`arch-to-be/brd/`):
- AR-BRD.md ✓ (Step 03)

**Test Plans** (`arch-to-be/test-plans/`):
- e2e/AR-E2E-*.md ✓ (Step 08)
- unit/AR-TEST-*.md ✓ (Step 08)
- visual/AR-VISUAL-*.md ✓ (Step 08)

**Diagrams** (`arch-to-be/diagrams/`):
- sequence/ ✓ (Step 06)
- class/ ✓ (Step 06)
- dataflow/ ✓ (Step 06)

---

## Quality Gates

**IMPORTANT**: This workflow has **2 mandatory blocking gates** and **5 optional quality checkpoints**.

### MANDATORY Gate 1: After Step 01 (Modernization Options) - BLOCKING

**AI MUST use AskUserQuestion tool and WAIT for approval**

**Review Criteria**:
- [ ] All options thoroughly evaluated
- [ ] Technology stack selection justified
- [ ] Risk assessment comprehensive
- [ ] Stakeholder consensus on recommended option

**Procedure**: See [steps/gates/gate-01-modernization-review.md](steps/gates/gate-01-modernization-review.md)

**Reviewers**: Technical lead, Product owner, Architect

---

### Optional Checkpoint: After Step 02 (Architecture Planning) - NON-BLOCKING

**AI should generate documentation but NOT stop for approval**
**Review Criteria**:
- [ ] Architecture aligns with selected modernization option
- [ ] ADRs documented for key decisions
- [ ] Component boundaries clear and logical
- [ ] Integration patterns well-defined

**Reviewers**: Architect, Technical lead

### Optional Checkpoint: After Step 03 (BRD) - NON-BLOCKING

**AI should generate documentation but NOT stop for approval**

**Review Criteria**:
- [ ] All functional requirements captured
- [ ] Non-functional requirements quantified
- [ ] Requirements prioritized (MoSCoW)
- [ ] Business value clearly articulated
- [ ] User personas and key screens identified

**Reviewers**: Product owner, Business stakeholders

### Optional Checkpoint: After Step 04 (UI Design Guidelines) - NON-BLOCKING

**AI should generate documentation but NOT stop for approval**

**Review Criteria**:
- [ ] Style guide complete (colors, typography, spacing)
- [ ] Main screens have high-fidelity mockups
- [ ] Component patterns documented
- [ ] Design consistent with brand guidelines

**Reviewers**: UX Designer, Product owner

### Optional Checkpoint: After Step 06 (Technical Specifications) - NON-BLOCKING

**AI should generate documentation but NOT stop for approval**

**Review Criteria**:
- [ ] API contracts complete and consistent
- [ ] Data models defined
- [ ] Specifications traceable to requirements
- [ ] Validation rules comprehensive
- [ ] Additional mockups created for flagged screens

**Reviewers**: Development team, QA lead

### Optional Checkpoint: After Step 08 (Test Planning) - NON-BLOCKING

**AI should generate documentation but NOT stop for approval**

**Review Criteria**:
- [ ] Test coverage adequate (target: 80%)
- [ ] E2E scenarios cover all user journeys
- [ ] Non-functional test plans defined
- [ ] Test data strategy documented
- [ ] Visual regression baseline defined

**Reviewers**: QA lead, Development team

### Optional Checkpoint: After Step 09 (Implementation Roadmap) - NON-BLOCKING

**AI should generate documentation but NOT stop for approval**

**Review Criteria**:
- [ ] Roadmap aligns with business priorities
- [ ] Migration strategy risk-appropriate
- [ ] Resource plan realistic
- [ ] Success metrics defined

**Reviewers**: Executive sponsor, Product owner, Architect

---

### MANDATORY Gate 2: After Step 10 (Summary Documentation) - BLOCKING

**AI MUST use AskUserQuestion tool and WAIT for approval**

**Review Criteria**:
- [ ] All Arc42 TO-BE sections complete (12 sections)
- [ ] BRD comprehensive and business-aligned
- [ ] UI Design Guidelines and mockups complete
- [ ] Technical specifications traceable to requirements
- [ ] Test plans cover all use cases
- [ ] Implementation roadmap realistic and phased
- [ ] All ADRs documented for key decisions

**Procedure**: See [steps/10-summary-documentation.md](steps/10-summary-documentation.md)

**Reviewers**: Executive sponsor, Product owner, Architect, Technical lead

**AI Action**: Present completion summary and use AskUserQuestion with options: APPROVE / REVISE SECTIONS / MAJOR REVISIONS REQUIRED

---

## Common Patterns

### Pattern 1: Strangler Fig Migration

**Use When**: Incrementally replacing legacy system

**Approach**:
1. Create API facade in front of legacy
2. Implement new features in new system
3. Gradually route traffic from legacy to new
4. Decommission legacy components incrementally

**Benefits**:
- Low risk (incremental)
- Continuous delivery
- Rollback capability

**Example ADR**: `ADR-XXX-strangler-fig-pattern.md`

---

### Pattern 2: Parallel Run

**Use When**: Need to validate new system at scale

**Approach**:
1. Deploy new system alongside legacy
2. Route traffic to both systems
3. Compare results (shadow mode)
4. Gradually shift traffic: 10% → 50% → 100%

**Benefits**:
- Validation at scale
- Easy rollback
- Confidence building

**Example Document**: `strangler-fig-implementation-plan.md`

---

### Pattern 3: Big Bang Migration

**Use When**: Small system, short cutover window

**Approach**:
1. Complete all development
2. Prepare data migration scripts
3. Schedule downtime window
4. Execute full cutover

**Benefits**:
- Simple to plan
- No dual-run complexity

**Risks**:
- High risk if issues arise
- Potential for extended downtime

**Recommendation**: Avoid for critical systems

---

## Tool Integration

### Context7 MCP for Arc42 Guidance

Query Arc42 documentation for best practices:

```javascript
mcp__context7__query-docs({
  libraryId: "/arc42/arc42-template",
  query: "How to document runtime view in Arc42?"
})
```

### Knowledge Graph for Requirement Traceability

Track relationships between requirements, use cases, specs:

```javascript
mcp__knowledge-graph__create_relations({
  relations: [
    {
      from: "FR-01-Address-Search",
      to: "UC-01-Search-Use-Case",
      relationType: "implements"
    },
    {
      from: "UC-01-Search-Use-Case",
      to: "AR-BE-FR01-address-search",
      relationType: "specified-in"
    }
  ]
})
```

---

## Validation Checklist

Before considering TO-BE design complete:

**Arc42 Documentation**:
- [ ] All 12 Arc42 sections populated with content
- [ ] Diagrams created and consistent
- [ ] Cross-references between sections work
- [ ] Documentation reviewed by stakeholders

**Specifications**:
- [ ] All use cases have backend specs
- [ ] All use cases have frontend specs
- [ ] API contracts defined (OpenAPI/Swagger)
- [ ] Data models documented

**Test Plans**:
- [ ] E2E test plans for all user journeys
- [ ] Unit test coverage targets set
- [ ] Performance test scenarios defined
- [ ] Security test cases documented

**Implementation Readiness**:
- [ ] Roadmap approved by stakeholders
- [ ] Migration strategy validated
- [ ] Resource plan finalized
- [ ] Risk mitigation strategies in place

---

## Next Steps After TO-BE Design

Once TO-BE design is complete:

1. **Implementation Phase**
   - Set up development environment
   - Configure CI/CD pipeline
   - Begin Sprint 0 (foundation)

2. **Stakeholder Alignment**
   - Present TO-BE design to executives
   - Get budget approval
   - Finalize team composition

3. **Preparation**
   - Provision infrastructure (cloud resources)
   - Set up monitoring and observability
   - Create test environments

---

**Last Updated**: 2026-01-07
**Status**: Template ready for use
**Maintainer**: Architecture Team
